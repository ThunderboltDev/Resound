"use client";

import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Bowser from "bowser";
import { useQuery } from "convex/react";
import { Globe, Mail, Monitor } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ComponentType, useMemo } from "react";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country";

type InfoItem = {
  label: string;
  value: string;
  className?: string;
};

type InfoSection = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  items: InfoItem[];
};

export function ContactPanel() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  const widgetSession = useQuery(
    api.private.widgetSession.getByConversationId,
    {
      conversationId: conversationId as Id<"conversations">,
    }
  );

  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) {
        return {
          browser: "Unknown",
          os: "Unknown",
          device: "Unknown",
        };
      } else {
        const bowser = Bowser.getParser(userAgent);
        const result = bowser.getResult();

        return {
          browser: result.browser.name || "Unknown",
          browserVersion: result.browser.version || "???",
          os: result.os.name || "Unknown Device",
          osVersion: result.os.version || "???",
          device: result.platform.type || "desktop",
          deviceVendor: result.platform.vendor || "",
          deviceModel: result.platform.model || "",
        };
      }
    };
  }, []);

  const userAgentInfo = useMemo(() => {
    return parseUserAgent(widgetSession?.metadata?.userAgent);
  }, [widgetSession?.metadata?.userAgent, parseUserAgent]);

  const countryInfo = useMemo(() => {
    return getCountryFromTimezone(widgetSession?.metadata?.timezone || "");
  }, [widgetSession?.metadata?.timezone]);

  const accordionSections = useMemo<InfoSection[]>(() => {
    if (!widgetSession?.metadata) {
      return [];
    }

    return [
      {
        id: "device-info",
        icon: Monitor,
        title: "Device Information",
        items: [
          {
            label: "Browser",
            value: `${userAgentInfo.browser} ${userAgentInfo.browserVersion}`,
          },
          {
            label: "Operating System",
            value: `${userAgentInfo.os} ${userAgentInfo.osVersion}`,
          },
          {
            label: "Device",
            value: `${userAgentInfo.device} ${
              userAgentInfo.deviceModel && ` - ${userAgentInfo.deviceModel}`
            } `,
            className: "capitalize",
          },
          {
            label: "Screen Resolution",
            value:
              widgetSession.metadata.screenWidth &&
              widgetSession.metadata.screenHeight
                ? `${widgetSession.metadata.screenWidth} x ${widgetSession.metadata.screenHeight}`
                : "Unknown",
          },
          {
            label: "Viewport",
            value:
              widgetSession.metadata.viewportWidth &&
              widgetSession.metadata.viewportHeight
                ? `${widgetSession.metadata.viewportWidth} x ${widgetSession.metadata.viewportHeight}`
                : "Unknown",
          },
          {
            label: "Cookies",
            value: widgetSession.metadata.cookiesEnabled
              ? "Enabled"
              : "Disabled",
          },
        ],
      },
      {
        id: "location-info",
        icon: Globe,
        title: "Location & Language",
        items: [
          {
            label: "Timezone",
            value: widgetSession.metadata.timezone || "Unknown",
          },
          {
            label: "UTC Offset",
            value:
              widgetSession.metadata.timezoneOffset !== undefined
                ? `UTC ${
                    widgetSession.metadata.timezoneOffset >= 0 ? "+" : "-"
                  }${Math.abs(widgetSession.metadata.timezoneOffset / 60)}`
                : "Unknown",
          },
          {
            label: "Country",
            value: countryInfo
              ? `${countryInfo.name} ${
                  countryInfo.code ? `(${countryInfo.code.toUpperCase()})` : ""
                }`
              : "Unknown",
          },
          {
            label: "Language",
            value: widgetSession.metadata.language || "Unknown",
          },
        ],
      },
    ];
  }, [userAgentInfo, widgetSession?.metadata, countryInfo]);

  if (!widgetSession) {
    return (
      <div className="flex h-full flex-col bg-background text-foreground">
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <DicebearAvatar
            seed={widgetSession._id ?? "loading"}
            badgeImageUrl={
              countryInfo?.code
                ? getCountryFlagUrl(countryInfo.code)
                : undefined
            }
            size={42}
          />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <h4 className="line-clamp-1">{widgetSession.name}</h4>
            </div>
            <p className="line-clamp-1 text-muted-foreground text-sm">
              {widgetSession.email}
            </p>
          </div>
        </div>
        <Button className="w-full" variant="primary" asChild>
          <Link href={`mailto:${widgetSession.email}`}>
            <Mail />
            <span>Send Email</span>{" "}
          </Link>
        </Button>
      </div>
      <div>
        {widgetSession?.metadata && (
          <Accordion
            className="w-full rounded-none border-y border-border"
            type="single"
            collapsible
          >
            {accordionSections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <section.icon className="size-4" />
                    <span>{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 pt-0">
                  <div className="space-y-2 text-sm">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className={item.className}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
