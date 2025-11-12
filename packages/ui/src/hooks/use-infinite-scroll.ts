import { useCallback, useEffect, useRef } from "react";

type UseInfiniteScrollProps = {
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: (numItems: number) => void;
  loadSize?: number;
  observerEnabled?: boolean;
};

export function useInfiniteScroll({
  status,
  loadMore,
  loadSize = 10,
}: UseInfiniteScrollProps) {
  const infiniteScrollRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(loadSize);
    }
  }, [status, loadSize, loadMore]);

  useEffect(() => {
    const topElement = infiniteScrollRef.current;
    if (!topElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(topElement);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore]);

  return {
    handleLoadMore,
    infiniteScrollRef,
    isLoadingFirstPage: status === "LoadingFirstPage",
    isExhausted: status === "Exhausted",
  };
}
