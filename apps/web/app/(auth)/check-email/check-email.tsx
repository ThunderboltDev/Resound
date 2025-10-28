"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import { Button } from "@workspace/ui/components/button";
import { RotateCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  if (!email) {
    router.replace("/auth");
    return;
  }

  return (
    <div className="grid h-screen place-items-center bg-linear-110 from-primary/25 via-background to-accent/25 p-4">
      <div className="container-md flex flex-col rounded-lg bg-secondary p-6 text-center shadow-2xl">
        <h2>Check your email</h2>
        <p className="my-2 text-center text-sm">
          We sent a magic sign-in link to <strong>{email}</strong>.
        </p>
        <p className="text-center text-sm">
          Didn&apos;t receive it? Check your spam folder or try again.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            className="hover:[&_svg]:-rotate-360"
            onClick={() => {
              sendGTMEvent({
                event: "auth",
                action: "retry_email_verification",
                value: 1,
              });

              router.replace(`/auth?email=${encodeURIComponent(email)}`);
            }}
            variant="primary"
          >
            <RotateCw className="transition-transform duration-500" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
