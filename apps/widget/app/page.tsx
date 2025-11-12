"use client";

import type { Id } from "@workspace/backend/_generated/dataModel";
import { use } from "react";
import WidgetView from "@/components/widget/view";

type Props = {
  searchParams: Promise<{
    organizationId: Id<"organizations"> | null;
  }>;
};

export default function Page({ searchParams }: Props) {
  const { organizationId } = use(searchParams);

  return <WidgetView organizationId={organizationId} />;
}
