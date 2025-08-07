import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IntegrationList } from './IntegrationList';
import { IntegrationFilters } from './IntegrationFilters';
import { AddIntegrationDialog } from './AddIntegrationDialog';
import { EditIntegrationDialog } from './EditIntegrationDialog';
import { IntegrationTestPanel } from './IntegrationTestPanel';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'testing' | 'error';
  sourceEndpoint: {
    protocol: string;
    host: string;
    port: number;
    path?: string;
    auth?: { type: string; credentials: any };
  };
  targetEndpoint: {
    protocol: string;
    host: string;
    port: number;
    path?: string;
    auth?: { type: string; credentials: any };
  };
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
  lastTest?: {
    timestamp: string;
    status: 'success' | 'failure';
    response?: any;
    error?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const IntegrationControlSystem = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'ERP to MES Integration',
      description: 'Real-time data synchronization between ERP and Manufacturing Execution System',
      status: 'active',
      sourceEndpoint: {
        protocol: 'REST_API',
        host: 'erp-system.company.com',
        port: 443,
        path: '/api/v1/manufacturing',
        auth: { type: 'oauth2', credentials: {} }
      },
      targetEndpoint: {
        protocol: 'MQTT',
        host: 'mes-broker.local',
        port: 1883,
        path: '/production/data'
      },
      parameters: {
        timeout: 30000,
        retryAttempts: 3,
        dataFormat: 'json',
        mappingRules: []
      },
      dataConfiguration: {
        receiveDataType: 'json',
        sendDataType: 'json',
        expectedParameters: [
          {
            id: '1',
            name: 'productionOrderId',
            type: 'string',
            required: true,
            description: 'Unique identifier for production order'
          },
          {
            id: '2',
            name: 'quantity',
            type: 'number',
            required: true,
            description: 'Number of items to produce'
          }
        ],
        variableMappings: [
          {
            id: '1',
            sourceField: 'order_id',
            targetField: 'productionOrderId',
            transformation: 'toUpperCase()'
          },
          {
            id: '2',
            sourceField: 'qty',
            targetField: 'quantity'
          }
        ]
      },
      lastTest: {
        timestamp: '2024-01-15T10:30:00Z',
        status: 'success'
      },
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'SCADA to Database Sync',
      description: 'Historical data archiving from SCADA system to time-series database',
      status: 'testing',
      sourceEndpoint: {
        protocol: 'OPC_UA',
        host: '192.168.1.100',
        port: 4840,
        path: '/OPCUA/Server'
      },
      targetEndpoint: {
        protocol: 'HTTP',
        host: 'influxdb.company.com',
        port: 8086,
        path: '/write'
      },
      parameters: {
        timeout: 15000,
        retryAttempts: 5,
        dataFormat: 'json',
        mappingRules: []
      },
      dataConfiguration: {
        receiveDataType: 'binary',
        sendDataType: 'json',
        expectedParameters: [
          {
            id: '3',
            name: 'timestamp',
            type: 'string',
            required: true,
            description: 'ISO 8601 timestamp'
          },
          {
            id: '4',
            name: 'sensorValues',
            type: 'array',
            required: true,
            description: 'Array of sensor readings'
          }
        ],
        variableMappings: [
          {
            id: '3',
            sourceField: 'time',
            targetField: 'timestamp',
            transformation: 'toISOString()'
          },
          {
            id: '4',
            sourceField: 'data',
            targetField: 'sensorValues'
          }
        ]
      },
      createdAt: '2024-01-12T14:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z'
    }
  ]);

  const [filteredIntegrations, setFilteredIntegrations] = useState<Integration[]>(integrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  const handleAddIntegration = (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIntegration: Integration = {
      ...integration,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedIntegrations = [...integrations, newIntegration];
    setIntegrations(updatedIntegrations);
    setFilteredIntegrations(updatedIntegrations);
  };

  const handleEditIntegration = (updatedIntegration: Integration) => {
    const updatedIntegrations = integrations.map(integration =>
      integration.id === updatedIntegration.id
        ? { ...updatedIntegration, updatedAt: new Date().toISOString() }
        : integration
    );
    setIntegrations(updatedIntegrations);
    setFilteredIntegrations(updatedIntegrations);
  };

  const handleDeleteIntegration = (id: string) => {
    const updatedIntegrations = integrations.filter(integration => integration.id !== id);
    setIntegrations(updatedIntegrations);
    setFilteredIntegrations(updatedIntegrations);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integration Management</h1>
          <p className="text-gray-600">Configure and manage system integrations and data flows</p>
        </div>
        <div className="flex gap-2">
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
          />
        </div>
      </div>

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
