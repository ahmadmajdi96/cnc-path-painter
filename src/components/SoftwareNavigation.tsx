
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Code, Link as LinkIcon, Layout } from 'lucide-react';

export const SoftwareNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/software/services', label: 'Services', icon: Settings },
    { path: '/software/integrations', label: 'Integrations', icon: LinkIcon },
    { path: '/software/ui-builder', label: 'UI Builder', icon: Layout },
    { path: '/software/automation', label: 'Automation', icon: Zap },
    { path: '/software/app-builder', label: 'App Builder', icon: Code },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              Back to Portals
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
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
          Industrial Software Portal
        </div>
      </div>
    </nav>
  );
};
