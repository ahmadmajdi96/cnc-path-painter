
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wrench, Zap, Box, Bot, Target, Eye, Truck, ArrowLeft } from 'lucide-react';

export const MainNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/hardware/', label: 'CNC Control', icon: Wrench },
    { path: '/hardware/laser-marking', label: 'Laser Marking', icon: Target },
    { path: '/hardware/3d-printer', label: '3D Printer', icon: Box },
    { path: '/hardware/robotic-arms', label: 'Robotic Arms', icon: Bot },
    { path: '/hardware/vision-system', label: 'Vision System', icon: Eye },
    { path: '/hardware/conveyor-belts', label: 'Conveyor Belts', icon: Truck }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Portals
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-gray-300" />
          
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
        </div>
        
        <div className="text-sm text-gray-600">
          Industrial Hardware Portal
        </div>
      </div>
    </nav>
  );
};
