import { cn } from "@workspace/ui/lib/utils";
import type { ComponentProps } from "react";

type SkeletonProps = ComponentProps<"div"> & {
  variant?: keyof typeof skeletonVariants;
};

const skeletonVariants = {
  default: "var(--color-neutral-300)",
  secondary: "var(--color-background)",
  muted: "var(--color-background) [&_*]:opacity-50",
};

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-border animate-pulse rounded-md cursor-progress",
        skeletonVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
