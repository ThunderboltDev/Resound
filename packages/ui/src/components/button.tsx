"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const baseClass =
  "inline-flex items-center justify-center gap-2 shrink-0 " +
  "transition-all duration-300 ease-out " +
  "text-sm font-medium whitespace-nowrap " +
  "rounded-md shadow-sm no-underline cursor-pointer " +
  "[&_svg]:shrink-0 [&_svg]:pointer-events-none " +
  "[&_svg:not([class*='size-'])]:size-4 " +
  "outline-none focus-visible:ring-[3px] focus-visible:ring-border " +
  "aria-invalid:ring-danger/40 aria-invalid:border-danger " +
  "aria-busy:opacity-75 aria-busy:saturate-100 aria-busy:cursor-progress " +
  "disabled:opacity-75 disabled:saturate-0 disabled:cursor-not-allowed ";

const buttonVariants = cva(baseClass, {
  variants: {
    variant: {
      default:
        "bg-secondary text-foreground hover:bg-secondary/80 hover:text-secondary-foreground",
      muted:
        "bg-muted text-foreground hover:bg-muted/80 hover:text-secondary-foreground",
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50",
      info: "bg-info text-white hover:bg-info/90 focus-visible:ring-info/50",
      danger:
        "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/50",
      success:
        "bg-success text-white hover:bg-success/90 focus-visible:ring-success/50",
      warning:
        "bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning/50",
      ghost: "bg-transparent text-foreground shadow-none hover:bg-muted",
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      lg: "text-base h-9.5 rounded-md px-4 has-[>svg]:px-4",
      icon: "size-9",
      responsive:
        "h-9 px-4 py-2 has-[>svg]:px-3 md:h-8 md:gap-1.5 md:rounded-md md:px-3 md:has-[>svg]:px-2.5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  asLink?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
