"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useMutation, useQuery } from "convex/react";
import { Globe, Phone, PhoneCall, Workflow } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import PluginCard, {
  type Feature,
} from "@/app/(dashboard)/plugins/vapi/plugin-card";
import ConnectedView from "./connected-view";

const vapiFeatures: Feature[] = [
  {
    icon: Globe,
    label: "Web voice calls",
    description: "Voice chat directly in your platform",
  },
  {
    icon: Phone,
    label: "Phone numbers",
    description: "Get dedicated business phone numbers",
  },
  {
    icon: PhoneCall,
    label: "Outbound calls",
    description: "Automated customer outreach",
  },
  {
    icon: Workflow,
    label: "Workflows",
    description: "Custom conversation flows",
  },
];

const formSchema = z.object({
  publicApiKey: z.string("Public API key is required"),
  privateApiKey: z.string("Private API key is required"),
});

export default function VapiView() {
  const vapiPlugin = useQuery(api.web.plugin.get, {
    service: "vapi",
  });

  const [connectOpen, setConnectOpen] = useState<boolean>(false);
  const [removeOpen, setRemoveOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    if (vapiPlugin) {
      setRemoveOpen(true);
    } else {
      setConnectOpen(true);
    }
  };

  return (
    <>
      <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
      <VapiPluginRemoveForm open={removeOpen} setOpen={setRemoveOpen} />
      <div className="flex flex-col min-h-screen p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Vapi Plugins</h1>
            <p className="text-muted-foreground">
              Connect Vapi to enable AI voice calls and phone support
            </p>
          </div>
          <div className="mt-8">
            {vapiPlugin ? (
              <ConnectedView onDisconnect={toggleDialog} />
            ) : (
              <PluginCard
                features={vapiFeatures}
                serviceImage="/plugins/vapi.jpg"
                serviceName="Vapi"
                onSubmit={toggleDialog}
                disabled={vapiPlugin === undefined}
                aria-busy={vapiPlugin === undefined}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function VapiPluginForm({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const addSecret = useMutation(api.web.secret.add);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicApiKey: "",
      privateApiKey: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addSecret({
        service: "vapi",
        keys: {
          private: values.privateApiKey,
          public: values.publicApiKey,
        },
      });

      toast.success("Vapi plugin configured successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Vapi</DialogTitle>
          <DialogDescription>
            Your API keys are safely encrypted and stored
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="publicApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public API Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Public API Key"
                      autoComplete="off"
                      aria-autocomplete="none"
                    />
                  </FormControl>
                  <FormError />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="privateApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Private API Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Private API Key"
                      autoComplete="off"
                      aria-autocomplete="none"
                    />
                  </FormControl>
                  <FormError />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                aria-busy={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function VapiPluginRemoveForm({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const removePlugin = useMutation(api.web.plugin.remove);

  const onSubmit = async () => {
    try {
      await removePlugin({
        service: "vapi",
      });

      setOpen(false);
      toast.success("Vapi plugin removed.");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disconnect Vapi</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove Vapi plugin?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onSubmit} theme="danger">
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
