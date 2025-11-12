"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@workspace/ui/lib/utils";
import type { ComponentProps } from "react";

const baseClassName = [
  "inline-flex items-center justify-center gap-2 shrink-0",
  "transition-all duration-300 ease-out",
  "active:scale-[0.98] disabled:active:scale-100 origin-bottom",
  "text-sm font-medium whitespace-nowrap",
  "rounded-md no-underline cursor-pointer",
  "[&_svg]:shrink-0 [&_svg]:pointer-events-none",
  "[&_svg:not([class*='size-'])]:size-4",
  "outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50",
  "aria-invalid:ring-danger/40 aria-invalid:border-danger",
  "aria-busy:opacity-75 aria-busy:saturate-100 aria-busy:cursor-progress",
  "disabled:opacity-75 disabled:saturate-0 disabled:cursor-not-allowed",
];

const defaultThemes = {
  default:
    "bg-secondary text-foreground hover:bg-secondary/80 hover:text-secondary-foreground",
  muted:
    "bg-muted text-foreground hover:bg-muted/80 hover:text-secondary-foreground",
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50",
  info: "bg-info text-white hover:bg-info/90 focus-visible:ring-info/50",
  success:
    "bg-success text-white hover:bg-success/90 focus-visible:ring-success/50",
  danger:
    "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/50",
  warning:
    "bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning/50",
};

const ghostThemes = {
  default: "hover:bg-secondary",
  muted: "hover:bg-muted",
  primary: "hover:bg-primary hover:text-primary-foreground",
  info: "hover:bg-info hover:text-white",
  success: "hover:bg-success hover:text-white",
  danger: "hover:bg-danger hover:text-white",
  warning: "hover:bg-warning hover:text-white",
};

const transparentThemes = {
  default: "text-foreground hover:bg-secondary/50",
  muted: "text-foreground hover:bg-muted/50",
  primary: "text-primary hover:bg-primary/10",
  info: "text-info hover:bg-info/10",
  success: "text-success hover:bg-success/10",
  danger: "text-danger hover:bg-danger/10",
  warning: "text-warning hover:bg-warning/10",
};

const outlineThemes = {
  default:
    "text-secondary-foreground hover:bg-secondary-foreground/5 hover:text-foreground",
  muted:
    "text-muted-foreground hover:bg-muted-foreground/5 hover:text-secondary-foreground",
  primary:
    "text-primary border-primary hover:bg-primary hover:text-primary-foreground",
  info: "text-info border-info hover:bg-info hover:text-white",
  success: "text-success border-success hover:bg-success hover:text-white",
  danger: "text-danger border-danger hover:bg-danger hover:text-white",
  warning: "text-warning border-warning hover:bg-warning hover:text-white",
};

const sizeThemes = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "text-base h-9.5 px-4 has-[>svg]:px-4",
  icon: "size-9",
  responsive:
    "h-9 px-4 py-2 has-[>svg]:px-3 md:h-8 md:gap-1.5 md:rounded-md md:px-3 md:has-[>svg]:px-2.5",
};

interface ButtonProps extends ComponentProps<"button"> {
  theme?:
    | "default"
    | "muted"
    | "primary"
    | "info"
    | "success"
    | "danger"
    | "warning";
  size?: "default" | "sm" | "lg" | "icon" | "responsive";
  variant?: "default" | "ghost" | "outline" | "transparent";
  asChild?: boolean;
}

function Button({
  className,
  children,
  variant = "default",
  theme = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  const sizeClassName = sizeThemes[size];

  const variantClassName = {
    default: defaultThemes[theme],
    ghost: `bg-transparent ${ghostThemes[theme]}`,
    transparent: `bg-transparent ${transparentThemes[theme]}`,
    outline: `bg-transparent border border-border focus-visible:ring-current/50 ${outlineThemes[theme]}`,
  };

  return (
    <Component
      data-slot="button"
      className={cn(
        variantClassName[variant],
        baseClassName,
        sizeClassName,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Button };
