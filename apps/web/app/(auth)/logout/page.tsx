import { LoadingScreen } from "@workspace/ui/components/loading-screen";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import Logout from "./logout";

export const metadata: Metadata = {
  title: "Logout",
  description: "Log out of your Resound account safely and securely.",
  keywords: [
    "Resound logout",
    "Resound log out",
    "Resound signout",
    "Resound sign out",
  ],
};

export default async function LogoutWrapper() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Logout />
    </Suspense>
  );
}
