"use client";

import { plans } from "@workspace/config/plans";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useState } from "react";

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={`px-4 py-2 rounded-md border transition ${
            billingCycle === "monthly"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-input"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle("yearly")}
          className={`px-4 py-2 rounded-md border transition ${
            billingCycle === "yearly"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-input"
          }`}
        >
          Yearly
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {Object.values(plans).map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col justify-between p-6 ${
              plan.id === "premium" ? "border-primary shadow-lg" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                {plan.name}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {plan.id === "basic"
                  ? "Perfect for getting started"
                  : plan.id === "plus"
                  ? "Best for growing teams"
                  : "For businesses that need it all"}
              </p>
            </CardHeader>

            <CardContent className="mt-4 flex flex-col items-start gap-4">
              <div className="text-4xl font-bold">
                ${plan.price[billingCycle]}
                <span className="text-lg font-normal text-muted-foreground">
                  /{billingCycle === "monthly" ? "mo" : "yr"}
                </span>
              </div>

              <ul className="text-sm text-muted-foreground space-y-2">
                {plan.id === "basic" && (
                  <>
                    <li>1 assistant</li>
                    <li>100 chats/month</li>
                    <li>Creem branding</li>
                  </>
                )}
                {plan.id === "plus" && (
                  <>
                    <li>5 assistants</li>
                    <li>5,000 chats/month</li>
                    <li>Custom branding</li>
                    <li>Basic analytics</li>
                  </>
                )}
                {plan.id === "premium" && (
                  <>
                    <li>Unlimited assistants</li>
                    <li>Unlimited chats</li>
                    <li>White-label support</li>
                    <li>Advanced analytics</li>
                    <li>Priority support</li>
                  </>
                )}
              </ul>

              <Button className="w-full mt-4">Get Started</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
