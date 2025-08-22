
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Play, Pause, Edit, Trash2, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CreateWorkflowDialog } from './CreateWorkflowDialog';
import { useToast } from '@/hooks/use-toast';

export const WorkflowsList = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const toggleWorkflowStatus = async (workflow: any) => {
    try {
      const newStatus = workflow.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('workflows')
        .update({ status: newStatus })
        .eq('id', workflow.id);

      if (error) throw error;
      
      setWorkflows(prev => 
        prev.map(w => w.id === workflow.id ? { ...w, status: newStatus } : w)
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

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600">Create and manage automated workflows</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{workflow.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                </div>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Runs: {workflow.run_count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Success: {workflow.success_count || 0}
                  </span>
                </div>
              </div>

              {/* Trigger Type */}
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
                  className={workflow.status === 'active' ? 'text-yellow-600' : 'text-green-600'}
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
                  className="text-red-600 hover:bg-red-50"
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
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
          <p className="text-gray-600 mb-4">
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
        onWorkflowCreated={fetchWorkflows}
      />
    </div>
  );
};
