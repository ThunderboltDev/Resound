import { cn } from "@workspace/ui/lib/utils";
import { Loader2Icon } from "lucide-react";

function Loader({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin cursor-progress", className)}
      {...props}
    />
  );
}

export { Loader };
