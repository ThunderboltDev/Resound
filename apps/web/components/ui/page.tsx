import type { PropsWithChildren } from "react";

export function PageWrapper({ children }: PropsWithChildren) {
  return <div className="wrapper-lg pt-4">{children}</div>;
}

export function PageHeader({ children }: PropsWithChildren) {
  return <div className="my-4 space-y-2">{children}</div>;
}

export function PageTitle({ children }: PropsWithChildren) {
  return <h1>{children}</h1>;
}

export function PageDescription({ children }: PropsWithChildren) {
  return <p className="text-muted-foreground md:text-sm">{children}</p>;
}

export function PageBody({ children }: PropsWithChildren) {
  return <div className="my-8">{children}</div>;
}
