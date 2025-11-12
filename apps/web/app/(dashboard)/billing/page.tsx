"use client";

import {
  PageDescription,
  PageHeader,
  PageTitle,
  PageWrapper,
} from "@/components/ui/page";
import { Pricing } from "./pricing";

export default function Page() {
  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Plans & Billing</PageTitle>
        <PageDescription>
          Choose the plan that&apos;s right for you and manage your billing
          information.
        </PageDescription>
      </PageHeader>
      <div className="mt-8">
        <Pricing />
      </div>
    </PageWrapper>
  );
}
