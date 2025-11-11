import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, FolderKanban, DollarSign, LayoutDashboard } from 'lucide-react';

export const AdminNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/clients', label: 'Clients', icon: Users },
    { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { path: '/admin/payments', label: 'Payments', icon: DollarSign },
    { path: '/admin/employees', label: 'Employees', icon: Users },
    { path: '/admin/expenses', label: 'Expenses', icon: DollarSign },
  ];

  return (
    <nav className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              Back to Portals
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center gap-2 ${
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
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
        
        <div className="text-sm text-muted-foreground">
          Admin Portal
        </div>
      </div>
    </nav>
  );
};
