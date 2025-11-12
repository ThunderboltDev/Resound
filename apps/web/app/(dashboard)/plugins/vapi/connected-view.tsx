"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Bot, Phone, Settings, Unplug } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Assistants from "@/app/(dashboard)/plugins/vapi/tabs/assistants";
import PhoneNumbers from "@/app/(dashboard)/plugins/vapi/tabs/phone-numbers";

type ConnectedProps = {
  onDisconnect: () => void;
};

export default function ConnectedView({ onDisconnect }: ConnectedProps) {
  const [activeTab, setActiveTab] = useState("phone-numbers");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                className="rounded-lg object-contain"
                src="/plugins/vapi.jpg"
                height={48}
                width={48}
                alt="Vapi"
              />
              <div>
                <CardTitle>Vapi Plugin</CardTitle>
                <CardDescription>
                  Manage your phone numbers and AI assistants
                </CardDescription>
              </div>
            </div>
            <Button variant="danger" onClick={onDisconnect}>
              <Unplug />
              Disconnect
            </Button>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted">
                <Settings className="size-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Widget Configutation</CardTitle>
                <CardDescription>
                  Set up voice calls for your chat widget
                </CardDescription>
              </div>
            </div>
            <Button variant="primary" asChild>
              <Link href="/customization">
                <Settings /> Configure
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Tabs
          className="gap-0"
          defaultValue="phone-numbers"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid h-12 w-full grid-cols-2 p-0">
            <TabsTrigger className="h-full rounded-none" value="phone-numbers">
              <Phone /> Phone Numbers
            </TabsTrigger>
            <TabsTrigger className="h-full rounded-none" value="assistants">
              <Bot /> Assistants
            </TabsTrigger>
          </TabsList>
          <TabsContent value="phone-numbers">
            <PhoneNumbers />
          </TabsContent>
          <TabsContent value="assistants">
            <Assistants />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
