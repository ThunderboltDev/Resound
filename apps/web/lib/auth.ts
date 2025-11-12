import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";

import axios from "axios";
import { importPKCS8, SignJWT } from "jose";
import { cookies } from "next/headers";

import NextAuth, { type NextAuthResult } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { createTransport } from "nodemailer";

import { ConvexAdapter } from "@/lib/adapter";
import { convex } from "@/lib/convex";

export const runtime = "node";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("env variable NEXT_PUBLIC_CONVEX_URL is missing");
}

if (!process.env.CONVEX_AUTH_PRIVATE_KEY) {
  throw new Error("env variable CONVEX_AUTH_PRIVATE_KEY is missing");
}

if (!process.env.CONVEX_AUTH_ADAPTER_SECRET) {
  throw new Error("env variable CONVEX_AUTH_ADAPTER_SECRET is missing");
}

const secret = process.env.CONVEX_AUTH_ADAPTER_SECRET;
const authKey = process.env.CONVEX_AUTH_PRIVATE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(/.cloud$/, ".site");

type GeoResponse = {
  status: "success" | "fail";
  timezone?: string;
  country?: string;
  city?: string;
};

const nextAuth = NextAuth({
  debug: false,
  adapter: ConvexAdapter,
  providers: [
    Nodemailer({
      maxAge: 60 * 60,
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        const transport = createTransport(provider.server);

        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Verify your email: Resound`,
          text: text(),
          html: html(url),
        });

        if (result.rejected && result.rejected.length > 0) {
          throw new Error(
            `Email could not be sent: ${result.rejected.join(", ")}`
          );
        }
      },
    }),
    GitHub,
    Google,
  ],
  callbacks: {
    async signIn({ email, profile, account, user }) {
      if (email?.verificationRequest) return true;
      if (!user.email || !user.id) return false;

      const existingUser = await convex.query(api.adapter.getUserByEmail, {
        email: user.email,
        secret,
      });

      let userId: Id<"users">;

      if (existingUser) {
        await convex.mutation(api.adapter.updateUser, {
          user: {
            id: existingUser._id,
            lastLogin: Date.now(),
          },
          secret,
        });

        userId = existingUser._id;
      } else {
        const newUserId = await convex.mutation(api.adapter.createUser, {
          user: {
            name: user.name ?? profile?.name ?? "You",
            email: user.email,
            image: user.image ?? (profile?.image as string | undefined),

            lastLogin: Date.now(),
          },
          secret,
        });

        userId = newUserId;
      }

      const existingAccount = await convex.query(api.adapter.getAccount, {
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
        secret,
      });

      if (!existingAccount) {
        if (account) {
          await convex.mutation(api.adapter.linkAccount, {
            account: {
              userId: userId,
              type: account.type ?? "oauth",
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
            secret,
          });
        } else {
          await convex.mutation(api.adapter.linkAccount, {
            account: {
              userId: userId,
              type: "email",
              provider: "email",
              providerAccountId: user.email,
            },
            secret,
          });
        }
      }

      return true;
    },
    async session({ session }) {
      const privateKey = await importPKCS8(authKey, "RS256");
      const convexToken = await new SignJWT({
        sub: session.userId,
      })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setIssuer(siteUrl)
        .setAudience("convex")
        .setExpirationTime("1h")
        .sign(privateKey);

      const cookieStore = await cookies();

      const userAgent = cookieStore.get("client-ua")?.value || null;
      const ipAddress = cookieStore.get("client-ip")?.value || null;

      const sessionRecord = await convex.query(api.adapter.getSession, {
        sessionToken: session.sessionToken,
        secret,
      });

      if (!sessionRecord) {
        return { ...session, convexToken };
      }

      if (sessionRecord.userAgent !== userAgent) {
        await convex.mutation(api.adapter.updateSession, {
          session: {
            sessionToken: sessionRecord.sessionToken,
            userAgent: userAgent ?? undefined,
          },
          secret,
        });
      }

      if (
        !sessionRecord.lastActivity ||
        Date.now() - new Date(sessionRecord.lastActivity).getTime() >
          15 * 60_000
      ) {
        await convex.mutation(api.adapter.updateSession, {
          session: {
            sessionToken: sessionRecord.sessionToken,
            lastActivity: Date.now(),
          },
          secret,
        });
      }

      if (
        ipAddress &&
        !(sessionRecord.city && sessionRecord.country && sessionRecord.timezone)
      ) {
        const fields = "country,city,timezone,status";
        const url = `http://ip-api.com/json/${ipAddress}?fields=${fields}`;

        try {
          const response = await axios.get(url);
          const data: GeoResponse = response.data;

          if (data && data.status === "success") {
            await convex.mutation(api.adapter.updateSession, {
              session: {
                sessionToken: sessionRecord.sessionToken,
                timezone: data.timezone,
                country: data.country,
                city: data.city,
              },
              secret,
            });
          }
        } catch (error) {
          console.error("Unable to use ip geolocation:", error);
        }
      }

      return { ...session, convexToken };
    },
  },
  pages: {
    newUser: "/dashboard",
    signIn: "/auth",
    signOut: "/logout",
    error: "/auth",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
});

export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const handlers = nextAuth.handlers;

function text() {
  return "Resound: Verify your email";
}

function html(url: string) {
  const brandColor = "#4f39f6";

  const fontFamily = "Arial, Helvetica, sans-serif";

  const color = {
    background: "#fafafa",
    text: "#101010",
    secondaryText: "#202020",
    mutedText: "#707070",
    buttonText: "#f9f9f9",
    buttonBorder: brandColor,
    buttonBackground: brandColor,
  };

  return `
<body style="background: ${color.background}; font-family: ${fontFamily};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0"
    style="max-width: 600px; margin: auto; border-radius: 10px;" role="presentation">
    <tr>
      <td 
        align="center"
        style="padding: 10px 0px; font-size: 24px; color: ${color.text};"
      >
        Verify Your Email
      </td>
    </tr>
    <tr>
      <td
        align="center"
        style="padding: 8px 0px; font-size: 16px; color: ${color.secondaryText};"
      >
        Click the button below to verify your email for <strong>Resound</strong>.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
              <a href="${url}"
                target="_blank"
                style="font-size: 15px; color: ${color.buttonText}; text-decoration: none; border-radius: 12px; padding: 8px 20px; display: inline-block;"
              >
                Verify Email
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-top: 28px; font-size: 13px; color: ${color.mutedText}; line-height: 1.6;">
        If you did not request this, you can safely ignore this message.<br/>
        This link will expire shortly for your security.
      </td>
    </tr>
  </table>
</body>
`;
}
