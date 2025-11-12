"use client";

import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useAction } from "convex/react";
import { useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";

type UploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploadComplete?: () => void;
};

export default function UploadDialog({
  open,
  onOpenChange,
  onFileUploadComplete,
}: UploadDialogProps) {
  const addFile = useAction(api.private.file.add);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadForm, setUploadForm] = useState({
    category: "",
    fileName: "",
  });

  const handleFileDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      setUploadedFiles([file]);

      if (!uploadForm.fileName) {
        setUploadForm((prev) => ({
          ...prev,
          fileName: file.name,
        }));
      }
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      const blob = uploadedFiles[0];

      if (blob) {
        const fileName = uploadForm.fileName || blob.name;

        await addFile({
          bytes: await blob.arrayBuffer(),
          fileName,
          mimeType: blob.type,
          category: uploadForm.category,
        });

        onFileUploadComplete?.();
        handleCancel();
      }
    } catch (error) {
      console.error("Error while uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);

    setUploadedFiles([]);
    setUploadForm({
      fileName: "",
      category: "",
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload documents to your knowledge base for AI-powered search and
            retrieval
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              type="text"
              className="w-full"
              placeholder="eg. Documentation, Support, Product"
              value={uploadForm.category}
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file-name">
              File Name{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="file-name"
              type="text"
              className="w-full"
              placeholder="Override default file name"
              value={uploadForm.fileName}
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  fileName: e.target.value,
                }))
              }
            />
          </div>
          <Dropzone
            maxFiles={1}
            accept={{
              "application/pdf": [".pdf"],
              "text/csv": [".csv"],
              "text/plain": [".txt"],
            }}
            disabled={isUploading}
            onDrop={handleFileDrop}
            src={uploadedFiles}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              isUploading || uploadedFiles.length === 0 || !uploadForm.category
            }
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
