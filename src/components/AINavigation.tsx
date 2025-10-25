
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const visionSystems = [
  { title: "Computer Vision", to: "/ai/computer-vision", description: "Advanced computer vision processing" },
  { title: "OCR", to: "/ai/ocr", description: "Optical character recognition" },
  { title: "Quality Control", to: "/ai/quality-control", description: "AI-powered quality inspection" },
  { title: "Object Detection", to: "/ai/object-detection", description: "Real-time object detection" },
  { title: "Object Recognition", to: "/ai/object-recognition", description: "Object classification and recognition" },
  { title: "Face Recognition", to: "/ai/face-recognition", description: "Facial detection and recognition" },
  { title: "Plate Recognition", to: "/ai/plate-recognition", description: "License plate recognition" },
];

const aiAgents = [
  { title: "NLP", to: "/ai/nlp", description: "Natural language processing" },
  { title: "Chat Bots", to: "/ai/chatbots", description: "Conversational AI agents" },
];

const dataTools = [
  { title: "Dataset Builder", to: "/ai/dataset-builder", description: "Build and annotate datasets for AI training" },
];

export const AINavigation = () => {
  const location = useLocation();
  
  const isVisionActive = visionSystems.some(item => location.pathname === item.to);
  const isAgentsActive = aiAgents.some(item => location.pathname === item.to);
  const isDataToolsActive = dataTools.some(item => location.pathname === item.to);
  
  return (
    <nav className="bg-background border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Portals
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-border" />
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "h-9",
                  isVisionActive && "bg-accent text-accent-foreground"
                )}>
                  Vision Systems
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    {visionSystems.map((item) => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.to}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              location.pathname === item.to && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "h-9",
                  isAgentsActive && "bg-accent text-accent-foreground"
                )}>
                  AI Agents
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    {aiAgents.map((item) => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.to}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              location.pathname === item.to && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "h-9",
                  isDataToolsActive && "bg-accent text-accent-foreground"
                )}>
                  Data Tools
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    {dataTools.map((item) => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.to}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              location.pathname === item.to && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="text-sm text-muted-foreground">
          AI Services Portal
        </div>
      </div>
    </nav>
  );
};
