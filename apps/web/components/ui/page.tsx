import { cn } from "@workspace/ui/lib/utils";
import type { PropsWithChildren } from "react";

interface PageProps extends PropsWithChildren {
  className?: string;
}

export function PageWrapper({ children, className }: PageProps) {
  return <div className={cn(className, "wrapper-lg pt-4")}>{children}</div>;
}

export function PageHeader({ children, className }: PageProps) {
  return <div className={cn(className, "my-4 space-y-2")}>{children}</div>;
}

export function PageTitle({ children, className }: PageProps) {
  return <h1 className={className}>{children}</h1>;
}

export function PageDescription({ children, className }: PageProps) {
  return (
    <p className={cn(className, "text-muted-foreground md:text-sm")}>
      {children}
    </p>
  );
}

export function PageBody({ children, className }: PageProps) {
  return <div className={cn(className, "my-8")}>{children}</div>;
}
