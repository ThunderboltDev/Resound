"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
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
import { useMutation, useQuery } from "convex/react";
import { Link } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import WebsitesDisplay from "@/app/(dashboard)/websites/display";
import {
  PageBody,
  PageDescription,
  PageHeader,
  PageTitle,
  PageWrapper,
} from "@/components/ui/page";

const formSchema = z.object({
  url: z.httpUrl("Invalid URL"),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Websites() {
  const linkWebsite = useMutation(api.web.website.link);

  const websites = useQuery(api.web.website.getAll);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async ({ url }: FormSchema) => {
    try {
      await linkWebsite({ url });

      form.setValue("url", "");
      toast.success("Website added");
    } catch {
      toast.error("Something went wrong!");
    }
  };

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Websites</PageTitle>
        <PageDescription>
          Add websites the AI can use to answer questions
        </PageDescription>
      </PageHeader>
      <PageBody>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      autoComplete="url"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormError />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              theme="primary"
              variant="default"
              disabled={form.formState.isSubmitting}
              aria-busy={form.formState.isSubmitting}
            >
              <Link />
              Link Website
            </Button>
          </form>
        </Form>
        <WebsitesDisplay websites={websites} />
      </PageBody>
    </PageWrapper>
  );
}
