"use client";

import { Button } from "@workspace/ui/components/button";
import { Loader } from "@workspace/ui/components/loader";

const sizes = ["sm", "default", "lg", "icon", "responsive"] as const;
const variants = ["default", "outline", "ghost", "transparent"] as const;
const themes = [
  "default",
  "muted",
  "primary",
  "info",
  "success",
  "danger",
  "warning",
] as const;

export default function ButtonPreviewPage() {
  return (
    <div className="p-6 space-y-8">
      <h1>Button Showcase</h1>

      {variants.map((variant) => (
        <div key={variant} className="space-y-4">
          <h2 className="capitalize">{variant}</h2>

          {themes.map((theme) => (
            <div key={theme} className="space-y-2">
              <h3 className="capitalize">{theme}</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <Button variant={variant} theme={theme} size={size}>
                      {size === "icon" ? "🔔" : `${size}`}
                    </Button>
                    <Button
                      variant={variant}
                      theme={theme}
                      size={size}
                      disabled
                    >
                      {size === "icon" ? "🔔" : "Disabled"}
                    </Button>
                    <Button
                      variant={variant}
                      theme={theme}
                      size={size}
                      aria-busy="true"
                      disabled
                    >
                      <Loader />
                      {size === "icon" ? "" : "Loading..."}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
