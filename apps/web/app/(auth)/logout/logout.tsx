"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    const logout = async () =>
      await signOut({
        redirectTo: "/auth",
      });

    logout();
  });

  return (
    <div className="grid h-view w-full place-items-center">
      <p className="animate-pulse text-secondary-foreground">
        Logging you out...
      </p>
    </div>
  );
}
