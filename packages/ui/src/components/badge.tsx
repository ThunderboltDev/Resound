import { Slot } from "@radix-ui/react-slot";
import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-sm border font-medium transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-danger aria-invalid:ring-danger/20 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "border-0 bg-primary text-primary-foreground",
        success: "border-0 bg-success text-white",
        warning: "border-0 bg-warning text-white",
        danger: "border-0 bg-danger text-white",
        gradient:
          "border-0 bg-linear-30 from-primary to-ksy-500 text-primary-foreground",
        secondary:
          "border-0 bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        outline:
          "text-foreground [a&]:hover:bg-primary [a&]:hover:text-primary-foreground",
      },
      size: {
        default: "px-2 py-0.5 text-sm [&>svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant, size }), className)}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
