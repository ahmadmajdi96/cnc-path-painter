import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProjectOverview from './ProjectOverview';
import ProjectWorkflows from './ProjectWorkflows';

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

  const navItems = [
    { path: `/admin/project/${projectId}`, label: 'Overview' },
    { path: `/admin/project/${projectId}/workflows`, label: 'Workflows' },
  ];

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
          
          <div className="text-sm text-muted-foreground">
            {project && `${project.name} - ${project.clients?.company_name}`}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ProjectOverview />} />
        <Route path="/workflows" element={<ProjectWorkflows />} />
      </Routes>
    </div>
  );
};

export default ProjectDashboard;
