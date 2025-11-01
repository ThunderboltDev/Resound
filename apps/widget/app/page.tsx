"use client";

import { use } from "react";
import WidgetView from "@/components/widget/view";

type Props = {
  searchParams: Promise<{
    organizationId: string | null;
  }>;
};

export default function Page({ searchParams }: Props) {
  const { organizationId } = use(searchParams);

  return <WidgetView organizationId={organizationId} />;
}
