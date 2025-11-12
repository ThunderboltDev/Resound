import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import type { Ref } from "react";

type InfiniteScrollProps = {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  loadMoreText?: string;
  noMoreText?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

export function InfiniteScroll({
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  loadMoreText = "Load More",
  noMoreText = "No more items",
  className,
  ref,
}: InfiniteScrollProps) {
  let text = loadMoreText;

  if (isLoadingMore) {
    text = "Loading...";
  } else if (!canLoadMore) {
    text = noMoreText;
  }

  return (
    <div ref={ref} className={cn("flex w-full justify-center py-2", className)}>
      <Button
        size="sm"
        variant="ghost"
        onClick={onLoadMore}
        disabled={!canLoadMore || isLoadingMore}
        aria-busy={isLoadingMore}
      >
        {text}
      </Button>
    </div>
  );
}
