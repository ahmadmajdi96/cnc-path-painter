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
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Play, Settings, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkflowToolbox } from './WorkflowToolbox';
import { WorkflowNodeComponent } from './WorkflowNodeComponent';
import { ComponentSelectionDialog } from './ComponentSelectionDialog';
import { Workflow, WorkflowNode, WorkflowConnection } from '@/types/workflow';

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

export const WorkflowDesigner = ({ projectId }: { projectId?: string }) => {
  const { workflowId } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [edgeType, setEdgeType] = useState<'smoothstep' | 'default' | 'straight' | 'step'>('smoothstep');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showComponentDialog, setShowComponentDialog] = useState(false);
  const [pendingNodeType, setPendingNodeType] = useState<{ nodeType: string; componentType: string; filterType?: string } | null>(null);
  const { toast } = useToast();

  const fetchWorkflowData = async () => {
    if (!workflowId || workflowId === 'new') {
      setLoading(false);
      return;
    }
    
    try {
      // Fetch workflow using the workflows table that exists
      // Filter by projectId to ensure project isolation
      let query = supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data: workflowData, error: workflowError } = await query.single();

      if (workflowError) {
        console.log('Workflow not found:', workflowError);
        setLoading(false);
        return;
      }
      
      // Map the database workflow to our Workflow type
      if (workflowData) {
        const mappedWorkflow: Workflow = {
          id: workflowData.id,
          name: workflowData.name,
          description: workflowData.description || '',
          status: (workflowData.status || 'draft') as 'draft' | 'active' | 'paused' | 'completed' | 'error',
          trigger_type: (workflowData.trigger_type || 'manual') as 'manual' | 'schedule' | 'webhook' | 'event' | 'file_change',
          trigger_config: workflowData.trigger_config || {},
          created_at: workflowData.created_at,
          updated_at: workflowData.updated_at,
          last_run: workflowData.last_run,
          next_run: workflowData.next_run,
          run_count: workflowData.run_count || 0,
          success_count: workflowData.success_count || 0,
          error_count: workflowData.error_count || 0,
          is_active: workflowData.is_active
        };
        setWorkflow(mappedWorkflow);
      }

      // Fetch workflow nodes (project isolation enforced by workflow_id belonging to project)
      const { data: nodesData, error: nodesError } = await supabase
        .from('workflow_nodes')
        .select('*')
        .eq('workflow_id', workflowId);

      if (nodesError) {
        console.error('Error fetching nodes:', nodesError);
      } else if (nodesData && nodesData.length > 0) {
        const flowNodes = nodesData.map(node => ({
          id: node.id,
          type: 'workflowNode',
          position: { x: Number(node.position_x), y: Number(node.position_y) },
          data: {
            label: node.name,
            nodeType: node.node_type,
            componentType: node.component_type,
            config: node.config || {},
            description: node.description,
            existingComponentId: node.component_id,
          },
        }));
        setNodes(flowNodes);
      }

      // Fetch workflow connections (project isolation enforced by workflow_id belonging to project)
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('workflow_connections')
        .select('*')
        .eq('workflow_id', workflowId);

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
      } else if (connectionsData && connectionsData.length > 0) {
        const flowEdges = connectionsData.map(conn => ({
          id: conn.id,
          source: conn.source_node_id,
          target: conn.target_node_id,
          sourceHandle: conn.source_handle,
          targetHandle: conn.target_handle,
          type: conn.edge_type || edgeType,
          animated: true,
          style: { stroke: 'hsl(var(--primary))' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--primary))',
          },
        }));
        setEdges(flowEdges);
      }
      
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
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: edgeType,
      animated: true,
      style: { stroke: 'hsl(var(--primary))' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--primary))',
      },
    }, eds)),
    [setEdges, edgeType]
  );

  // Update edge types when edgeType changes
  const updateEdgeTypes = useCallback(() => {
    setEdges((eds) => 
      eds.map((edge) => ({
        ...edge,
        type: edgeType,
      }))
    );
  }, [edgeType, setEdges]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[], edges: Edge[] }) => {
    setSelectedNodes(selectedNodes.map(node => node.id));
    setSelectedEdges(selectedEdges.map(edge => edge.id));
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    if (selectedNodes.length > 0) {
      setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
      setEdges((eds) => eds.filter((edge) => 
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      ));
    }
    
    if (selectedEdges.length > 0) {
      setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge.id)));
    }
    
    const totalDeleted = selectedNodes.length + selectedEdges.length;
    setSelectedNodes([]);
    setSelectedEdges([]);
    
    toast({
      title: "Success",
      description: `Deleted ${totalDeleted} item(s)`,
    });
  }, [selectedNodes, selectedEdges, setNodes, setEdges, toast]);

  const saveWorkflow = async () => {
    if (!workflowId || workflowId === 'new') return;

    setSaving(true);
    try {
      // Delete existing nodes and connections for this workflow
      await supabase.from('workflow_nodes').delete().eq('workflow_id', workflowId);
      await supabase.from('workflow_connections').delete().eq('workflow_id', workflowId);

      // Save nodes
      if (nodes.length > 0) {
        const nodesToInsert = nodes.map(node => ({
          id: node.id,
          workflow_id: workflowId,
          node_type: node.data.nodeType,
          component_type: node.data.componentType,
          component_id: node.data.existingComponentId || null,
          position_x: node.position.x,
          position_y: node.position.y,
          config: node.data.config || {},
          name: node.data.label,
          description: node.data.description || null,
        }));

        const { error: nodesError } = await supabase
          .from('workflow_nodes')
          .insert(nodesToInsert);

        if (nodesError) throw nodesError;
      }

      // Save connections
      if (edges.length > 0) {
        const connectionsToInsert = edges.map(edge => ({
          workflow_id: workflowId,
          source_node_id: edge.source,
          target_node_id: edge.target,
          source_handle: edge.sourceHandle || 'output',
          target_handle: edge.targetHandle || 'input',
          edge_type: edge.type || edgeType,
          condition_type: edge.sourceHandle === 'failure' ? 'error' : edge.sourceHandle === 'success' ? 'success' : 'always',
        }));

        const { error: connectionsError } = await supabase
          .from('workflow_connections')
          .insert(connectionsToInsert);

        if (connectionsError) throw connectionsError;
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

  const handleAddNodeRequest = (nodeType: string, componentType: string) => {
    if (componentType === 'existing') {
      // Show the dialog to select from existing components
      setPendingNodeType({ nodeType, componentType: 'cnc' }); // Default to cnc, will be updated by toolbox
      setShowComponentDialog(true);
    } else {
      addNode(nodeType, componentType);
    }
  };

  const handleAddNodeRequestWithComponentType = (nodeType: string, componentType: string, specificType?: string, filterType?: string) => {
    if (componentType === 'existing' && specificType) {
      setPendingNodeType({ nodeType, componentType: specificType, filterType });
      setShowComponentDialog(true);
    } else {
      handleAddNodeRequest(nodeType, componentType);
    }
  };

  const addNode = (nodeType: string, componentType: string, existingComponent?: any) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'workflowNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: existingComponent 
          ? `${existingComponent.name || existingComponent.model}` 
          : `${componentType.toUpperCase()} ${nodeType}`,
        nodeType,
        componentType: existingComponent ? existingComponent.type || componentType : componentType,
        config: existingComponent || {},
        description: existingComponent 
          ? `Connected to ${existingComponent.name || existingComponent.model}`
          : `New ${componentType} ${nodeType} node`,
        existingComponentId: existingComponent?.id,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleComponentSelected = (component: any) => {
    if (pendingNodeType) {
      addNode(pendingNodeType.nodeType, pendingNodeType.componentType, component);
      setPendingNodeType(null);
    }
    setShowComponentDialog(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
        event.preventDefault();
        deleteSelectedNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, selectedEdges, deleteSelectedNodes]);

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
        <div className="border-b bg-background px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {workflow?.name || 'New Workflow'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {workflow?.description || 'Design your automated workflow'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Edge Type Control */}
            <div className="flex items-center gap-2 border-r pr-3">
              <label className="text-sm text-muted-foreground">Line Style:</label>
              <Select value={edgeType} onValueChange={(value: any) => setEdgeType(value)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smoothstep">Curved</SelectItem>
                  <SelectItem value="default">Bezier</SelectItem>
                  <SelectItem value="straight">Straight</SelectItem>
                  <SelectItem value="step">Step</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={updateEdgeTypes}
                className="h-8 text-xs"
                disabled={edges.length === 0}
              >
                Apply to All
              </Button>
            </div>

            {workflow && (
              <Badge 
                variant={workflow.status === 'active' ? 'default' : 'secondary'}
              >
                {workflow.status}
              </Badge>
            )}
            {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
              <Button 
                variant="outline" 
                onClick={deleteSelectedNodes}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedNodes.length + selectedEdges.length})
              </Button>
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
        <div className="flex-1 bg-muted/20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
            multiSelectionKeyCode="Shift"
            deleteKeyCode={['Delete', 'Backspace']}
            defaultEdgeOptions={{
              type: edgeType,
              animated: true,
              style: { stroke: 'hsl(var(--primary))' },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'hsl(var(--primary))',
              },
            }}
            className="workflow-canvas"
          >
            <Controls className="bg-card border rounded-lg shadow-md" />
            <MiniMap 
              className="bg-card border rounded-lg shadow-md" 
              nodeColor={(node) => {
                if (node.selected) return 'hsl(var(--primary))';
                switch (node.data.nodeType) {
                  case 'trigger': return 'hsl(142, 76%, 36%)';
                  case 'action': return 'hsl(221, 83%, 53%)';
                  case 'condition': return 'hsl(48, 96%, 53%)';
                  case 'delay': return 'hsl(271, 76%, 53%)';
                  case 'loop': return 'hsl(239, 84%, 67%)';
                  case 'end': return 'hsl(0, 84%, 60%)';
                  default: return 'hsl(var(--muted))';
                }
              }}
            />
            <Background gap={16} size={1} color="hsl(var(--muted-foreground) / 0.15)" />
          </ReactFlow>
        </div>
      </div>

      {/* Toolbox Sidebar */}
      <div className="w-80 bg-background border-l overflow-hidden">
        <WorkflowToolbox onAddNode={handleAddNodeRequestWithComponentType} />
      </div>

      {/* Component Selection Dialog */}
      <ComponentSelectionDialog
        open={showComponentDialog}
        onOpenChange={setShowComponentDialog}
        onComponentSelected={handleComponentSelected}
        componentType={pendingNodeType?.componentType || ''}
        filterType={pendingNodeType?.filterType}
      />
    </div>
  );
};
