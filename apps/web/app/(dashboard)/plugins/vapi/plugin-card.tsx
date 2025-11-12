"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowLeftRight, type LucideIcon, Plug } from "lucide-react";
import Image from "next/image";
import type { ComponentProps } from "react";

export type Feature = {
  icon: LucideIcon;
  label: string;
  description: string;
};

type PluginCardProps = {
  serviceName: string;
  serviceImage: string;
  features: Feature[];
  onSubmit: () => void;
} & ComponentProps<"button">;

export default function PluginCard({
  serviceName,
  serviceImage,
  features,
  onSubmit,
  ...props
}: PluginCardProps) {
  return (
    <div className="h-fit w-full rounded-lg border border-border bg-secondary p-8">
      <div className="mb-6 flex items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <Image
            className="rounded object-contain"
            width={56}
            height={56}
            alt={serviceName}
            src={serviceImage}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <ArrowLeftRight />
        </div>
        <div className="flex flex-col items-center">
          <Image
            className="rounded object-contain"
            width={56}
            height={56}
            alt="Platform"
            src="/logo.webp"
          />
        </div>
      </div>
      <div className="mb-6 text-center">
        <p className="text-lg">
          <span>Connect your {serviceName} account</span>
        </p>
      </div>
      <div className="mb-6">
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.label} className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted">
                <feature.icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm">{feature.label}</div>
                <div className="font-medium text-xs text-muted-foreground">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Button
          variant="primary"
          className="w-full"
          onClick={onSubmit}
          {...props}
        >
          <Plug />
          Connect
        </Button>
      </div>
    </div>
  );
}
