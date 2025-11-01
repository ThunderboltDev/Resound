"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Provider } from "jotai";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("env variable NEXT_PUBLIC_CONVEX_URL is missing");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ConvexProvider client={convex}>
        <Provider>{children}</Provider>
      </ConvexProvider>
    </NextThemesProvider>
  );
}
