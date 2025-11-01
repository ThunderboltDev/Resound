"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
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
import { Spinner } from "@workspace/ui/components/spinner";
import { useMutation } from "convex/react";
import { HousePlus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const sanitizeSlug = (slug: string) => {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(20, "Name cannot be longer than 20 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(20, "Slug cannot be longer than 20 characters")
    .regex(/^[a-z0-9-]+$/, {
      error: "Slug can only contain lowercase letters, numbers, and dashes.",
    }),
});

export function CreateOrganization() {
  const createOrg = useMutation(api.organization.createOrganization);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const name = form.watch("name");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    toast.success("Organization created successfully!");
    try {
      const sanitizedSlug = sanitizeSlug(values.slug);
      await createOrg({
        name: values.name,
        slug: sanitizedSlug,
      });
      form.reset();
      toast.success("Organization created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create organization.");
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: auto generate slug
  useEffect(() => {
    if (!name) return;
    const autoSlug = sanitizeSlug(name);
    form.setValue("slug", autoSlug, { shouldValidate: false });
  }, [name]);

  return (
    <div className="grid place-items-center h-screen">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            <h4>Create Organization</h4>
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc" {...field} />
                    </FormControl>
                    <FormError />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="acme" {...field} />
                    </FormControl>
                    <FormDescription>
                      Only lowercase letters, numbers, and dashes allowed.
                    </FormDescription>
                    <FormError />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? <Spinner /> : <HousePlus />}
                Create Organization
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
