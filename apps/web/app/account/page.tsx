import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import Account from "./account";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Manage your PDF Pal account, view subscription details, see account information, and update your personal information securely!",
  keywords: [
    "PDF Pal account",
    "PDF Pal user",
    "PDF Pal account information",
    "PDF Pal user information",
    "PDF Pal update account",
    "PDF Pal delete account",
    "PDF Pal view subscription",
  ],
};

export default async function AccountWrapper() {
  const session = await auth();

  if (!session?.user?.email) {
    return redirect(`/auth?origin=${encodeURIComponent("/account")}`);
  }

  return <Account session={session} />;
}
