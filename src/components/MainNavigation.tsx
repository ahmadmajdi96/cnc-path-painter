
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wrench, Zap, Box, Bot, Target, Eye, Truck } from 'lucide-react';

export const MainNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'CNC Control', icon: Wrench },
    { path: '/laser-control', label: 'Laser Control', icon: Zap },
    { path: '/laser-marking', label: 'Laser Marking', icon: Target },
    { path: '/3d-printer', label: '3D Printer', icon: Box },
    { path: '/robotic-arms', label: 'Robotic Arms', icon: Bot },
    { path: '/vision-system', label: 'Vision System', icon: Eye },
    { path: '/conveyor-belts', label: 'Conveyor Belts', icon: Truck }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`flex items-center gap-2 ${
                    isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        
        <div className="text-sm text-gray-600">
          Industrial Control System
        </div>
      </div>
    </nav>
  );
};
