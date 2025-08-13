
import { Eye, MessageSquare, Scan, Search, Users, Camera, FileText, Brain } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface AINavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  page: string;
}

export const aiNavItems: AINavItem[] = [
  {
    title: "Computer Vision",
    to: "/ai/computer-vision",
    icon: Eye,
    page: "ComputerVision",
  },
  {
    title: "OCR",
    to: "/ai/ocr",
    icon: FileText,
    page: "OCR",
  },
  {
    title: "Quality Control",
    to: "/ai/quality-control",
    icon: Search,
    page: "QualityControl",
  },
  {
    title: "Object Detection",
    to: "/ai/object-detection",
    icon: Scan,
    page: "ObjectDetection",
  },
  {
    title: "Object Recognition",
    to: "/ai/object-recognition",
    icon: Camera,
    page: "ObjectRecognition",
  },
  {
    title: "Face Recognition",
    to: "/ai/face-recognition",
    icon: Users,
    page: "FaceRecognition",
  },
  {
    title: "Plate Recognition",
    to: "/ai/plate-recognition",
    icon: Scan,
    page: "PlateRecognition",
  },
  {
    title: "NLP",
    to: "/ai/nlp",
    icon: Brain,
    page: "NLP",
  },
  {
    title: "Chat Bots",
    to: "/ai/chatbots",
    icon: MessageSquare,
    page: "ChatBots",
  },
];
