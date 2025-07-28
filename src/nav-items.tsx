
import { Home, Zap, Printer, Bot } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  page: string;
}

export const navItems: NavItem[] = [
  {
    title: "CNC Control",
    to: "/",
    icon: Home,
    page: "Index",
  },
  {
    title: "Laser Control",
    to: "/laser-control",
    icon: Zap,
    page: "LaserControl",
  },
  {
    title: "3D Printer",
    to: "/3d-printer",
    icon: Printer,
    page: "Printer3D",
  },
  {
    title: "Robotic Arms",
    to: "/robotic-arms",
    icon: Bot,
    page: "RoboticArms",
  },
];
