"use client";

import { api } from "@workspace/backend/_generated/api";
import type { File } from "@workspace/backend/types";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useMutation } from "convex/react";
import { useState } from "react";

interface DeleteFileDialogProps {
  open: boolean;
  file: File | null;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
}

export default function DeleteFileDialog({
  open,
  file,
  onOpenChange,
  onDelete,
}: DeleteFileDialogProps) {
  const deleteFile = useMutation(api.web.file.remove);

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    if (!file) return;

    setIsDeleting(true);

    try {
      await deleteFile({ entryId: file.id });

      onDelete?.();

      requestAnimationFrame(() => onOpenChange(false));
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {file?.name}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {file && (
          <div className="py-4">
            <div className="rounded-lg border border-border bg-secondary p-4">
              <p className="font-medium">{file.name}</p>
              <p className="text-muted-foreground text-sm">
                Type: {file?.type.toUpperCase()} | Size: {file.size}
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={isDeleting || !file} onClick={handleDelete}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
