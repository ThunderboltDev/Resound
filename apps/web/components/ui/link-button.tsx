import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonLinkProps = ComponentProps<typeof Link> &
  ComponentProps<typeof Button>;

function LinkButton({ className, ...props }: ButtonLinkProps) {
  return (
    <Button {...props} asChild>
      <Link className={cn("no-underline", className)} {...props} />
    </Button>
  );
}

export { LinkButton };
