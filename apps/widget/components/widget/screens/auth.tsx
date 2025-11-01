import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import type { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { organizationIdAtom, widgetSessionIdAtomFamily } from "../atoms";
import WidgetHeader from "../header";

const formSchema = z.object({
  name: z
    .string("Invalid name")
    .min(3, "Name must be at least 3 characters long.")
    .max(20, "Name is too long!"),
  email: z.email("Invalid email"),
});

export default function WidgetAuthScreen() {
  const createSession = useMutation(api.widgetSession.create);
  const organizationId = useAtomValue(organizationIdAtom);

  const setWidgetSessionId = useSetAtom(
    widgetSessionIdAtomFamily(organizationId)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // if (!organizationId) {
    //   return;
    // }

    const metadata: Doc<"widgetSessions">["metadata"] = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages.join(", "),
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      hardwareConcurrency: navigator.hardwareConcurrency,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
      referrer: document.referrer,
      currentUrl: window.location.href,
    };

    const widgetSessionId = await createSession({
      name: values.name,
      email: values.email,
      organizationId: organizationId,
      metadata,
    });

    setWidgetSessionId(widgetSessionId);
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started!</p>
        </div>
      </WidgetHeader>
      <Form {...form}>
        <form
          className="flex flex-1 flex-col gap-y-4 p-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="John Smith"
                    className="bg-muted"
                    {...field}
                  />
                </FormControl>
                <FormError />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="username@example.com"
                    className="bg-muted"
                    {...field}
                  />
                </FormControl>
                <FormError />
              </FormItem>
            )}
          />
          <Button
            variant="primary"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            Continue
          </Button>
        </form>
      </Form>
    </>
  );
}
