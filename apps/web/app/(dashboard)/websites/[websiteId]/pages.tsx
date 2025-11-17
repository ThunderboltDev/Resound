"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import type { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url";

const AddPageSchema = z.object({
  path: z
    .string()
    .min(1, "Path is required")
    .startsWith("/", "Path must start with /"),
  category: z.string().optional(),
});

type AddPageValues = z.infer<typeof AddPageSchema>;

interface PagesProps {
  website: Doc<"websites">;
}

export function Pages({ website }: PagesProps) {
  const addPage = useAction(api.web.page.add);

  const pages = useQuery(api.web.page.getAll, { websiteId: website._id });

  const form = useForm<AddPageValues>({
    resolver: zodResolver(AddPageSchema),
    defaultValues: {
      path: "",
      category: "",
    },
  });

  async function onSubmit(values: AddPageValues) {
    try {
      await addPage({
        websiteId: website._id,
        path: values.path,
        category: values.category,
      });

      form.reset();

      toast.success("Page added successfully");
    } catch (error) {
      toast.error(
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Something went wrong!"
      );
    }
  }

  return (
    <div className="mt-10">
      <h2 className="mb-4">Indexed Pages</h2>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="flex justify-self-end"
            variant="default"
            theme="primary"
          >
            <Plus /> Add Page
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Page</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/faq" {...field} />
                    </FormControl>
                    <FormError />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eg. Documentation, Support"
                        {...field}
                      />
                    </FormControl>
                    <FormError />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost" theme="default">
                    <X /> Close
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" variant="default" theme="primary">
                    Add Page
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <List website={website} pages={pages} />
    </div>
  );
}

interface ListProps {
  website: Doc<"websites">;
  pages: Doc<"pages">[] | undefined;
}

export function List({ pages, website }: ListProps) {
  const removePage = useMutation(api.web.page.remove);

  if (pages === undefined) {
    return (
      <div className="text-center my-6 gap-2 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center my-6 gap-2 text-muted-foreground text-sm">
        No indexed pages
      </div>
    );
  }

  const handleRemovePage = async (pageId: Id<"pages">) => {
    try {
      await removePage({ pageId });
    } catch (error) {
      toast.error(
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Something went wrong!"
      );
    }
  };

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-3">Title</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page._id}>
              <TableCell className="pl-3">{page.title}</TableCell>
              <TableCell>
                <Link
                  href={normalizeUrl(page.path, website.url)}
                  target="_blank"
                >
                  {page.path}
                </Link>
              </TableCell>
              <TableCell>
                {new Date(page._creationTime).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex items-center justify-center">
                <Button
                  className="size-8"
                  variant="transparent"
                  theme="danger"
                  size="icon"
                  onClick={() => handleRemovePage(page._id)}
                >
                  <Trash />
                  <span className="sr-only">Remove Page</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
