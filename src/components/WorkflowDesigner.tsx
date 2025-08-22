
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

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

export const WorkflowDesigner = () => {
  const { workflowId } = useParams();
  const [workflow, setWorkflow] = useState<any>(null);
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
      // Fetch workflow
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (workflowError) throw workflowError;
      setWorkflow(workflowData);

      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('workflow_nodes')
        .select('*')
        .eq('workflow_id', workflowId);

      if (nodesError) {
        console.log('Error fetching nodes:', nodesError);
        // Continue without nodes for now
      }

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('workflow_connections')
        .select('*')
        .eq('workflow_id', workflowId);

      if (connectionsError) {
        console.log('Error fetching connections:', connectionsError);
        // Continue without connections for now
      }

      // Convert to React Flow format
      const flowNodes: Node[] = (nodesData || []).map((node: any) => ({
        id: node.id,
        type: 'workflowNode',
        position: { x: node.position_x, y: node.position_y },
        data: {
          label: node.name,
          nodeType: node.node_type,
          componentType: node.component_type,
          config: node.config,
          description: node.description,
        },
      }));

      const flowEdges: Edge[] = (connectionsData || []).map((conn: any) => ({
        id: conn.id,
        source: conn.source_node_id,
        target: conn.target_node_id,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        label: conn.condition_type !== 'always' ? conn.condition_type : undefined,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
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
      // Save nodes
      for (const node of nodes) {
        const nodeData = {
          workflow_id: workflowId,
          name: node.data.label,
          node_type: node.data.nodeType,
          component_type: node.data.componentType,
          position_x: node.position.x,
          position_y: node.position.y,
          config: node.data.config || {},
          description: node.data.description,
        };

        const { error } = await supabase
          .from('workflow_nodes')
          .upsert({ id: node.id, ...nodeData });

        if (error) {
          console.error('Error saving node:', error);
        }
      }

      // Save edges
      for (const edge of edges) {
        const connectionData = {
          workflow_id: workflowId,
          source_node_id: edge.source,
          target_node_id: edge.target,
          condition_type: edge.label || 'always',
          condition_value: {},
        };

        const { error } = await supabase
          .from('workflow_connections')
          .upsert({ id: edge.id, ...connectionData });

        if (error) {
          console.error('Error saving connection:', error);
        }
      }

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
            <Background variant="dots" gap={12} size={1} />
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
