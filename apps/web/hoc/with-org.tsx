"use client";

import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import { Loader } from "lucide-react";
import type { ComponentType } from "react";
import { CreateOrganization } from "@/components/org/create";
import type { Organization } from "@/types/schema";

export type PropsWithOrganization<P = object> = P & {
  selectedOrganization: Organization | null;
  organizations: Organization[];
};

export function withOrganization<T extends object>(
  WrappedComponent: ComponentType<PropsWithOrganization<T>>
) {
  function ProtectedPage(props: T) {
    const organizations = useQuery(api.organization.getUserOrganizations);
    const selectedOrganization = useQuery(
      api.organization.getSelectedOrganization
    );

    if (selectedOrganization === undefined || organizations === undefined)
      return <Loader />;

    if (!organizations.length) {
      return <CreateOrganization />;
    }

    return (
      <WrappedComponent
        selectedOrganization={selectedOrganization}
        organizations={organizations}
        {...props}
      />
    );
  }

  ProtectedPage.displayName = `withConfetti(${
    WrappedComponent.displayName ??
    WrappedComponent.name ??
    "Organization Component"
  })`;

  return ProtectedPage;
}
