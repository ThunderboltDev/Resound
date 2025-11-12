"use client";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Check, XCircle } from "lucide-react";
import { useVapiPhoneNumbers } from "@/hooks/use-vapi-data";

export default function PhoneNumbers() {
  const { data: phoneNumbers, isLoading } = useVapiPhoneNumbers();

  return (
    <div className="border-t border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Phone Number</TableHead>
            <TableHead className="px-6 py-4">Name</TableHead>
            <TableHead className="px-6 py-4">Status</TableHead>
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

            if (phoneNumbers.length === 0) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 px-6 text-center text-muted-foreground"
                  >
                    No phone numbers configured
                  </TableCell>
                </TableRow>
              );
            }

            return phoneNumbers.map(
              (phone: {
                id: number;
                name: string;
                number: number;
                status: "active" | "";
              }) => (
                <TableRow key={phone.id} className="hover:bg-secondary/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Phone className="text-muted-foreground size-4" />
                      <span className="font-mono">
                        {phone.number ?? "Not configured"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {phone.name ?? "Unnamed"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      className="capitalize"
                      variant={phone.status === "active" ? "outline" : "danger"}
                    >
                      {phone.status === "active" ? (
                        <Check className="mr-1 size-3" />
                      ) : (
                        <XCircle className="mr-1 size-3" />
                      )}
                      {phone.status ?? "Unknown"}
                    </Badge>
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
