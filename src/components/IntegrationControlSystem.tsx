
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IntegrationList } from './IntegrationList';
import { IntegrationFilters } from './IntegrationFilters';
import { AddIntegrationDialog } from './AddIntegrationDialog';
import { EditIntegrationDialog } from './EditIntegrationDialog';
import { IntegrationTestPanel } from './IntegrationTestPanel';
import { IntegrationLiveDataPanel } from './IntegrationLiveDataPanel';
import { IntegrationStatusCards } from './IntegrationStatusCards';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AutomationStep {
  id: string;
  automationId: string;
  automationName: string;
  order: number;
  variableMappings: Array<{
    id: string;
    sourceType: 'integration' | 'previous_step';
    sourceStepId?: string;
    sourceField: string;
    targetParameter: string;
  }>;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'testing' | 'error';
  resultDestination: 'client' | 'forward';
  configuration: {
    host: string;
    port: number;
    protocol: string;
    auth: { 
      type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'api_key' | 'certificate' | 'digest';
      credentials: any;
    };
  };
  sourceEndpoint: {
    protocol: string;
    auth?: { 
      type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'api_key' | 'certificate' | 'digest';
      credentials: any;
    };
  };
  targetEndpoint: {
    protocol: string;
    host: string;
    port: number;
    path?: string;
    auth?: { 
      type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'api_key' | 'certificate' | 'digest';
      credentials: any;
    };
  };
  automationSteps: AutomationStep[];
  outputMappings: Array<{
    id: string;
    sourceType: 'integration' | 'step';
    sourceStepId?: string;
    sourceField: string;
    targetField: string;
  }>;
  parameters: {
    timeout: number;
    retryAttempts: number;
    dataFormat: 'json' | 'xml' | 'binary' | 'text';
    mappingRules: any[];
  };
  dataConfiguration?: {
    receiveDataType: 'json' | 'xml' | 'binary' | 'text';
    sendDataType: 'json' | 'xml' | 'binary' | 'text';
    expectedParameters: Array<{
      id: string;
      name: string;
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required: boolean;
      description?: string;
    }>;
    variableMappings: Array<{
      id: string;
      sourceField: string;
      targetField: string;
      transformation?: string;
    }>;
  };
  liveData?: {
    lastReceived?: {
      timestamp: string;
      data: any;
      size: number;
    };
    lastSent?: {
      timestamp: string;
      data: any;
      size: number;
    };
    receivedCount: number;
    sentCount: number;
    errors: Array<{
      timestamp: string;
      type: 'receive' | 'send';
      message: string;
    }>;
  };
  lastTest?: {
    timestamp: string;
    status: 'success' | 'failure';
    response?: any;
    error?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface IntegrationControlSystemProps {
  projectId?: string;
}

export const IntegrationControlSystem = ({ projectId }: IntegrationControlSystemProps) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [filteredIntegrations, setFilteredIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showLiveDataPanel, setShowLiveDataPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, [projectId]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      
      // Build query based on whether projectId is provided
      let query = supabase
        .from('integrations')
        .select('*');
      
      // If projectId is provided, filter by it
      // If projectId is undefined, show all integrations (no project filter)
      if (projectId !== undefined) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching integrations:', error);
        toast.error('Failed to load integrations');
        return;
      }

      // Map database fields to Integration interface
      const mappedData: Integration[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        status: item.status,
        resultDestination: item.result_destination,
        configuration: item.configuration,
        sourceEndpoint: item.source_endpoint,
        targetEndpoint: item.target_endpoint,
        automationSteps: item.automation_steps || [],
        outputMappings: item.output_mappings || [],
        parameters: item.parameters,
        dataConfiguration: item.data_configuration,
        liveData: item.live_data,
        lastTest: item.last_test,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setIntegrations(mappedData);
      setFilteredIntegrations(mappedData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = async (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert([{
          project_id: projectId || null,
          name: integration.name,
          description: integration.description,
          status: integration.status,
          result_destination: integration.resultDestination,
          configuration: integration.configuration as any,
          source_endpoint: integration.sourceEndpoint as any,
          target_endpoint: integration.targetEndpoint as any,
          automation_steps: integration.automationSteps as any,
          output_mappings: integration.outputMappings as any,
          parameters: integration.parameters as any,
          data_configuration: integration.dataConfiguration as any,
          live_data: integration.liveData as any,
          last_test: integration.lastTest as any
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Integration created successfully');
      fetchIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error('Failed to create integration');
    }
  };

  const handleEditIntegration = async (updatedIntegration: Integration) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({
          name: updatedIntegration.name,
          description: updatedIntegration.description,
          status: updatedIntegration.status,
          result_destination: updatedIntegration.resultDestination,
          configuration: updatedIntegration.configuration as any,
          source_endpoint: updatedIntegration.sourceEndpoint as any,
          target_endpoint: updatedIntegration.targetEndpoint as any,
          automation_steps: updatedIntegration.automationSteps as any,
          output_mappings: updatedIntegration.outputMappings as any,
          parameters: updatedIntegration.parameters as any,
          data_configuration: updatedIntegration.dataConfiguration as any,
          live_data: updatedIntegration.liveData as any,
          last_test: updatedIntegration.lastTest as any
        })
        .eq('id', updatedIntegration.id);

      if (error) throw error;

      toast.success('Integration updated successfully');
      fetchIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
      toast.error('Failed to update integration');
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Integration deleted successfully');
      fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Failed to delete integration');
    }
  };

  const handleFilter = (searchTerm: string, statusFilter: string, protocolFilter: string) => {
    let filtered = integrations;

    if (searchTerm) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(integration => integration.status === statusFilter);
    }

    if (protocolFilter) {
      filtered = filtered.filter(integration => 
        integration.sourceEndpoint.protocol === protocolFilter ||
        integration.targetEndpoint.protocol === protocolFilter
      );
    }

    setFilteredIntegrations(filtered);
  };

  // Filter integrations by projectId if provided
  React.useEffect(() => {
    if (projectId) {
      // When projectId is provided, show only integrations for this project
      // For now, we're using mock data, so we'll just show empty initially
      setIntegrations([]);
      setFilteredIntegrations([]);
    }
  }, [projectId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {projectId ? 'Project Integration Management' : 'Integration Management'}
          </h1>
          <p className="text-gray-600">
            {projectId 
              ? 'Configure and manage integrations for this project' 
              : 'Configure and manage system integrations and data flows'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLiveDataPanel(!showLiveDataPanel)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Live Data
          </Button>
          <Button
            onClick={() => setShowTestPanel(!showTestPanel)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Test Panel
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Integration
          </Button>
        </div>
      </div>

      <IntegrationStatusCards integrations={integrations} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <IntegrationFilters onFilter={handleFilter} />
        </div>
        
        <div className="lg:col-span-3">
          <IntegrationList
            integrations={filteredIntegrations}
            onEdit={(integration) => {
              setSelectedIntegration(integration);
              setShowEditDialog(true);
            }}
            onDelete={handleDeleteIntegration}
            onTest={(integration) => {
              setSelectedIntegration(integration);
              setShowTestPanel(true);
            }}
            onViewLiveData={(integration) => {
              setSelectedIntegration(integration);
              setShowLiveDataPanel(true);
            }}
          />
        </div>
      </div>

      {showLiveDataPanel && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Live Data Monitor</CardTitle>
            <CardDescription>Real-time data flow monitoring for integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationLiveDataPanel 
              integration={selectedIntegration}
              onClose={() => setShowLiveDataPanel(false)}
            />
          </CardContent>
        </Card>
      )}

      {showTestPanel && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Integration Test Panel</CardTitle>
            <CardDescription>Test and configure integration endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationTestPanel 
              integration={selectedIntegration}
              onClose={() => setShowTestPanel(false)}
            />
          </CardContent>
        </Card>
      )}

      <AddIntegrationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddIntegration}
        projectId={projectId}
      />

      {selectedIntegration && (
        <EditIntegrationDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          integration={selectedIntegration}
          onEdit={handleEditIntegration}
        />
      )}
    </div>
  );
};
