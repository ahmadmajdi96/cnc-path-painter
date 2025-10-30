
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

const urbanSystems = [
  { title: "Vehicle Detection", to: "/ai/vehicle-detection", description: "Detect vehicles in images and videos" },
  { title: "Vehicle Recognition", to: "/ai/vehicle-recognition", description: "Classify and identify vehicle types" },
  { title: "Plate Detection", to: "/ai/plate-detection", description: "Locate license plates in images" },
  { title: "Plate Number Extraction", to: "/ai/plate-number-extraction", description: "Extract text from license plates" },
  { title: "Feeds Management", to: "/ai/feeds-management", description: "Manage multiple video surveillance feeds" },
  { title: "Path Optimization", to: "/ai/path-optimization", description: "Optimize vehicle routing and paths" },
];

const industrialSystems = [
  { title: "OCR", to: "/ai/ocr", description: "Optical character recognition" },
  { title: "Quality Control", to: "/ai/quality-control", description: "AI-powered quality inspection" },
  { title: "Object Detection", to: "/ai/object-detection", description: "Real-time object detection" },
  { title: "Object Recognition", to: "/ai/object-recognition", description: "Object classification and recognition" },
];

const peopleSystems = [
  { title: "Human Detection", to: "/ai/human-detection", description: "Detect people in images and videos" },
  { title: "Facial Recognition", to: "/ai/facial-recognition", description: "Facial detection and recognition" },
];

const soundSystems = [
  { title: "Speech Recognition", to: "/ai/speech-recognition", description: "Convert speech to text" },
  { title: "Speech Synthesis", to: "/ai/speech-synthesis", description: "Convert text to speech" },
  { title: "Speaker Identification", to: "/ai/speaker-identification", description: "Identify speakers by voice" },
];

const dataTools = [
  { title: "Dataset Builder", to: "/ai/dataset-builder", description: "Build and annotate datasets for AI training" },
  { title: "Rules Dataset", to: "/ai/rules-dataset", description: "Create and manage rules with sub-rules and prompts" },
  { title: "Question Dataset", to: "/ai/question-dataset", description: "Create questions with answers and sub-questions" },
  { title: "Datasets Combiner", to: "/ai/datasets-combiner", description: "Select and combine multiple datasets" },
  { title: "Locations Dataset", to: "/ai/locations-dataset", description: "Create and manage location datasets with coordinates" },
];

const languageAI = [
  { title: "NLP", to: "/ai/nlp", description: "Natural Language Processing and text analysis" },
  { title: "Chat Bots", to: "/ai/chatbots", description: "AI-powered conversational chatbots" },
];

export const AINavigation = () => {
  const location = useLocation();
  
  const isUrbanActive = urbanSystems.some(item => location.pathname === item.to);
  const isIndustrialActive = industrialSystems.some(item => location.pathname === item.to);
  const isPeopleActive = peopleSystems.some(item => location.pathname === item.to);
  const isSoundActive = soundSystems.some(item => location.pathname === item.to);
  const isDataToolsActive = dataTools.some(item => location.pathname === item.to);
  const isLanguageAIActive = languageAI.some(item => location.pathname === item.to);
  
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
                  isUrbanActive && "bg-accent text-accent-foreground"
                )}>
                  Urban
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    {urbanSystems.map((item) => (
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
                  isIndustrialActive && "bg-accent text-accent-foreground"
                )}>
                  Industrial
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    {industrialSystems.map((item) => (
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
                  isPeopleActive && "bg-accent text-accent-foreground"
                )}>
                  People
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    {peopleSystems.map((item) => (
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
                  isSoundActive && "bg-accent text-accent-foreground"
                )}>
                  Sounds
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    {soundSystems.map((item) => (
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

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "h-9",
                  isLanguageAIActive && "bg-accent text-accent-foreground"
                )}>
                  Language AI
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-1 p-2">
                    {languageAI.map((item) => (
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
