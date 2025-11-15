"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import type { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { VapiForm } from "@/app/(dashboard)/customization/vapi-form";

export const customizationFormSchema = z.object({
  greetingMessage: z
    .string()
    .max(50, "Greeting message is too long")
    .optional(),
  defaultSuggestions: z.array(
    z.string().max(50, "Suggestion is too long").optional()
  ),
  vapiSettings: z.object({
    assistantId: z.string().max(50, "Assistant ID is too long").optional(),
    phoneNumber: z.string().max(15, "Phone number is too long").optional(),
  }),
});

export type FormSchema = z.infer<typeof customizationFormSchema>;

type WidgetSettings = Doc<"widgetSettings">;

type CustomizationFormProps = {
  initialData: WidgetSettings | null;
  hasVapiPlugin: boolean;
};

export function CustomizationForm({
  initialData,
  hasVapiPlugin,
}: CustomizationFormProps) {
  const updateWidgetSettings = useMutation(api.web.widgetSetting.update);

  const form = useForm<FormSchema>({
    resolver: zodResolver(customizationFormSchema),
    defaultValues: {
      greetingMessage: initialData?.greetingMessage,
      defaultSuggestions:
        initialData?.defaultSuggestions?.length !== 0
          ? initialData?.defaultSuggestions
          : ["", "", ""],
      vapiSettings: {
        assistantId: initialData?.vapiSettings?.assistantId,
        phoneNumber: initialData?.vapiSettings?.phoneNumber,
      },
    },
  });

  const onSubmit = async (values: FormSchema) => {
    try {
      const cleaned = {
        greetingMessage: values.greetingMessage?.trim() || undefined,
        defaultSuggestions:
          values.defaultSuggestions?.filter((d) => d !== undefined) ||
          undefined,
        vapiSettings: {
          assistantId:
            values.vapiSettings.assistantId &&
            values.vapiSettings.assistantId !== "none"
              ? values.vapiSettings.assistantId.trim()
              : undefined,
          phoneNumber:
            values.vapiSettings.phoneNumber &&
            values.vapiSettings.phoneNumber !== "none"
              ? values.vapiSettings.phoneNumber.trim()
              : undefined,
        },
      };

      await updateWidgetSettings(cleaned);
      toast.success("Widget settings updated successfully");
    } catch (error) {
      console.error("Error updating widget settings:", error);
      toast.error("Failed to update widget settings");
    }
  };
  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>General Chat Settings</CardTitle>
            <CardDescription>
              Configure the general settings for your chat widget
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="greetingMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Greeting Message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Hi! How can I help you today?"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The message displayed to users when they open the chat
                    widget.
                  </FormDescription>
                  <FormError />
                </FormItem>
              )}
            />
            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="text-base mb-1">Default Suggestions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quick reply suggestions shown to users when they open the chat
                </p>
                <div className="space-y-4">
                  {(form.getValues("defaultSuggestions") ?? ["", "", ""]).map(
                    (_, index) => (
                      <FormField
                        key={crypto.randomUUID()}
                        control={form.control}
                        name={`defaultSuggestions.${index}` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suggestion {index + 1}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Suggestion ${index + 1}`}
                                {...field}
                              />
                            </FormControl>
                            <FormError />
                          </FormItem>
                        )}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasVapiPlugin && (
          <Card>
            <CardHeader>
              <CardTitle>Voice Assistant Settings</CardTitle>
              <CardDescription>
                Configure voice calling features powered by the VAPI plugin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <VapiForm form={form} disabled={form.formState.isSubmitting} />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            theme="primary"
            variant="default"
            disabled={form.formState.isSubmitting}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
