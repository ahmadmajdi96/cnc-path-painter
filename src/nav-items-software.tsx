import { Zap, GitBranch, Link as LinkIcon, Layout, Globe } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  page: string;
}

export const softwareNavItems: NavItem[] = [
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
    title: "Workflows",
    to: "/software/workflows",
    icon: GitBranch,
    page: "WorkflowsPortal",
  },
  {
    title: "Website Builder",
    to: "/software/website-builder",
    icon: Globe,
    page: "WebsiteBuilderPage",
  },
];
