import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Workflow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface ProjectWorkflow {
  id: string;
  component_name: string;
  created_at: string;
}

const ProjectWorkflows = () => {
  const { projectId } = useParams();
  const [projectWorkflows, setProjectWorkflows] = useState<ProjectWorkflow[]>([]);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    if (!projectId) return;

    try {
      // Fetch project workflows
      const { data: projectWorkflowsData, error: projectError } = await supabase
        .from('project_components')
        .select('*')
        .eq('project_id', projectId)
        .eq('component_type', 'workflow')
        .order('created_at', { ascending: false });

      if (projectError) throw projectError;
      setProjectWorkflows(projectWorkflowsData || []);

      // Fetch all available workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('workflows')
        .select('id, name, description, is_active')
        .order('name');

      if (workflowsError) throw workflowsError;
      setAvailableWorkflows(workflowsData || []);
    } catch (error: any) {
      toast.error('Failed to fetch workflows');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkflow = async () => {
    if (!selectedWorkflowId || !projectId) return;

    try {
      const selectedWorkflow = availableWorkflows.find(w => w.id === selectedWorkflowId);
      if (!selectedWorkflow) return;

      const { error } = await supabase.from('project_components').insert([
        {
          project_id: projectId,
          component_type: 'workflow',
          component_id: selectedWorkflowId,
          component_name: selectedWorkflow.name,
        },
      ]);

      if (error) throw error;

      toast.success('Workflow added to project');
      setIsAddDialogOpen(false);
      setSelectedWorkflowId('');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to add workflow');
      console.error(error);
    }
  };

  const handleRemoveWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to remove this workflow from the project?')) return;

    try {
      const { error } = await supabase
        .from('project_components')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Workflow removed from project');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to remove workflow');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflow Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage workflows assigned to this project
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Workflow to Project</DialogTitle>
              <DialogDescription>
                Select a workflow to assign to this project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a workflow" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkflows
                    .filter(w => !projectWorkflows.some(pw => pw.component_name === w.name))
                    .map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWorkflow} disabled={!selectedWorkflowId}>
                  Add Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow Name</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : projectWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No workflows assigned to this project
                  </TableCell>
                </TableRow>
              ) : (
                projectWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">{workflow.component_name}</TableCell>
                    <TableCell>
                      {new Date(workflow.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveWorkflow(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectWorkflows;
