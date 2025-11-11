
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Square, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { WorkflowExecution } from '@/types/workflow';

export const WorkflowExecutions = ({ projectId }: { projectId?: string }) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchExecutions = async () => {
    try {
      let query = supabase
        .from('workflow_executions')
        .select(`
          *,
          workflows!inner(name, description)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      // Filter by project if projectId is provided
      if (projectId) {
        query = query.eq('workflows.project_id', projectId);
      }

      const { data: executionsData, error } = await query;

      if (error) throw error;

      const mappedExecutions: WorkflowExecution[] = (executionsData || []).map(exec => ({
        id: exec.id,
        workflow_id: exec.workflow_id,
        status: exec.status as 'running' | 'completed' | 'failed' | 'cancelled',
        started_at: exec.started_at,
        completed_at: exec.completed_at || undefined,
        error_message: exec.error_message || undefined,
        execution_data: exec.execution_data || {},
        duration_ms: exec.duration_ms || undefined,
        workflow: {
          name: (exec.workflows as any)?.name || 'Unknown Workflow',
          description: (exec.workflows as any)?.description || undefined,
        },
      }));

      setExecutions(mappedExecutions);
    } catch (error) {
      console.error('Error fetching executions:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow executions",
        variant: "destructive",
      });
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="w-4 h-4 text-[hsl(221,83%,53%)]" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-[hsl(142,76%,36%)]" />;
      case 'failed': return <XCircle className="w-4 h-4 text-[hsl(0,84%,50%)]" />;
      case 'cancelled': return <Square className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertCircle className="w-4 h-4 text-[hsl(48,96%,53%)]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-[hsl(221,83%,92%)] text-[hsl(221,83%,36%)] border-[hsl(221,83%,80%)]';
      case 'completed': return 'bg-[hsl(142,76%,92%)] text-[hsl(142,76%,36%)] border-[hsl(142,76%,80%)]';
      case 'failed': return 'bg-[hsl(0,84%,92%)] text-[hsl(0,84%,36%)] border-[hsl(0,84%,80%)]';
      case 'cancelled': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-[hsl(48,96%,92%)] text-[hsl(48,96%,36%)] border-[hsl(48,96%,80%)]';
    }
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return 'N/A';
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = execution.workflow?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      execution.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-lg" />
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
          <h1 className="text-3xl font-bold text-foreground">Workflow Executions</h1>
          <p className="text-muted-foreground mt-1">Monitor and track workflow execution history</p>
        </div>
        <Button onClick={fetchExecutions}>
          <Play className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search executions..."
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
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Executions List */}
      <div className="space-y-4">
        {filteredExecutions.map((execution) => (
          <Card key={execution.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(execution.status)}
                    <h3 className="text-lg font-semibold text-foreground">
                      {execution.workflow?.name || 'Unknown Workflow'}
                    </h3>
                    <Badge variant="outline" className={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {execution.workflow?.description || 'No description'}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <div className="font-medium text-foreground">
                        {format(new Date(execution.started_at), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium text-foreground">
                        {formatDuration(execution.duration_ms)}
                      </div>
                    </div>
                    
                    {execution.completed_at && (
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <div className="font-medium text-foreground">
                          {format(new Date(execution.completed_at), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-muted-foreground">Execution ID:</span>
                      <div className="font-medium font-mono text-xs text-foreground">
                        {execution.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  
                  {execution.error_message && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <span className="text-sm text-destructive">
                        <strong>Error:</strong> {execution.error_message}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExecutions.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No executions found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'Execute some workflows to see their history here'}
          </p>
        </div>
      )}
    </div>
  );
};
