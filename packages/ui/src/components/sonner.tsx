"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CircleAlert,
  Info,
  Loader2,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    closeButton={true}
    gap={12}
    icons={{
      info: <Info className="size-5 text-info" />,
      error: <CircleAlert className="size-5 text-danger" />,
      success: <BadgeCheck className="size-5 text-success" />,
      warning: <AlertTriangle className="size-5 text-warning" />,
      loading: (
        <Loader2 className="size-5 animate-spin text-secondary-foreground" />
      ),
    }}
    position="top-center"
    theme="system"
    toastOptions={{
      classNames: {
        title: "text-[15px] font-normal text-secondary-foreground",
        toast:
          "!py-2 !px-4 gap-3 items-center !bg-secondary !text-foreground !border-border",
        closeButton:
          "!bg-secondary !hover:bg-muted !text-secondary-foreground !border-border",
      },
    }}
    {...props}
  />
);

export { Toaster };
