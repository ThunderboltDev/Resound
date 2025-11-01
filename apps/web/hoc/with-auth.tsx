"use client";

import { Loader } from "@workspace/ui/components/loader";
import { useConvexAuth } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentType, useEffect } from "react";

export function withAuth<T extends object>(WrappedComponent: ComponentType<T>) {
  function ProtectedPage(props: T) {
    const { isAuthenticated, isLoading } = useConvexAuth();

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        const origin = encodeURIComponent(pathname);
        router.replace(`/auth?origin=${origin}`);
      }
    }, [isLoading, isAuthenticated, pathname, router]);

    if (isLoading) return <Loader />;

    if (!isAuthenticated) return null;

    return <WrappedComponent {...props} />;
  }

  ProtectedPage.displayName = `withConfetti(${
    WrappedComponent.displayName ?? WrappedComponent.name ?? "Auth Component"
  })`;

  return ProtectedPage;
}
