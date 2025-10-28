"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { X } from "lucide-react";
import {
  type ComponentProps,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";
import { toast } from "sonner";

interface ActionDialogProps extends ComponentProps<typeof Button> {
  dialog: {
    title: string | ReactNode;
    description?: string | ReactNode;
    children?: string | ReactNode;
    button?: ComponentProps<typeof Button>;
    buttonChildrenWhenLoading?: string | ReactNode;
  };
  button: ComponentProps<typeof Button>;
  onConfirm: () => void | Promise<void>;
}

export default function ActionDialog({
  dialog,
  button,
  onConfirm,
}: ActionDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      await onConfirm();
    } catch (error) {
      toast.error("Something went horribly wrong!");
      console.error(
        "Something went wrong while executing action dialog onConfirm:",
        error
      );
    } finally {
      setOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} {...button}>
        {button.children}
      </Button>
      <Dialog
        onOpenChange={(val) => {
          if (!isLoading) setOpen(val);
        }}
        open={open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.title}</DialogTitle>
            <DialogDescription>{dialog.description}</DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => await handleSubmit(e)}>
            {dialog.children}
            <DialogFooter className="gap-4">
              <DialogClose asChild>
                <Button
                  disabled={isLoading}
                  // size="responsive"
                  variant="default"
                >
                  <X /> Cancel
                </Button>
              </DialogClose>
              <Button
                // size="responsive"
                type="submit"
                {...(dialog.button ? dialog.button : button)}
                disabled={isLoading || dialog.button?.disabled}
              >
                {isLoading
                  ? dialog.buttonChildrenWhenLoading
                    ? dialog.buttonChildrenWhenLoading
                    : dialog.button?.children
                      ? dialog.button.children
                      : button.children
                  : dialog.button?.children
                    ? dialog.button.children
                    : button.children}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
