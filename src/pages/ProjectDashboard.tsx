import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProjectOverview from './ProjectOverview';
import ProjectWorkflows from './ProjectWorkflows';
import SoftwarePortal from './SoftwarePortal';
import AIPortal from './AIPortal';
import WorkflowsPortal from './WorkflowsPortal';

interface Project {
  id: string;
  name: string;
  clients: {
    company_name: string;
  };
}

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    checkAuth();
    fetchProject();
  }, [projectId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: isAdmin } = await supabase.rpc('is_admin', { check_user_id: session.user.id });
    if (!isAdmin) {
      navigate('/admin/login');
    }
  };

  const fetchProject = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        clients (
          company_name
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return;
    }

    setProject(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Determine which portal we're in based on current path
  const isSoftwarePortal = location.pathname.includes('/software');
  const isAIPortal = location.pathname.includes('/ai');
  const isWorkflowsPortal = location.pathname.includes('/workflows');

  const navItems = [
    { path: `/admin/project/${projectId}`, label: 'Overview' },
  ];

  // Add Software Portal navigation items
  if (isSoftwarePortal) {
    navItems.push(
      { path: `/admin/project/${projectId}/software/integrations`, label: 'Integrations' },
      { path: `/admin/project/${projectId}/software/ui-builder`, label: 'UI Builder' },
      { path: `/admin/project/${projectId}/software/automation`, label: 'Automation' },
      { path: `/admin/project/${projectId}/software/workflows`, label: 'Workflows' }
    );
  }

  // Add AI Portal navigation items
  if (isAIPortal) {
    navItems.push(
      { path: `/admin/project/${projectId}/ai/dataset-builder`, label: 'Dataset Builder' },
      { path: `/admin/project/${projectId}/ai/chatbots`, label: 'Chat Bots' },
      { path: `/admin/project/${projectId}/ai/datasets-combiner`, label: 'Datasets Combiner' }
    );
  }

  // Add Workflows Portal navigation items
  if (isWorkflowsPortal && !isSoftwarePortal) {
    navItems.push(
      { path: `/admin/project/${projectId}/workflows`, label: 'All Workflows' },
      { path: `/admin/project/${projectId}/workflows/designer`, label: 'Designer' },
      { path: `/admin/project/${projectId}/workflows/executions`, label: 'Executions' }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/projects">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </Link>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center gap-2 ${
                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {project && `${project.name} - ${project.clients?.company_name}`}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ProjectOverview />} />
        <Route path="/software/*" element={<SoftwarePortal projectId={projectId} hideNavigation />} />
        <Route path="/ai/*" element={<AIPortal projectId={projectId} hideNavigation />} />
        <Route path="/workflows/*" element={<WorkflowsPortal projectId={projectId} hideNavigation />} />
      </Routes>
    </div>
  );
};

export default ProjectDashboard;
