
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AutomationFilters } from './AutomationFilters';
import { AutomationList } from './AutomationList';
import { AddAutomationDialog } from './AddAutomationDialog';
import { EditAutomationDialog } from './EditAutomationDialog';
import { AutomationExecutionPanel } from './AutomationExecutionPanel';

export interface TriggerConfig {
  type: 'request' | 'file_change' | 'schedule' | 'database_change' | 'webhook' | 'manual';
  config: {
    // Request trigger
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint?: string;
    headers?: Record<string, string>;
    
    // File change trigger
    watchPath?: string;
    filePattern?: string;
    operation?: 'create' | 'modify' | 'delete' | 'move';
    
    // Schedule trigger
    cronExpression?: string;
    timezone?: string;
    
    // Database change trigger
    table?: string;
    operation_db?: 'insert' | 'update' | 'delete';
    conditions?: string;
    
    // Webhook trigger
    webhookUrl?: string;
    secret?: string;
  };
}

export interface ActionConfig {
  type: 'file_operation' | 'database_operation' | 'api_request' | 'upload_file' | 'download_file' | 'send_email' | 'run_script';
  config: {
    // File operations
    operation?: 'create' | 'read' | 'update' | 'delete' | 'move' | 'copy';
    sourcePath?: string;
    targetPath?: string;
    content?: string;
    
    // Database operations
    query?: string;
    table?: string;
    data?: Record<string, any>;
    
    // API requests
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: string;
    
    // File upload/download
    uploadProtocol?: 'http' | 'ftp' | 'sftp' | 's3' | 'azure_blob' | 'gcs';
    bucket?: string;
    endpoint?: string;
    credentials?: {
      username?: string;
      password?: string;
      apiKey?: string;
      accessKey?: string;
      secretKey?: string;
    };
    
    // Email
    to?: string[];
    subject?: string;
    template?: string;
    
    // Script execution
    script?: string;
    language?: 'javascript' | 'python' | 'bash' | 'powershell';
    environment?: Record<string, string>;
  };
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: TriggerConfig;
  actions: ActionConfig[];
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  timeout: number;
  tags: string[];
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successCount: number;
  errorCount: number;
}

export const AutomationControlSystem = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'File Processing Automation',
      description: 'Process uploaded files and move to archive',
      enabled: true,
      trigger: {
        type: 'file_change',
        config: {
          watchPath: '/uploads',
          filePattern: '*.pdf',
          operation: 'create'
        }
      },
      actions: [
        {
          type: 'file_operation',
          config: {
            operation: 'move',
            sourcePath: '/uploads/{filename}',
            targetPath: '/processed/{filename}'
          }
        }
      ],
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      timeout: 30000,
      tags: ['file-processing', 'pdf'],
      createdAt: new Date(),
      lastExecuted: new Date(),
      executionCount: 156,
      successCount: 152,
      errorCount: 4
    }
  ]);
  
  const [filteredAutomations, setFilteredAutomations] = useState<Automation[]>(automations);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);

  const handleAddAutomation = (automation: Omit<Automation, 'id' | 'createdAt' | 'executionCount' | 'successCount' | 'errorCount'>) => {
    const newAutomation: Automation = {
      ...automation,
      id: Date.now().toString(),
      createdAt: new Date(),
      executionCount: 0,
      successCount: 0,
      errorCount: 0
    };
    const updatedAutomations = [...automations, newAutomation];
    setAutomations(updatedAutomations);
    setFilteredAutomations(updatedAutomations);
  };

  const handleEditAutomation = (automation: Automation) => {
    const updatedAutomations = automations.map(a => a.id === automation.id ? automation : a);
    setAutomations(updatedAutomations);
    setFilteredAutomations(updatedAutomations);
  };

  const handleDeleteAutomation = (id: string) => {
    const updatedAutomations = automations.filter(a => a.id !== id);
    setAutomations(updatedAutomations);
    setFilteredAutomations(updatedAutomations);
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
          <h1 className="text-3xl font-bold text-gray-900">Automation Management</h1>
          <p className="text-gray-600 mt-2">Configure triggers and actions for automated workflows</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {automations.filter(a => a.enabled).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.reduce((sum, a) => sum + a.executionCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {automations.length > 0 
                ? Math.round((automations.reduce((sum, a) => sum + a.successCount, 0) / 
                   automations.reduce((sum, a) => sum + a.executionCount, 1)) * 100)
                : 0}%
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
            onViewExecution={(automation) => {
              setSelectedAutomation(automation);
              setIsExecutionPanelOpen(true);
            }}
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

      <AutomationExecutionPanel
        automation={selectedAutomation}
        open={isExecutionPanelOpen}
        onOpenChange={setIsExecutionPanelOpen}
      />
    </div>
  );
};
