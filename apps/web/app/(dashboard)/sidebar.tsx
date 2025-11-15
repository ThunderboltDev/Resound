"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import {
  CreditCard,
  Globe,
  Inbox,
  LayoutDashboard,
  Library,
  Mic,
  Palette,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SelectOrganization } from "@/components/org/select";
import { LinkButton } from "@/components/ui/link-button";
import { useOrganization } from "@/hoc/with-org";

const customerSupportItems = [
  {
    title: "Conversations",
    url: "/conversations",
    icon: Inbox,
  },
  {
    title: "Websites",
    url: "/websites",
    icon: Globe,
  },
  {
    title: "Knowledge Base",
    url: "/knowledge-base",
    icon: Library,
  },
];

const configurationItems = [
  {
    title: "Widget Customization",
    url: "/customization",
    icon: Palette,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: LayoutDashboard,
  },
  {
    title: "Voice Assistant",
    url: "/plugins/vapi",
    icon: Mic,
  },
];

const accountItems = [
  {
    title: "Plans & Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  const { organizations, selectedOrganization } = useOrganization();

  const isActive = (url: string) => {
    return pathname.startsWith(url);
  };

  return (
    <Sidebar className="group" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SelectOrganization
              organizations={organizations}
              selectedOrganization={selectedOrganization}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Customer Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {customerSupportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <LinkButton
                      variant={isActive(item.url) ? "default" : "transparent"}
                      theme={isActive(item.url) ? "primary" : "default"}
                      href={item.url}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </LinkButton>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configurationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <LinkButton
                      variant={isActive(item.url) ? "default" : "transparent"}
                      theme={isActive(item.url) ? "primary" : "default"}
                      href={item.url}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </LinkButton>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <LinkButton
                      variant={isActive(item.url) ? "default" : "transparent"}
                      theme={isActive(item.url) ? "primary" : "default"}
                      href={item.url}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </LinkButton>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User /> <span>You</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
