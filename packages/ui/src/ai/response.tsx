"use client";

import { cn } from "@workspace/ui/lib/utils";
import { memo } from "react";
import { harden } from "rehype-harden";
import { Streamdown, type StreamdownProps } from "streamdown";

export const Response = memo(
  ({ className, ...props }: StreamdownProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      rehypePlugins={[
        [
          harden,
          {
            allowedLinkPrefixes: ["*"],
            defaultOrigin: "https://resound.qzz.io",
          },
        ],
      ]}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
