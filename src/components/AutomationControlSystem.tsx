
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
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file' | 'list' | 'dict';
  required: boolean;
  description?: string;
  exampleValue?: string;
  defaultValue?: any;
}

export interface OperationInputMapping {
  id: string;
  source: 'automation_input' | 'previous_operation';
  sourceParameter: string;
  sourceOperationId?: string;
}

export interface AutomationOperation {
  id: string;
  order: number;
  type: 'crud_operation' | 'file_operation' | 'logic_conditions' | 'run_script' | 'http_request' | 'delay' | 'manual_operation';
  name: string;
  description?: string;
  inputMappings: OperationInputMapping[];
  
  // Problem 9: Conditional execution per operation
  runCondition?: {
    enabled: boolean;
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'exists';
    value: string;
    source: 'automation_input' | 'previous_operation';
    sourceOperationId?: string;
  };
  
  // Problem 5: Iteration support
  iteration?: {
    enabled: boolean;
    sourceArray: string; // The array to iterate over
    itemVariable: string; // Variable name for each item
    source: 'automation_input' | 'previous_operation';
    sourceOperationId?: string;
  };
  
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
    downloadProtocol?: 'http' | 'tcp_ip' | 's3';
    downloadUrl?: string;
    httpMethod?: 'GET' | 'POST';
    tcpHost?: string;
    tcpPort?: string;
    tcpTimeout?: string;
    s3Bucket?: string;
    s3Region?: string;
    s3Key?: string;
    
    // HTTP Request operation (Problem 1)
    httpRequestMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    httpRequestUrl?: string;
    httpRequestHeaders?: { key: string; value: string }[];
    httpRequestBody?: string;
    httpRequestTimeout?: number;
    // Dynamic HTTP request body builder
    httpRequestBodyFields?: {
      id: string;
      key: string;
      source: 'manual' | 'integration_env' | 'automation_input' | 'automation_output' | 'operation_output';
      value: string;
      sourceOperationId?: string;
    }[];
    
    // Data Transformation operation (Problem 1)
    transformationType?: 'csv_to_json' | 'json_to_csv' | 'xml_to_json' | 'filter' | 'map' | 'aggregate';
    transformationScript?: string;
    
    // Messaging operation (Problem 1)
    messagingType?: 'email' | 'slack' | 'sms' | 'webhook';
    messagingRecipient?: string;
    messagingSubject?: string;
    messagingBody?: string;
    
    // Delay operation (Problem 1)
    delayDuration?: number;
    delayUnit?: 'seconds' | 'minutes' | 'hours';
    
    // Logic & Conditions operation (combines logical, mathematical, and conditional)
    operationType?: 'logical' | 'mathematical' | 'conditional';
    
    // Dynamic operations for mathematical and logical operations
    operations?: {
      id: string;
      operator: string; // '+', '-', '*', '/', '%', '^', 'concat', 'merge', 'AND', 'OR', 'NOT', 'XOR'
      operands: {
        id: string;
        source: 'manual' | 'current_operation' | 'previous_operation' | 'integration_env' | 'automation_input';
        value: string;
        sourceOperationId?: string;
      }[];
      outputName: string; // Name of the output variable for this operation
    }[];
    
    // Logical operators (returns boolean) - kept for backward compatibility
    logicalOperator?: 'AND' | 'OR' | 'NOT' | 'XOR';
    
    // Mathematical operators (returns number/string/json) - kept for backward compatibility
    mathOperator?: '+' | '-' | '*' | '/' | '%' | '^' | 'concat' | 'merge';
    
    // Conditional operators (returns boolean)
    conditionalOperator?: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
    
    // Variables for logic/math/conditional operations - kept for backward compatibility
    variables?: string[];
    
    // Script operation
    scriptLanguage?: 'python' | 'javascript' | 'bash';
    scriptContent?: string;
  };
  outputParameters: AutomationParameter[];
  
  // Problem 8: Output transformation
  outputTransformation?: {
    enabled: boolean;
    format?: 'json' | 'csv' | 'xml' | 'text';
    transformationRule?: string;
  };
  
  // Success/Failure routing (Problem 6: Enhanced routing)
  onSuccess?: {
    action: 'continue' | 'goto' | 'end' | 'label';
    targetOperationId?: string;
    label?: string;
  };
  onFailure?: {
    action: 'continue' | 'goto' | 'end' | 'retry' | 'compensate' | 'alert' | 'goto_integration';
    targetOperationId?: string;
    targetIntegrationId?: string;
    retryCount?: number;
    retryDelay?: number; // in seconds
    compensatingOperationId?: string;
    alertMessage?: string;
    label?: string;
  };
  
  // Problem 10: Template metadata
  isTemplate?: boolean;
  templateName?: string;
  
  // Problem 3: Validation status
  validationStatus?: 'untested' | 'valid' | 'invalid' | 'testing';
  validationMessage?: string;
}

export interface DynamicOutputParameter {
  id: string;
  type: 'boolean' | 'from_operations' | 'from_variables';
  booleanValue?: boolean;
  selectedOperations?: {
    operationId: string;
    outputParameterId: string;
  }[];
  selectedVariables?: {
    source: 'integration_env' | 'automation_input';
    variableName: string;
  }[];
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  operations: AutomationOperation[];
  inputParameters: AutomationParameter[];
  outputParameters: DynamicOutputParameter[];
  onFailure?: {
    action: 'retry' | 'fail' | 'goto_operation' | 'goto_integration';
    targetOperationId?: string;
    targetIntegrationId?: string;
    retryCount?: number;
    retryDelay?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const AutomationControlSystem = ({ projectId }: { projectId?: string }) => {
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
              source: 'automation_input', 
              sourceParameter: 'filter_status' 
            }
          ],
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
            { id: 'o1', name: 'orders', type: 'array', required: true, exampleValue: '[{...}]' }
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
              source: 'previous_operation', 
              sourceParameter: 'orders', 
              sourceOperationId: 'op1' 
            }
          ],
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
        { id: 'p1', name: 'filter_status', type: 'string', required: true, description: 'Status to filter', exampleValue: 'pending' },
        { id: 'p2', name: 'date_from', type: 'string', required: true, exampleValue: '2024-01-01' }
      ],
      outputParameters: [
        { 
          id: 'out1', 
          type: 'from_operations',
          selectedOperations: [
            { operationId: 'op2', outputParameterId: 'result' }
          ]
        }
      ],
      onFailure: {
        action: 'retry',
        retryCount: 3,
        retryDelay: 5
      },
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
                <span>Logic & Conditions:</span>
                <span className="font-medium">{automations.flatMap(a => a.operations).filter(o => o.type === 'logic_conditions').length}</span>
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
