import { NextResponse } from "next/server";

const AUTH_ROUTES = ["/auth", "/check-email"];

const PRIVATE_ROUTES = ["/dashboard", "/account"];

const sessionCookieRegex = /\b(?:__Secure-)?authjs\.session-token=/;

export default function proxy(req: Request & { nextUrl: URL }) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname === "/logout") {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("__Secure-authjs.session-token", "", {
      path: "/",
      expires: new Date(0),
    });
    res.cookies.set("authjs.session-token", "", {
      path: "/",
      expires: new Date(0),
    });
    return res;
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const isAuthenticated = sessionCookieRegex.test(cookieHeader);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  const isPrivateRoute = PRIVATE_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isInternalRoute =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image");

  if (isInternalRoute) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    if (isAuthRoute) {
      const res = NextResponse.next();
      res.cookies.delete("authjs.session-token");
      res.cookies.delete("__Secure-authjs.session-token");
      return res;
    }

    if (isPrivateRoute) {
      const redirectUrl = new URL("/auth", req.url);
      redirectUrl.searchParams.set("origin", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAuthRoute && isAuthenticated) {
    const origin = searchParams.get("origin");

    if (!origin || AUTH_ROUTES.includes(origin)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL(origin, req.url));
    }
  }

  const res = NextResponse.next();

  const userAgent = req.headers.get("user-agent") || "Unknown User Agent";

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip")?.split(",")[0] ??
    req.headers.get("cf-connecting-ip")?.split(",")[0] ??
    "Unknown IP";

  res.cookies.set("client-ip", ip, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  res.cookies.set("client-ua", userAgent, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
};
