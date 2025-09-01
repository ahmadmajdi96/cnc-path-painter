import { Settings, Server, Zap, Code, GitBranch, Link } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  page: string;
}

export const softwareNavItems: NavItem[] = [
  {
    title: "Services",
    to: "/software/services",
    icon: Settings,
    page: "ServicesPage",
  },
  {
    title: "Servers",
    to: "/software/servers",
    icon: Server,
    page: "ServersPage",
  },
  {
    title: "Automation",
    to: "/software/automation",
    icon: Zap,
    page: "AutomationPage",
  },
  {
    title: "Integrations",
    to: "/software/integrations",
    icon: Link,
    page: "IntegrationsPage",
  },
  {
    title: "App Builder",
    to: "/software/app-builder",
    icon: Code,
    page: "AppBuilderPage",
  },
  {
    title: "Workflows",
    to: "/software/workflows",
    icon: GitBranch,
    page: "WorkflowsPortal",
  },
];
