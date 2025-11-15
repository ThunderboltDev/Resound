"use client";

import type { Doc } from "@workspace/backend/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { formatDate } from "date-fns";
import Link from "next/link";
import { WebsiteStatus } from "@/app/(dashboard)/websites/status";

interface WebsitesTableProps {
  websites: Doc<"websites">[] | undefined;
}

export default function WebsitesDisplay({ websites }: WebsitesTableProps) {
  if (!websites || websites.length === 0) {
    return (
      <div className="text-muted-foreground text-sm text-center my-10">
        No websites linked.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
      {websites.map((website) => (
        <Link
          key={website._id.toString()}
          href={`/websites/${website._id.toString()}`}
          className="no-underline"
        >
          <Card className="shadow-none rounded-xl p-5">
            <CardHeader>
              <CardTitle className="truncate">
                {new URL(website.url).hostname}
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>
                {formatDate(new Date(website._creationTime), "dd/MM/yy")}
              </span>
              <div className="flex items-center gap-2">
                <span>
                  {website.verifiedAt
                    ? formatDate(new Date(website.verifiedAt), "dd/MM/yy")
                    : "Verification Required"}
                </span>
                <WebsiteStatus status={website.status} />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
