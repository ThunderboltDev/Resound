"use client";

import { api } from "@workspace/backend/_generated/api";
import type { File } from "@workspace/backend/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { InfiniteScrollRef } from "@workspace/ui/components/infinite-scroll-ref";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { usePaginatedQuery } from "convex/react";
import { File as FileIcon, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useState } from "react";
import DeleteFileDialog from "@/app/(dashboard)/knowledge-base/delete-file-dialog";
import UploadDialog from "@/app/(dashboard)/knowledge-base/upload-dialog";

export default function FileView() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const files = usePaginatedQuery(
    api.web.file.list,
    {},
    {
      initialNumItems: 10,
    }
  );

  const { infiniteScrollRef, isExhausted, isLoadingFirstPage } =
    useInfiniteScroll({
      status: files.status,
      loadMore: files.loadMore,
      loadSize: 10,
    });

  const handleDeleteFile = (file: File) => {
    setSelectedFile(file);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteComplete = () => {
    setSelectedFile(null);
  };

  return (
    <>
      <DeleteFileDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        file={selectedFile}
        onDelete={handleDeleteComplete}
      />
      <UploadDialog
        onOpenChange={setIsUploadDialogOpen}
        open={isUploadDialogOpen}
      />
      <div className="flex min-h-screen flex-col p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Knowledge Base</h1>
            <p className="text-muted-foreground">
              Upload and manage documents for your AI assistant
            </p>
          </div>
          <div className="mt-8 rounded-lg border border-border bg-secondary">
            <div className="flex items-center justify-end border-b border-border px-6 py-4">
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus />
                Add New
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-4 font-medium">Name</TableHead>
                <TableHead className="px-6 py-4 font-medium">Type</TableHead>
                <TableHead className="px-6 py-4 font-medium">Size</TableHead>
                <TableHead className="px-6 py-4 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (isLoadingFirstPage) {
                  return (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={4}>
                        Loading files...
                      </TableCell>
                    </TableRow>
                  );
                }

                if (files.results.length === 0) {
                  return (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={4}>
                        No files found
                      </TableCell>
                    </TableRow>
                  );
                }

                return files.results.map((file) => (
                  <TableRow className="hover:bg-secondary/50" key={file.id}>
                    <TableCell className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <FileIcon />
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      <Badge className="uppercase" variant="outline">
                        {file.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {file.size}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="size-8"
                            variant="ghost"
                            size="icon"
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-danger"
                            onClick={() => handleDeleteFile(file)}
                          >
                            <Trash />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
          {!isLoadingFirstPage && files.results.length > 0 && (
            <div className="border-t border-border">
              <InfiniteScrollRef
                isExhausted={isExhausted}
                exhaustedText="No more files"
                ref={infiniteScrollRef}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
