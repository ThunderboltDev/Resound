"use client";

import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { SidebarMenuButton } from "@workspace/ui/components/sidebar";
import { useMutation } from "convex/react";
import { ArrowUpDown, Building, Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Organization } from "@/types/schema";

type SelectOrganizationProps = {
  selectedOrganization: Organization | null;
  organizations: Organization[];
};

export function SelectOrganization({
  selectedOrganization,
  organizations,
}: SelectOrganizationProps) {
  const router = useRouter();
  const switchOrg = useMutation(api.organization.switchOrganization);

  if (!organizations?.length) {
    return <Button variant="muted">No organizations found</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="flex items-center">
          <Building />
          <div className="flex items-center justify-between w-full">
            {selectedOrganization?.name ?? "Select organization"}
            <ArrowUpDown className="size-3.5" />
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuGroup>
          {organizations.map((org) => {
            const isSelected = org._id === selectedOrganization?._id;
            return (
              <DropdownMenuItem
                key={org._id}
                onClick={() => switchOrg({ orgId: org._id })}
                className="flex justify-between gap-2"
              >
                {org.name}
                {isSelected && <Check className="text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/org/create")}>
          <Plus /> Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
