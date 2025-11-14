
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Link as LinkIcon, Layout, GitBranch } from 'lucide-react';
import { useProjectId } from '@/hooks/useProjectId';

export const SoftwareNavigation = () => {
  const location = useLocation();
  const { projectId } = useProjectId();
  const baseUrl = projectId ? `/admin/project/${projectId}` : '';
  
  const navItems = [
    { path: `${baseUrl}/software/integrations`, label: 'Integrations', icon: LinkIcon },
    { path: `${baseUrl}/software/ui-builder`, label: 'UI Builder', icon: Layout },
    { path: `${baseUrl}/software/automation`, label: 'Automation', icon: Zap },
    { path: `${baseUrl}/software/workflows`, label: 'Workflows', icon: GitBranch },
  ];

  return (
    <nav className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={baseUrl ? `${baseUrl}` : "/"}>
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
          Industrial Software Portal
        </div>
      </div>
    </nav>
  );
};
