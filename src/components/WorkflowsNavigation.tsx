
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Workflow, PlayCircle, Settings, List } from 'lucide-react';
import { useProjectId } from '@/hooks/useProjectId';

export const WorkflowsNavigation = () => {
  const location = useLocation();
  const { projectId } = useProjectId();
  const baseUrl = projectId ? `/admin/project/${projectId}` : '';
  
  const navItems = [
    { path: `${baseUrl}/workflows/`, label: 'All Workflows', icon: List },
    { path: `${baseUrl}/workflows/designer`, label: 'Designer', icon: Workflow },
    { path: `${baseUrl}/workflows/executions`, label: 'Executions', icon: PlayCircle },
  ];

  return (
    <nav className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={baseUrl ? `${baseUrl}` : "/"}>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Portals
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                             (item.path === '/workflows/designer' && location.pathname.includes('/designer'));
              
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
          Workflows Portal
        </div>
      </div>
    </nav>
  );
};
