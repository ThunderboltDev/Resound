"use client";

import { api } from "@workspace/backend/_generated/api";
import { LoadingScreen } from "@workspace/ui/components/loading-screen";
import { useQuery } from "convex/react";
import type { ComponentType } from "react";
import { createContext, useContext } from "react";
import { CreateOrganization } from "@/components/org/create";
import type { Organization, OrganizationWithMembers } from "@/types/schema";

type OrganizationContextType = {
  selectedOrganization: Organization | null;
  organizations: OrganizationWithMembers[];
};

export const OrganizationContext = createContext<OrganizationContextType>({
  organizations: [],
  selectedOrganization: null,
});

export function useOrganization() {
  return useContext(OrganizationContext);
}

export function withOrganization<T extends object>(
  WrappedComponent: ComponentType<T>
) {
  function ProtectedPage(props: T) {
    const organizations = useQuery(api.web.organization.getAll);
    const selectedOrganization = useQuery(api.web.organization.selected);

    if (selectedOrganization === undefined || organizations === undefined) {
      return <LoadingScreen />;
    }

    if (!organizations.length) {
      return <CreateOrganization />;
    }

    return (
      <OrganizationContext.Provider
        value={{ organizations, selectedOrganization }}
      >
        <WrappedComponent
          selectedOrganization={selectedOrganization}
          organizations={organizations}
          {...props}
        />
      </OrganizationContext.Provider>
    );
  }

  ProtectedPage.displayName = `withConfetti(${
    WrappedComponent.displayName ??
    WrappedComponent.name ??
    "Organization Component"
  })`;

  return ProtectedPage;
}
