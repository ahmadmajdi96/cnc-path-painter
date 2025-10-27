import { Settings, Zap, Code, GitBranch, Link as LinkIcon, Layout } from "lucide-react";
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
    title: "Integrations",
    to: "/software/integrations",
    icon: LinkIcon,
    page: "IntegrationsPage",
  },
  {
    title: "UI Builder",
    to: "/software/ui-builder",
    icon: Layout,
    page: "IntegrationUIBuilder",
  },
  {
    title: "Automation",
    to: "/software/automation",
    icon: Zap,
    page: "AutomationPage",
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
