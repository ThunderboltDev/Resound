"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { sendGTMEvent } from "@next/third-parties/google";
import { config } from "@workspace/config";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormSubmitError,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { z } from "zod";

const errorMessages: Record<string, string> = {
  Configuration: "There was a problem with the server.",
  AccessDenied: "Access denied.",
  Verification: "Verification failed! Please try again.",
  OAuthAccountNotLinked:
    "This email is already in use. Sign in with the provider you used originally.",
  Callback: "Error during sign-in. Please try again.",
  EmailSignin: "Error sending magic link. Try again.",
  Signin: "Something went wrong!",
  OAuthSignIn: "Could not sign in with provider.",
  OAuthCallbackError: "Login failed during provider callback.",
  OAuthCreateAccount: "Could not create account with provider.",
  EmailCreateAccount: "Could not create account with email.",
  SessionRequired: "Please sign in to continue.",
  Default: "Something went wrong!",
};

const formSchema = z.object({
  email: z.email("Please enter a valid email!"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useSearchParams();

  const origin = params.get("origin") || "/org";
  const email = params.get("email") ?? "";
  const errorCode = params.get("error");

  useEffect(() => {
    if (errorCode) {
      setError(errorMessages[errorCode] ?? "Something went horribly wrong!");
    }
  }, [errorCode]);

  const form = useForm<FormValues>({
    mode: "onSubmit",
    resolver: zodResolver(formSchema),
    defaultValues: {
      email,
    },
  });

  const handleProvider = async (provider: "google" | "github") => {
    setError(null);
    setIsLoading(true);

    sendGTMEvent({
      event: "auth",
      action: "login_attempt",
      provider: provider,
      value: 1,
    });

    try {
      await signIn(provider, { redirectTo: origin });
    } catch (error) {
      sendGTMEvent({
        event: "auth",
        action: "login_failed",
        error: error,
        provider: provider,
        value: 1,
      });

      console.error(error);
      setError("Something went wrong! Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async ({ email }: FormValues) => {
    setError(null);
    setIsLoading(true);

    sendGTMEvent({
      event: "auth",
      action: "login_attempt",
      provider: "email",
      value: 1,
    });

    try {
      const result = await signIn("nodemailer", {
        redirect: false,
        email,
      });

      if (result?.error) {
        sendGTMEvent({
          event: "auth",
          action: "login_failed",
          provider: "email",
          error: result.error,
          value: 1,
        });

        setError("Unable to authenticate right now! Try again later.");
      } else {
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      sendGTMEvent({
        event: "auth",
        action: "login_failed",
        provider: "email",
        error: "unknown",
        value: 1,
      });

      console.error("signIn error:", error);
      setError("Something went wrong! Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid h-screen place-items-center bg-radial-[circle_at_center] from-primary/15 to-background">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            <h1>
              Welcome To{" "}
              <span className="flex items-center justify-center gap-2">
                <Image
                  className="size-10"
                  src="/logo.webp"
                  alt="Resound Logo"
                  width={200}
                  height={200}
                />
                <span className=" bg-linear-160 from-primary to-sky-600 bg-clip-text text-transparent">
                  {config.name}
                </span>
              </span>
            </h1>
          </CardTitle>
          <CardDescription>
            <p className="text-center text-base">
              Create an account or login to continue!
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormSubmitError className="mt-3">{error}</FormSubmitError>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              variant="outline"
              disabled={isLoading}
              aria-busy={isLoading}
              onClick={async () => handleProvider("google")}
            >
              <FaGoogle />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              disabled={isLoading}
              aria-busy={isLoading}
              onClick={async () => handleProvider("github")}
            >
              <FaGithub />
              Continue with GitHub
            </Button>
          </div>
          <div className="relative my-5 h-0.25 w-full bg-muted-foreground">
            <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 bg-secondary p-1 text-muted-foreground text-xs">
              OR
            </span>
          </div>
          <Form {...form}>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleSubmit)();
              }}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="email"
                        placeholder="Email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormError />
                  </FormItem>
                )}
              />
              <Button
                theme="primary"
                variant="default"
                className="w-full"
                disabled={isLoading}
                aria-busy={isLoading}
                type="submit"
              >
                <Mail className="size-4.5" />
                Continue with Email
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="mt-6 text-center text-muted-foreground text-xs">
            By continuing, you agree to our{" "}
            <Link
              href="/terms-of-service"
              rel="noopener noreferrer"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              rel="noopener noreferrer"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
