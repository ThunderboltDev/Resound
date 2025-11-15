"use client";

import { api } from "@workspace/backend/_generated/api";
import { LoadingScreen } from "@workspace/ui/components/loading-screen";
import { useQuery } from "convex/react";
import { CustomizationForm } from "./customization-form";

export function ViewCustomizationPage() {
  const widgetSettings = useQuery(api.web.widgetSetting.get);
  const vapiPlugin = useQuery(api.web.plugin.get, {
    service: "vapi",
  });

  const isLoading = widgetSettings === undefined || vapiPlugin === undefined;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col p-8">
      <div className="max-w-screen-md mx-auto w-full">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Widget Customization</h1>
          <p className="text-muted-foreground">
            Customize the appearance and behavior of your chat widget
          </p>
        </div>
        <div className="mt-2">
          <CustomizationForm
            initialData={widgetSettings}
            hasVapiPlugin={!!vapiPlugin}
          />
        </div>
      </div>
    </div>
  );
}
