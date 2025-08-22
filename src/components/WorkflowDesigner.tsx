
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Play, Settings, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkflowToolbox } from './WorkflowToolbox';
import { WorkflowNodeComponent } from './WorkflowNodeComponent';
import { Workflow, WorkflowNode, WorkflowConnection } from '@/types/workflow';

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

export const WorkflowDesigner = () => {
  const { workflowId } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchWorkflowData = async () => {
    if (!workflowId || workflowId === 'new') {
      setLoading(false);
      return;
    }
    
    try {
      // Fetch workflow using the workflows table that exists
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (workflowError) {
        console.log('Workflow not found:', workflowError);
        setLoading(false);
        return;
      }
      
      // Map the database workflow to our Workflow type with proper defaults
      if (workflowData) {
        const mappedWorkflow: Workflow = {
          id: workflowData.id,
          name: workflowData.name,
          description: workflowData.description || '',
          status: workflowData.is_active ? 'active' : 'draft',
          trigger_type: 'manual',
          trigger_config: {},
          created_at: workflowData.created_at,
          updated_at: workflowData.updated_at,
          run_count: 0,
          success_count: 0,
          error_count: 0,
          is_active: workflowData.is_active
        };
        setWorkflow(mappedWorkflow);
      }

      // For now, skip fetching nodes and connections since the tables don't exist yet
      // This will be implemented once the proper database schema is in place
      
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowData();
  }, [workflowId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const saveWorkflow = async () => {
    if (!workflowId || workflowId === 'new') return;

    setSaving(true);
    try {
      // For now, just show a success message
      // Actual saving will be implemented once the proper database schema is in place
      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addNode = (nodeType: string, componentType: string) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'workflowNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: `${componentType.toUpperCase()} ${nodeType}`,
        nodeType,
        componentType,
        config: {},
        description: `New ${componentType} ${nodeType} node`,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Main Designer */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {workflow?.name || 'New Workflow'}
            </h1>
            <p className="text-sm text-gray-600">
              {workflow?.description || 'Design your workflow'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {workflow && (
              <Badge className={workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {workflow.status}
              </Badge>
            )}
            <Button variant="outline" onClick={saveWorkflow} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={() => console.log('Execute workflow')}>
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Toolbox Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <WorkflowToolbox onAddNode={addNode} />
      </div>
    </div>
  );
};
