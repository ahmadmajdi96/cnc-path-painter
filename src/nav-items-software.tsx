
import { Network, Code, Settings, Zap, Globe, Shield, Bot, Layout, Server } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface SoftwareNavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  page: string;
}

export const softwareNavItems: SoftwareNavItem[] = [
  {
    title: "Integrations",
    to: "/software/integrations",
    icon: Network,
    page: "Integrations",
  },
  {
    title: "Automation",
    to: "/software/automation",
    icon: Bot,
    page: "Automation",
  },
  {
    title: "App Builder",
    to: "/software/app-builder",
    icon: Layout,
    page: "AppBuilder",
  },
  {
    title: "Endpoint Management",
    to: "/software/endpoints",
    icon: Server,
    page: "EndpointManagement",
  },
  {
    title: "API Management",
    to: "/software/api-management",
    icon: Code,
    page: "APIManagement",
  },
  {
    title: "Protocol Config",
    to: "/software/protocols",
    icon: Settings,
    page: "Protocols",
  },
  {
    title: "Webhooks",
    to: "/software/webhooks",
    icon: Zap,
    page: "Webhooks",
  },
  {
    title: "External APIs",
    to: "/software/external-apis",
    icon: Globe,
    page: "ExternalAPIs",
  },
  {
    title: "Security",
    to: "/software/security",
    icon: Shield,
    page: "Security",
  },
];
