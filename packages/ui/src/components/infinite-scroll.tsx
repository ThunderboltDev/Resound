import { Loader } from "@workspace/ui/components/loader";
import { cn } from "@workspace/ui/lib/utils";
import type { Ref } from "react";

type InfiniteScrollProps = {
  isExhausted: boolean;
  exhaustedText?: string;
  className?: string;
  ref: Ref<HTMLDivElement>;
};

export function InfiniteScrollRef({
  exhaustedText = "No more items",
  isExhausted,
  className,
  ref,
}: InfiniteScrollProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "grid place-items-center text-muted-foreground px-2 py-3",
        className
      )}
    >
      {isExhausted ? exhaustedText : <Loader />}
    </div>
  );
}
