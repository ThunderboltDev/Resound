"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  BookOpen,
  Bot,
  Gem,
  type LucideIcon,
  Mic,
  Palette,
  Phone,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type Feature = {
  label: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    icon: Bot,
    label: "AI Customer Support",
    description: "Automate customer support with AI-powered chatbots.",
  },
  {
    icon: Mic,
    label: "AI Voice Assistant",
    description: "Enhance user experience with voice-activated AI assistants.",
  },
  {
    icon: Phone,
    label: "Phone System",
    description: "Integrate a full-featured phone system into your workflow.",
  },
  {
    icon: BookOpen,
    label: "Knowledge Base",
    description: "Create and manage a comprehensive knowledge base.",
  },
  {
    icon: Users,
    label: "Team Collaboration",
    description: "Collaborate seamlessly with your team members.",
  },
  {
    icon: Palette,
    label: "Widget Customization",
    description: "Cuztomize your chat widget appearance to match your brand.",
  },
];

type LockedOverlayProps = {
  requiredPlan?: "basic" | "plus" | "premium";
  children: ReactNode;
};

export function LockedOverlay({
  children,
  requiredPlan = "basic",
}: LockedOverlayProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none select-none blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" />
      <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center">
              <div className="mb-2 inline-flex size-12 items-center justify-center rounded-full border border-border">
                <Gem className="size-6 text-secondary" />
              </div>
            </div>
            <CardTitle className="text-lg">Locked Feature</CardTitle>
            <CardDescription>
              Unlock this feature by upgrading to {requiredPlan}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg border broder">
                    <feature.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{feature.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                className="w-full"
                onClick={() => router.push("/billing")}
              >
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
