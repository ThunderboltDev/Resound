"use client";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Bot } from "lucide-react";
import { useVapiAssistants } from "@/hooks/use-vapi-data";

export default function PhoneNumbers() {
  const { data: assistants, isLoading } = useVapiAssistants();

  return (
    <div className="border-t border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Assistant</TableHead>
            <TableHead className="px-6 py-4">Model</TableHead>
            <TableHead className="px-6 py-4">First Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(() => {
            if (isLoading) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 px-6 text-center text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              );
            }

            if (assistants.length === 0) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 px-6 text-center text-muted-foreground"
                  >
                    No assistants found
                  </TableCell>
                </TableRow>
              );
            }

            return assistants.map(
              (assistant: {
                id: number;
                name?: string;
                firstMessage?: string;
                model: {
                  model?: string;
                };
              }) => (
                <TableRow key={assistant.id} className="hover:bg-secondary/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Bot className="text-muted-foreground size-4" />
                      <span>{assistant?.name ?? "Unnamed Assistant"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm">
                    {assistant?.model?.model ?? "Unknown"}
                  </TableCell>
                  <TableCell className="max-w-xs px-6 py-4">
                    <p className="truncate text-muted-foreground text-sm">
                      {assistant?.firstMessage ?? "No greeting configured"}
                    </p>
                  </TableCell>
                </TableRow>
              )
            );
          })()}
        </TableBody>
      </Table>
    </div>
  );
}
