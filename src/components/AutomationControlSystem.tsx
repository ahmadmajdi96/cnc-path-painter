
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap, CheckCircle, Database } from 'lucide-react';
import { AutomationFilters } from './AutomationFilters';
import { AutomationList } from './AutomationList';
import { AddAutomationDialog } from './AddAutomationDialog';
import { EditAutomationDialog } from './EditAutomationDialog';
import { toast } from 'sonner';

export interface AutomationParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
}

export interface OperationInputMapping {
  id: string;
  targetParameter: string;
  source: 'automation_input' | 'previous_operation' | 'environment';
  sourceParameter: string;
  sourceOperationId?: string;
}

export interface AutomationOperation {
  id: string;
  order: number;
  type: 'crud_operation' | 'file_operation' | 'logical_operation' | 'mathematical_operation' | 'run_script';
  name: string;
  inputMappings: OperationInputMapping[];
  environmentVariables: EnvironmentVariable[];
  config: {
    // CRUD operation
    operation?: 'create' | 'read' | 'update' | 'delete';
    database?: string;
    table?: string;
    columns?: string[]; // For read operation - columns to select, ['*'] for all
    conditions?: { 
      id: string;
      field: string; 
      operator: string; 
      value: string; 
      logicalOperator?: 'AND' | 'OR' 
    }[];
    data?: { [key: string]: any };
    
    // File operation
    fileOperation?: 'download' | 'upload' | 'delete' | 'open' | 'write';
    filePath?: string;
    fileContent?: string;
    
    // Logical operation
    logicalOperator?: 'and' | 'or' | 'not' | 'if' | 'switch';
    condition?: string;
    cases?: { id: string; value: string; actions: string[] }[];
    
    // Mathematical operation
    mathOperator?: 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo' | 'power' | 'sqrt';
    operands?: string[];
    
    // Script operation
    scriptLanguage?: 'python' | 'javascript' | 'bash';
    scriptContent?: string;
  };
  outputParameters: AutomationParameter[];
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  operations: AutomationOperation[];
  inputParameters: AutomationParameter[];
  outputParameters: AutomationParameter[];
  environmentVariables: EnvironmentVariable[];
  createdAt: string;
  updatedAt: string;
}

export const AutomationControlSystem = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Data Sync Workflow',
      description: 'Syncs data between databases',
      enabled: true,
      operations: [
        {
          id: 'op1',
          order: 1,
          type: 'crud_operation',
          name: 'Read Source Data',
          inputMappings: [
            { 
              id: 'im1',
              targetParameter: 'status_filter', 
              source: 'automation_input', 
              sourceParameter: 'filter_status' 
            }
          ],
          environmentVariables: [],
          config: {
            operation: 'read',
            database: 'production_db',
            table: 'orders',
            columns: ['id', 'customer', 'total', 'status'],
            conditions: [
              { id: 'c1', field: 'status', operator: '=', value: 'pending', logicalOperator: 'AND' },
              { id: 'c2', field: 'total', operator: '>', value: '100' }
            ]
          },
          outputParameters: [
            { id: 'o1', name: 'orders', type: 'array', required: true }
          ]
        },
        {
          id: 'op2',
          order: 2,
          type: 'crud_operation',
          name: 'Write to Archive',
          inputMappings: [
            { 
              id: 'im2',
              targetParameter: 'data', 
              source: 'previous_operation', 
              sourceParameter: 'orders', 
              sourceOperationId: 'op1' 
            }
          ],
          environmentVariables: [],
          config: {
            operation: 'create',
            database: 'archive_db',
            table: 'orders_archive',
            data: {}
          },
          outputParameters: []
        }
      ],
      inputParameters: [
        { id: 'p1', name: 'filter_status', type: 'string', required: true, description: 'Status to filter' },
        { id: 'p2', name: 'date_from', type: 'string', required: true }
      ],
      outputParameters: [
        { id: 'out1', name: 'synced_count', type: 'number', required: true },
        { id: 'out2', name: 'status', type: 'string', required: true }
      ],
      environmentVariables: [
        { id: 'env1', key: 'DB_CONNECTION_STRING', value: 'postgresql://localhost:5432', description: 'Database connection' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  
  const [filteredAutomations, setFilteredAutomations] = useState<Automation[]>(automations);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddAutomation = (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAutomation: Automation = {
      ...automation,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAutomations([...automations, newAutomation]);
    toast.success('Automation created successfully');
  };

  const handleEditAutomation = (automation: Automation) => {
    const updatedAutomations = automations.map(a => a.id === automation.id ? automation : a);
    setAutomations(updatedAutomations);
    setFilteredAutomations(updatedAutomations);
    toast.success('Automation updated successfully');
  };

  const handleDeleteAutomation = (id: string) => {
    const updatedAutomations = automations.filter(a => a.id !== id);
    setAutomations(updatedAutomations);
    setFilteredAutomations(updatedAutomations);
    toast.success('Automation deleted successfully');
  };

  const handleToggleAutomation = (id: string) => {
    const updatedAutomations = automations.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    setAutomations(updatedAutomations);
    setFilteredAutomations(updatedAutomations);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Management</h1>
          <p className="text-muted-foreground mt-2">Configure automation functions for integration workflows</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
            <p className="text-xs text-muted-foreground">
              {automations.filter(a => a.enabled).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.reduce((sum, a) => sum + a.operations.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all automations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Type</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>CRUD:</span>
                <span className="font-medium">{automations.flatMap(a => a.operations).filter(o => o.type === 'crud_operation').length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>File:</span>
                <span className="font-medium">{automations.flatMap(a => a.operations).filter(o => o.type === 'file_operation').length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Logic/Math:</span>
                <span className="font-medium">{automations.flatMap(a => a.operations).filter(o => o.type === 'logical_operation' || o.type === 'mathematical_operation').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AutomationFilters 
            automations={automations}
            onFilterChange={setFilteredAutomations}
          />
        </div>
        <div className="lg:col-span-3">
          <AutomationList
            automations={filteredAutomations}
            onEdit={(automation) => {
              setSelectedAutomation(automation);
              setIsEditDialogOpen(true);
            }}
            onDelete={handleDeleteAutomation}
            onToggle={handleToggleAutomation}
          />
        </div>
      </div>

      <AddAutomationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddAutomation}
      />

      <EditAutomationDialog
        automation={selectedAutomation}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditAutomation}
      />
    </div>
  );
};
