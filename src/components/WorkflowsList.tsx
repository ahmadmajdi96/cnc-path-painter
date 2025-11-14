
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Play, Pause, Edit, Trash2, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CreateWorkflowDialog } from './CreateWorkflowDialog';
import { useToast } from '@/hooks/use-toast';
import { Workflow } from '@/types/workflow';

interface WorkflowsListProps {
  projectId?: string;
}

export const WorkflowsList = ({ projectId }: WorkflowsListProps) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    try {
      // Only fetch workflows for the current project
      if (!projectId) {
        setWorkflows([]);
        return;
      }

      const { data, error } = await (supabase as any)
        .from('workflows')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflows:', error);
        setWorkflows([]);
        return;
      }

      // Map the database workflows to our Workflow type
      const mappedWorkflows: Workflow[] = (data || []).map((dbWorkflow: any) => ({
        id: dbWorkflow.id,
        name: dbWorkflow.name,
        description: dbWorkflow.description || '',
        status: dbWorkflow.is_active ? 'active' : 'draft',
        trigger_type: 'manual',
        trigger_config: {},
        created_at: dbWorkflow.created_at,
        updated_at: dbWorkflow.updated_at,
        run_count: 0,
        success_count: 0,
        error_count: 0,
        is_active: dbWorkflow.is_active
      }));

      setWorkflows(mappedWorkflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [projectId]);

  const toggleWorkflowStatus = async (workflow: Workflow) => {
    try {
      const newStatus = workflow.status === 'active' ? 'draft' : 'active';
      const newIsActive = newStatus === 'active';
      
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: newIsActive })
        .eq('id', workflow.id);

      if (error) throw error;
      
      setWorkflows(prev => 
        prev.map(w => w.id === workflow.id ? { ...w, status: newStatus, is_active: newIsActive } : w)
      );
      
      toast({
        title: "Success",
        description: `Workflow ${newStatus === 'active' ? 'activated' : 'paused'}`,
      });
    } catch (error) {
      console.error('Error updating workflow status:', error);
      toast({
        title: "Error",
        description: "Failed to update workflow status",
        variant: "destructive",
      });
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;
      
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'draft': return 'bg-muted text-muted-foreground border-border';
      case 'error': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">Create and manage automated workflows</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground">{workflow.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                </div>
                <Badge variant="outline" className={getStatusColor(workflow.status)}>
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Runs: {workflow.run_count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Success: {workflow.success_count || 0}
                  </span>
                </div>
              </div>

              {/* Trigger Type */}
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Trigger: {workflow.trigger_type}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Link to={`/software/workflows/designer/${workflow.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleWorkflowStatus(workflow)}
                  className={workflow.status === 'active' ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}
                >
                  {workflow.status === 'active' ? (
                    <>
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Activate
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteWorkflow(workflow.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No workflows found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first workflow to get started'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          )}
        </div>
      )}

      <CreateWorkflowDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        onWorkflowCreated={fetchWorkflows}
      />
    </div>
  );
};
