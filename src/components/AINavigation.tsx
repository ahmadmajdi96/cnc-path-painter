
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { aiNavItems } from '@/nav-items-ai';
import { ArrowLeft } from 'lucide-react';

export const AINavigation = () => {
  const location = useLocation();
  
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
            {aiNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center gap-2 ${
                      isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          AI Services Portal
        </div>
      </div>
    </nav>
  );
};
