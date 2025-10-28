import { Loader } from "@workspace/ui/components/loader";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import Auth from "./auth";

type AuthWrapperProps = {
  params: Promise<{ origin?: string }>;
};

export const metadata: Metadata = {
  title: "Create an Account or Login",
  description:
    "Create an account or login on PDF Pal to start interacting with your PDFs with the help of AI. Secure and fast access to all your PDF tools.",
  keywords: [
    "Echo Flow login",
    "Echo Flow signin",
    "Echo Flow signup",
    "Echo Flow authentication",
    "Echo Flow access",
    "Echo Flow create account",
  ],
};

export default async function AuthWrapper({ params }: AuthWrapperProps) {
  const session = await auth();
  const { origin } = await params;

  if (session) {
    redirect(origin ?? "/dashboard");
  }

  return (
    <Suspense fallback={<Loader />}>
      <Auth />
    </Suspense>
  );
}
