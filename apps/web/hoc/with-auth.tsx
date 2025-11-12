"use client";

import { api } from "@workspace/backend/_generated/api";
import { LoadingScreen } from "@workspace/ui/components/loading-screen";
import { useConvexAuth, useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import {
  type ComponentType,
  createContext,
  useContext,
  useEffect,
} from "react";
import type { User } from "@/types/schema";

type UserContextType = {
  user: User | null;
};

export type PropsWithUser<P = object> = P & UserContextType;

export const UserContext = createContext<UserContextType>({
  user: null,
});

export function useUser() {
  return useContext(UserContext);
}

export function withAuth<T extends object>(WrappedComponent: ComponentType<T>) {
  function ProtectedPage(props: T) {
    const { isAuthenticated, isLoading } = useConvexAuth();

    const router = useRouter();
    const pathname = usePathname();

    const user = useQuery(api.web.user.get, isAuthenticated ? {} : "skip");

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace(`/auth?origin=${encodeURIComponent(pathname)}`);
      }
    }, [isLoading, isAuthenticated, pathname, router]);

    if (isLoading) {
      return <LoadingScreen />;
    }

    if (!isAuthenticated) {
      return null;
    }

    if (user === undefined) {
      return <LoadingScreen />;
    }

    if (!user) {
      router.replace(`/auth?origin=${encodeURIComponent(pathname)}`);
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  ProtectedPage.displayName = `withAuth(${
    WrappedComponent.displayName ?? WrappedComponent.name ?? "Auth Component"
  })`;

  return ProtectedPage;
}
