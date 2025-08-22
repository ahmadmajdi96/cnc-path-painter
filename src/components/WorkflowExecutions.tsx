
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Play, Square, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { WorkflowExecution } from '@/types/workflow';

export const WorkflowExecutions = () => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_executions' as any)
        .select(`
          *,
          workflows (
            name,
            description
          )
        `)
        .order('started_at', { ascending: false });

      if (error) {
        console.log('Error fetching executions:', error);
        setExecutions([]);
      } else {
        setExecutions(data || []);
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow executions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('workflow_executions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'workflow_executions' 
      }, () => {
        fetchExecutions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled': return <Square className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
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

  const filteredExecutions = executions.filter(execution =>
    execution.workflow?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    execution.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
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
          <h1 className="text-2xl font-bold text-gray-900">Workflow Executions</h1>
          <p className="text-gray-600">Monitor and track workflow execution history</p>
        </div>
        <Button onClick={fetchExecutions}>
          <Play className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search executions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
                    <h3 className="text-lg font-semibold">
                      {execution.workflow?.name || 'Unknown Workflow'}
                    </h3>
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {execution.workflow?.description || 'No description'}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Started:</span>
                      <div className="font-medium">
                        {format(new Date(execution.started_at), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">
                        {formatDuration(execution.duration_ms)}
                      </div>
                    </div>
                    
                    {execution.completed_at && (
                      <div>
                        <span className="text-gray-500">Completed:</span>
                        <div className="font-medium">
                          {format(new Date(execution.completed_at), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-500">Execution ID:</span>
                      <div className="font-medium font-mono text-xs">
                        {execution.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  
                  {execution.error_message && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <span className="text-sm text-red-800">
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
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No executions found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Execute some workflows to see their history here'}
          </p>
        </div>
      )}
    </div>
  );
};
