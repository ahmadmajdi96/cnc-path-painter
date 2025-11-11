import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Blocks, Bot, Workflow as WorkflowIcon, Link as LinkIcon, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface ComponentStats {
  integrations: number;
  automations: number;
  datasets: number;
  chatbots: number;
  workflows: number;
}

const ProjectOverview = () => {
  const { projectId } = useParams();
  const [stats, setStats] = useState<ComponentStats>({
    integrations: 0,
    automations: 0,
    datasets: 0,
    chatbots: 0,
    workflows: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [projectId]);

  const fetchStats = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('project_components')
        .select('component_type')
        .eq('project_id', projectId);

      if (error) throw error;

      const componentStats = {
        integrations: data?.filter(c => c.component_type === 'integration').length || 0,
        automations: data?.filter(c => c.component_type === 'automation').length || 0,
        datasets: data?.filter(c => c.component_type === 'dataset').length || 0,
        chatbots: data?.filter(c => c.component_type === 'chatbot').length || 0,
        workflows: data?.filter(c => c.component_type === 'workflow').length || 0,
      };

      setStats(componentStats);
    } catch (error: any) {
      toast.error('Failed to fetch project statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Project Overview</h1>
        <p className="text-muted-foreground mt-2">
          View statistics and manage components for this project
        </p>
      </div>

      {/* Software Portal Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
          <Blocks className="h-6 w-6 mr-2 text-indigo-600" />
          Software Portal Components
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Integrations</CardTitle>
              <LinkIcon className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.integrations}</div>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                <Plus className="h-3 w-3 mr-1" />
                Add Integration
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Automations</CardTitle>
              <Zap className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.automations}</div>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                <Plus className="h-3 w-3 mr-1" />
                Add Automation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Portal Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
          <Bot className="h-6 w-6 mr-2 text-blue-600" />
          AI Portal Components
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Datasets</CardTitle>
              <Bot className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.datasets}</div>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                <Plus className="h-3 w-3 mr-1" />
                Add Dataset
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chatbots</CardTitle>
              <Bot className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.chatbots}</div>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                <Plus className="h-3 w-3 mr-1" />
                Add Chatbot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workflow Portal Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
          <WorkflowIcon className="h-6 w-6 mr-2 text-purple-600" />
          Workflow Portal Components
        </h2>
        <div className="grid gap-6 md:grid-cols-1">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Workflows</CardTitle>
              <WorkflowIcon className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.workflows}</div>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                <Plus className="h-3 w-3 mr-1" />
                Add Workflow
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
