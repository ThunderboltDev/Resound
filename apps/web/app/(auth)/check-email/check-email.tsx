"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
    <div className="grid h-screen place-items-center bg-radial-[circle_at_center] from-accent/15 to-background">
      <Card className="wrapper-md p-4">
        <CardHeader>
          <CardTitle>
            <h3 className="text-center">Verify Email</h3>
          </CardTitle>
          <CardDescription className="text-center w-full">
            <p>
              We sent a magic sign-in link to <strong>{email}</strong>.
            </p>
            <p>Didn&apos;t receive it? Check your spam folder or try again.</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex justify-center gap-2 w-full">
          <Button
            variant="primary"
            className="hover:[&_svg]:rotate-360"
            onClick={() => {
              sendGTMEvent({
                event: "auth",
                action: "retry_email_verification",
                value: 1,
              });

              router.replace(`/auth?email=${encodeURIComponent(email)}`);
            }}
          >
            <RotateCw className="transition-transform duration-500" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
