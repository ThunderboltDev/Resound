"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { config } from "@workspace/config";
import { Toaster } from "@workspace/ui/components/sonner";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { MotionConfig } from "framer-motion";
import dynamic from "next/dynamic";
import type { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useMemo } from "react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("env variable NEXT_PUBLIC_CONVEX_URL is missing");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const ThemeToggle = dynamic(() => import("@/components/app/theme-toggle"), {
  ssr: false,
});

type ProvidersProps = {
  children: ReactNode;
  session: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <SessionProvider session={session}>
        <ConvexProviderWithAuth useAuth={useAuth} client={convex}>
          <MotionConfig reducedMotion="user">
            <GoogleTagManager gtmId={config.gtmId} />
            <ThemeToggle />
            <Toaster />
            {children}
          </MotionConfig>
        </ConvexProviderWithAuth>
      </SessionProvider>
    </ThemeProvider>
  );
}

function useAuth() {
  const { data: session, update } = useSession();
  const convexToken = convexTokenFromSession(session);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only care about user
  return useMemo(
    () => ({
      isLoading: false,
      isAuthenticated: session !== null,
      fetchAccessToken: async ({
        forceRefreshToken,
      }: {
        forceRefreshToken: boolean;
      }) => {
        if (forceRefreshToken) {
          const newSession = await update();

          return convexTokenFromSession(newSession);
        }
        return convexToken;
      },
    }),
    [JSON.stringify(session?.user)]
  );
}

function convexTokenFromSession(session: Session | null): string | null {
  return session?.convexToken ?? null;
}
