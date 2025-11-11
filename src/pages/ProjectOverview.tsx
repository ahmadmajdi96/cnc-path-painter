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
      // Fetch integrations count
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('integrations')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      // Fetch automations count  
      const { data: automationsData, error: automationsError } = await supabase
        .from('automations')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      // Fetch datasets count
      const { data: datasetsData, error: datasetsError } = await supabase
        .from('datasets')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      // Fetch chatbots count
      const { data: chatbotsData, error: chatbotsError } = await supabase
        .from('chatbots')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      // Fetch workflows count
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('workflows')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const componentStats = {
        integrations: integrationsData?.length || 0,
        automations: automationsData?.length || 0,
        datasets: datasetsData?.length || 0,
        chatbots: chatbotsData?.length || 0,
        workflows: workflowsData?.length || 0,
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
        <Card 
          className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-indigo-600 hover:scale-[1.02]"
          onClick={() => window.location.href = `/admin/project/${projectId}/software`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Blocks className="h-8 w-8 mr-3 text-indigo-600" />
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Software Portal</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Integrations & Automations</p>
                </div>
              </div>
              <Button variant="default" size="lg">
                Open Portal →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-indigo-600" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.integrations}</div>
                  <div className="text-xs text-muted-foreground">Integrations</div>
                </div>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-indigo-600" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.automations}</div>
                  <div className="text-xs text-muted-foreground">Automations</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Portal Section */}
      <div className="mb-8">
        <Card 
          className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-blue-600 hover:scale-[1.02]"
          onClick={() => window.location.href = `/admin/project/${projectId}/ai`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-8 w-8 mr-3 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">AI Portal</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Datasets & Chatbots</p>
                </div>
              </div>
              <Button variant="default" size="lg">
                Open Portal →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.datasets}</div>
                  <div className="text-xs text-muted-foreground">Datasets</div>
                </div>
              </div>
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.chatbots}</div>
                  <div className="text-xs text-muted-foreground">Chatbots</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Portal Section */}
      <div className="mb-8">
        <Card 
          className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-purple-600 hover:scale-[1.02]"
          onClick={() => window.location.href = `/admin/project/${projectId}/workflows`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <WorkflowIcon className="h-8 w-8 mr-3 text-purple-600" />
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Workflow Portal</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Process Automation</p>
                </div>
              </div>
              <Button variant="default" size="lg">
                Open Portal →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <WorkflowIcon className="h-5 w-5 mr-2 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.workflows}</div>
                <div className="text-xs text-muted-foreground">Workflows</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectOverview;
