
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AutomationFilters } from './AutomationFilters';
import { AutomationList } from './AutomationList';
import { AddAutomationDialog } from './AddAutomationDialog';
import { EditAutomationDialog } from './EditAutomationDialog';

export interface AutomationParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  type: 'database_retrieve' | 'crud_operation' | 'run_script';
  enabled: boolean;
  config: {
    // Database retrieve
    query?: string;
    database?: string;
    
    // CRUD operation
    operation?: 'create' | 'read' | 'update' | 'delete';
    table?: string;
    fields?: string[];
    conditions?: Record<string, any>;
    
    // Run script
    scriptFile?: File | null;
    scriptFileName?: string;
    scriptLanguage?: 'python';
    environment?: Record<string, string>;
  };
  inputParameters: AutomationParameter[];
  outputParameters: AutomationParameter[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const AutomationControlSystem = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Get User Data',
      description: 'Retrieve user information from database',
      type: 'database_retrieve',
      enabled: true,
      config: {
        query: 'SELECT * FROM users WHERE id = $1',
        database: 'main_db'
      },
      inputParameters: [
        {
          id: 'p1',
          name: 'userId',
          type: 'string',
          required: true,
          description: 'User ID to retrieve'
        }
      ],
      outputParameters: [
        {
          id: 'o1',
          name: 'userData',
          type: 'object',
          required: true,
          description: 'User data object'
        }
      ],
      tags: ['database', 'user'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Update Product Status',
      description: 'Update product status in inventory',
      type: 'crud_operation',
      enabled: true,
      config: {
        operation: 'update',
        table: 'products',
        fields: ['status', 'updated_at']
      },
      inputParameters: [
        {
          id: 'p1',
          name: 'productId',
          type: 'string',
          required: true
        },
        {
          id: 'p2',
          name: 'status',
          type: 'string',
          required: true
        }
      ],
      outputParameters: [
        {
          id: 'o1',
          name: 'success',
          type: 'boolean',
          required: true
        }
      ],
      tags: ['crud', 'product'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [filteredAutomations, setFilteredAutomations] = useState<Automation[]>(automations);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddAutomation = (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAutomation: Automation = {
      ...automation,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium text-gray-600">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>DB: {automations.filter(a => a.type === 'database_retrieve').length}</div>
              <div>CRUD: {automations.filter(a => a.type === 'crud_operation').length}</div>
              <div>Script: {automations.filter(a => a.type === 'run_script').length}</div>
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
