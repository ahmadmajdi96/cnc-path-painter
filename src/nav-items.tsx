
import { Home, Zap, Printer, Bot, Target, Eye, Truck } from "lucide-react";
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
    title: "Laser Marking",
    to: "/laser-marking",
    icon: Target,
    page: "LaserMarking",
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
  {
    title: "Vision System",
    to: "/vision-system",
    icon: Eye,
    page: "VisionSystem",
  },
  {
    title: "Conveyor Belts",
    to: "/conveyor-belts",
    icon: Truck,
    page: "ConveyorBelts",
  },
];
