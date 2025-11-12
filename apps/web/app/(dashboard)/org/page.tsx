"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowRight, Building, Users2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/hoc/with-org";

export default function Organizations() {
  const router = useRouter();
  const { organizations, selectedOrganization } = useOrganization();

  return (
    <div>
      <div>
        <h2>Organizations</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card
            key={org._id}
            className={`group relative transition-all border ${
              selectedOrganization?._id === org._id
                ? "border-primary/50"
                : "hover:border-primary/25"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <span className="truncate">{org.name}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users2 className="h-4 w-4" />
                {org.members?.length ?? 1} Members
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/organizations/${org._id}`)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
