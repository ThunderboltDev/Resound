"use client";

import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";

const variants = [
  "default",
  "muted",
  "primary",
  "info",
  "danger",
  "success",
  "warning",
  "ghost",
] as const;

const sizes = ["default", "sm", "lg", "icon", "responsive"] as const;

export default function ButtonsTestPage() {
  return (
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Button Showcase</h1>

      {variants.map((variant) => (
        <section key={variant} className="space-y-4">
          <h2 className="text-xl font-semibold capitalize">{variant}</h2>

          <div className="flex flex-wrap gap-4">
            {sizes.map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <Button variant={variant} size={size}>
                  {size === "icon" ? "🔘" : `${variant} (${size.slice(0, 3)})`}
                </Button>
                <Button variant={variant} size={size} disabled>
                  {size === "icon" ? "🚫" : "Disabled"}
                </Button>
                <Button
                  variant={variant}
                  size={size}
                  disabled
                  aria-busy="true"
                  className="relative"
                >
                  {size === "icon" ? (
                    <Spinner />
                  ) : (
                    <>
                      <Spinner /> Loading...
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
