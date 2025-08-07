
import { Network, Code, Database, Settings, Zap, Globe, Shield, Bot } from "lucide-react";
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
    title: "API Management",
    to: "/software/api-management",
    icon: Code,
    page: "APIManagement",
  },
  {
    title: "Data Flows",
    to: "/software/data-flows",
    icon: Database,
    page: "DataFlows",
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
