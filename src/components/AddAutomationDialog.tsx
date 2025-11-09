import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Database, FileText, Calculator, GitBranch, ArrowRight, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Automation, AutomationOperation, AutomationParameter, OperationInputMapping, EnvironmentVariable } from './AutomationControlSystem';

interface AddAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

// Mock databases and tables
const mockDatabases = ['users_db', 'products_db', 'orders_db', 'analytics_db'];
const mockTables: Record<string, string[]> = {
  'users_db': ['users', 'profiles', 'sessions', 'permissions'],
  'products_db': ['products', 'categories', 'inventory', 'suppliers'],
  'orders_db': ['orders', 'order_items', 'payments', 'shipping'],
  'analytics_db': ['events', 'metrics', 'reports', 'logs']
};

export const AddAutomationDialog: React.FC<AddAutomationDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [operations, setOperations] = useState<AutomationOperation[]>([]);
  const [inputParameters, setInputParameters] = useState<AutomationParameter[]>([]);
  const [outputParameters, setOutputParameters] = useState<AutomationParameter[]>([]);
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([]);
  const [returnType, setReturnType] = useState('');
  const [complexityLevel, setComplexityLevel] = useState<'simple' | 'intermediate' | 'advanced'>('simple');
  const [preferredLibraries, setPreferredLibraries] = useState<string>('');

  const handleSubmit = () => {
    if (!name) {
      alert('Please enter an automation name');
      return;
    }

    if (operations.length === 0) {
      alert('Please add at least one operation');
      return;
    }

    onAdd({
      name,
      description,
      category,
      enabled,
      operations,
      inputParameters,
      outputParameters,
      environmentVariables,
      metadata: {
        returnType: returnType || undefined,
        complexityLevel,
        preferredLibraries: preferredLibraries ? preferredLibraries.split(',').map(lib => lib.trim()) : []
      }
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setEnabled(true);
    setOperations([]);
    setInputParameters([]);
    setOutputParameters([]);
    setEnvironmentVariables([]);
    setReturnType('');
    setComplexityLevel('simple');
    setPreferredLibraries('');
  };

  const addOperation = () => {
    const newOperation: AutomationOperation = {
      id: Math.random().toString(36).substr(2, 9),
      order: operations.length + 1,
      type: 'crud_operation',
      name: `Operation ${operations.length + 1}`,
      config: {},
      inputMappings: [],
      environmentVariables: [],
      outputParameters: []
    };
    setOperations([...operations, newOperation]);
  };

  const updateOperation = (id: string, updates: Partial<AutomationOperation>) => {
    setOperations(operations.map(op => op.id === id ? { ...op, ...updates } : op));
  };

  const removeOperation = (id: string) => {
    setOperations(operations.filter(op => op.id !== id).map((op, idx) => ({ ...op, order: idx + 1 })));
  };

  // Input Mappings
  const addInputMapping = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    const newMapping: OperationInputMapping = {
      id: Math.random().toString(36).substr(2, 9),
      targetParameter: '',
      source: 'automation_input',
      sourceParameter: ''
    };

    updateOperation(operationId, {
      inputMappings: [...operation.inputMappings, newMapping]
    });
  };

  const updateInputMapping = (operationId: string, mappingId: string, updates: Partial<OperationInputMapping>) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    updateOperation(operationId, {
      inputMappings: operation.inputMappings.map(m => m.id === mappingId ? { ...m, ...updates } : m)
    });
  };

  const removeInputMapping = (operationId: string, mappingId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    updateOperation(operationId, {
      inputMappings: operation.inputMappings.filter(m => m.id !== mappingId)
    });
  };

  // Operation Environment Variables
  const addOperationEnvVar = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    const newEnvVar: EnvironmentVariable = {
      id: Math.random().toString(36).substr(2, 9),
      key: '',
      value: '',
      description: ''
    };

    updateOperation(operationId, {
      environmentVariables: [...operation.environmentVariables, newEnvVar]
    });
  };

  const updateOperationEnvVar = (operationId: string, envId: string, updates: Partial<EnvironmentVariable>) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    updateOperation(operationId, {
      environmentVariables: operation.environmentVariables.map(e => e.id === envId ? { ...e, ...updates } : e)
    });
  };

  const removeOperationEnvVar = (operationId: string, envId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    updateOperation(operationId, {
      environmentVariables: operation.environmentVariables.filter(e => e.id !== envId)
    });
  };

  // Operation Output Parameters
  const addOperationOutputParameter = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    const newParam: AutomationParameter = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'string',
      required: false,
      description: '',
      exampleValue: ''
    };

    updateOperation(operationId, {
      outputParameters: [...operation.outputParameters, newParam]
    });
  };

  const updateOperationOutputParameter = (operationId: string, paramId: string, updates: Partial<AutomationParameter>) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    updateOperation(operationId, {
      outputParameters: operation.outputParameters.map(p => p.id === paramId ? { ...p, ...updates } : p)
    });
  };

  const removeOperationOutputParameter = (operationId: string, paramId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    updateOperation(operationId, {
      outputParameters: operation.outputParameters.filter(p => p.id !== paramId)
    });
  };

  // Automation Input Parameters
  const addInputParameter = () => {
    const newParam: AutomationParameter = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'string',
      required: false,
      description: '',
      exampleValue: ''
    };
    setInputParameters([...inputParameters, newParam]);
  };

  const updateInputParameter = (id: string, updates: Partial<AutomationParameter>) => {
    setInputParameters(inputParameters.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeInputParameter = (id: string) => {
    setInputParameters(inputParameters.filter(p => p.id !== id));
  };

  // Automation Output Parameters
  const addOutputParameter = () => {
    const newParam: AutomationParameter = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'string',
      required: false,
      description: '',
      exampleValue: ''
    };
    setOutputParameters([...outputParameters, newParam]);
  };

  const updateOutputParameter = (id: string, updates: Partial<AutomationParameter>) => {
    setOutputParameters(outputParameters.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeOutputParameter = (id: string) => {
    setOutputParameters(outputParameters.filter(p => p.id !== id));
  };

  // Automation Environment Variables
  const addEnvironmentVariable = () => {
    const newEnvVar: EnvironmentVariable = {
      id: Math.random().toString(36).substr(2, 9),
      key: '',
      value: '',
      description: ''
    };
    setEnvironmentVariables([...environmentVariables, newEnvVar]);
  };

  const updateEnvironmentVariable = (id: string, updates: Partial<EnvironmentVariable>) => {
    setEnvironmentVariables(environmentVariables.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeEnvironmentVariable = (id: string) => {
    setEnvironmentVariables(environmentVariables.filter(e => e.id !== id));
  };

  // CRUD Conditions
  const addCondition = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    const newCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      operator: '=',
      value: '',
      logicalOperator: 'AND' as 'AND' | 'OR'
    };

    updateOperation(operationId, {
      config: {
        ...operation.config,
        conditions: [...(operation.config.conditions || []), newCondition]
      }
    });
  };

  const updateCondition = (operationId: string, conditionId: string, updates: any) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    updateOperation(operationId, {
      config: {
        ...operation.config,
        conditions: (operation.config.conditions || []).map(c => c.id === conditionId ? { ...c, ...updates } : c)
      }
    });
  };

  const removeCondition = (operationId: string, conditionId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    updateOperation(operationId, {
      config: {
        ...operation.config,
        conditions: (operation.config.conditions || []).filter(c => c.id !== conditionId)
      }
    });
  };

  // Column Management
  const toggleColumn = (operationId: string, column: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    const currentColumns = operation.config.columns || [];
    let newColumns: string[];
    
    if (column === '*') {
      newColumns = ['*'];
    } else {
      const filteredColumns = currentColumns.filter(c => c !== '*');
      if (filteredColumns.includes(column)) {
        newColumns = filteredColumns.filter(c => c !== column);
      } else {
        newColumns = [...filteredColumns, column];
      }
    }

    updateOperation(operationId, {
      config: {
        ...operation.config,
        columns: newColumns.length > 0 ? newColumns : undefined
      }
    });
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'crud_operation':
        return <Database className="h-4 w-4" />;
      case 'file_operation':
        return <FileText className="h-4 w-4" />;
      case 'logic_conditions':
        return <GitBranch className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPreviousOperationsForMapping = (currentOperationId: string) => {
    const currentIndex = operations.findIndex(op => op.id === currentOperationId);
    return operations.slice(0, currentIndex);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw]">
        <DialogHeader>
          <DialogTitle>Create New Automation</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(95vh-140px)] pr-4">
          <div className="space-y-6 py-4">
            {/* 1. Basic Information */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Automation Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Download Sales Report"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category / Tag</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Data Processing, AI, API Integration"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain what this automation does (e.g., Fetches daily sales data from the S3 bucket and stores it in the database)"
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                  <Label>Status: {enabled ? 'Enabled' : 'Disabled'}</Label>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* 2. Environment Variables */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    Environment Variables
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addEnvironmentVariable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Define reusable variables like API keys, tokens, and global settings</p>
              </CardHeader>
              <CardContent className="space-y-3">

                {environmentVariables.map((envVar) => (
                  <div key={envVar.id} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Key</Label>
                        <Input
                          className="w-full h-8"
                          value={envVar.key}
                          onChange={(e) => updateEnvironmentVariable(envVar.id, { key: e.target.value })}
                          placeholder="API_KEY"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Value</Label>
                        <Input
                          className="w-full h-8"
                          value={envVar.value}
                          onChange={(e) => updateEnvironmentVariable(envVar.id, { value: e.target.value })}
                          placeholder="your-api-key-here"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button variant="ghost" size="sm" onClick={() => removeEnvironmentVariable(envVar.id)} className="w-full md:w-auto h-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        className="h-8"
                        value={envVar.description || ''}
                        onChange={(e) => updateEnvironmentVariable(envVar.id, { description: e.target.value })}
                        placeholder="What is this variable for?"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Separator />

            {/* 3. Input Parameters */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    Input Parameters
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addInputParameter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Input
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Define what the automation needs to run</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {inputParameters.map((param) => (
                  <div key={param.id} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <Label className="text-xs">Name *</Label>
                        <Input
                          className="w-full h-8"
                          value={param.name}
                          onChange={(e) => updateInputParameter(param.id, { name: e.target.value })}
                          placeholder="file_url"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select value={param.type} onValueChange={(value: any) => updateInputParameter(param.id, { type: value })}>
                          <SelectTrigger className="w-full h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="object">Object</SelectItem>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                            <SelectItem value="dict">Dict</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Description</Label>
                        <Input
                          className="h-8"
                          value={param.description || ''}
                          onChange={(e) => updateInputParameter(param.id, { description: e.target.value })}
                          placeholder="What this parameter represents"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button variant="ghost" size="sm" onClick={() => removeInputParameter(param.id)} className="w-full md:w-auto h-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Example Value</Label>
                        <Input
                          className="h-8"
                          value={param.exampleValue || ''}
                          onChange={(e) => updateInputParameter(param.id, { exampleValue: e.target.value })}
                          placeholder="https://example.com/data.csv"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={param.required} onCheckedChange={(checked) => updateInputParameter(param.id, { required: checked })} />
                        <Label className="text-xs">Required</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Separator />

            {/* 4. Operations (Sequential Logic) */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                    Operations (Sequential Logic)
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addOperation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Operation
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Add sequential steps that the automation performs</p>
              </CardHeader>
              <CardContent className="space-y-4">

              {operations.map((operation, index) => (
                <Card key={operation.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getOperationIcon(operation.type)}
                        Operation {index + 1}: {operation.name}
                        {index > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => removeOperation(operation.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Operation Name */}
                    <div>
                      <Label>Operation Name</Label>
                      <Input
                        value={operation.name}
                        onChange={(e) => updateOperation(operation.id, { name: e.target.value })}
                        placeholder="Operation name"
                      />
                    </div>

                    {/* Operation Type */}
                    <div>
                      <Label>Operation Type</Label>
                      <Select value={operation.type} onValueChange={(value: any) => updateOperation(operation.id, { type: value, config: {} })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crud_operation">CRUD Operation</SelectItem>
                          <SelectItem value="file_operation">File Operation</SelectItem>
                          <SelectItem value="logic_conditions">Logic & Conditions</SelectItem>
                          <SelectItem value="run_script">Run Script</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type-specific Configuration */}
                    {operation.type === 'crud_operation' && (
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <div>
                          <Label>Database</Label>
                          <Select value={operation.config.database || undefined} onValueChange={(value) => updateOperation(operation.id, { config: { ...operation.config, database: value, table: undefined } })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select database" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockDatabases.map(db => (
                                <SelectItem key={db} value={db}>{db}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {operation.config.database && (
                          <>
                            <div>
                            <Label>Table</Label>
                            <Select value={operation.config.table || undefined} onValueChange={(value) => updateOperation(operation.id, { config: { ...operation.config, table: value } })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select table" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockTables[operation.config.database]?.map(table => (
                                  <SelectItem key={table} value={table}>{table}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            </div>
                            <div>
                            <Label>Operation</Label>
                            <Select value={operation.config.operation || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, operation: value } })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select operation" />
                              </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="create">Create</SelectItem>
                                  <SelectItem value="read">Read</SelectItem>
                                  <SelectItem value="update">Update</SelectItem>
                                  <SelectItem value="delete">Delete</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {operation.config.operation === 'read' && operation.config.table && (
                              <div>
                                <Label>Columns to Select</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Button
                                    type="button"
                                    variant={(operation.config.columns || []).includes('*') ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => toggleColumn(operation.id, '*')}
                                  >
                                    * (All)
                                  </Button>
                                  {mockTables[operation.config.database]?.find(t => t === operation.config.table) && 
                                    ['id', 'name', 'created_at', 'updated_at', 'status', 'data'].map(col => (
                                      <Button
                                        key={col}
                                        type="button"
                                        variant={(operation.config.columns || []).includes(col) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => toggleColumn(operation.id, col)}
                                        disabled={(operation.config.columns || []).includes('*')}
                                      >
                                        {col}
                                      </Button>
                                    ))
                                  }
                                </div>
                              </div>
                            )}

                            {(operation.config.operation === 'read' || operation.config.operation === 'update' || operation.config.operation === 'delete') && (
                              <div>
                                <Label className="flex items-center justify-between">
                                  Conditions
                                  <Button type="button" variant="ghost" size="sm" onClick={() => addCondition(operation.id)}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                </Label>
                                <div className="space-y-2 mt-2">
                                  {(operation.config.conditions || []).map((condition, idx) => (
                                    <div key={condition.id} className="flex gap-2 items-center">
                                      {idx > 0 && (
                                        <Select value={condition.logicalOperator} onValueChange={(value: any) => updateCondition(operation.id, condition.id, { logicalOperator: value })}>
                                          <SelectTrigger className="w-20">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="AND">AND</SelectItem>
                                            <SelectItem value="OR">OR</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      )}
                                      <Input
                                        value={condition.field}
                                        onChange={(e) => updateCondition(operation.id, condition.id, { field: e.target.value })}
                                        placeholder="Field"
                                        className="flex-1"
                                      />
                                      <Select value={condition.operator} onValueChange={(value) => updateCondition(operation.id, condition.id, { operator: value })}>
                                        <SelectTrigger className="w-24">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="=">=</SelectItem>
                                          <SelectItem value="!=">!=</SelectItem>
                                          <SelectItem value=">">{">"}</SelectItem>
                                          <SelectItem value="<">{"<"}</SelectItem>
                                          <SelectItem value=">=">{">="}</SelectItem>
                                          <SelectItem value="<=">{"<="}</SelectItem>
                                          <SelectItem value="LIKE">LIKE</SelectItem>
                                          <SelectItem value="IN">IN</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        value={condition.value}
                                        onChange={(e) => updateCondition(operation.id, condition.id, { value: e.target.value })}
                                        placeholder="Value"
                                        className="flex-1"
                                      />
                                      <Button type="button" variant="ghost" size="sm" onClick={() => removeCondition(operation.id, condition.id)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {operation.type === 'file_operation' && (
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>File Operation</Label>
                            <Select value={operation.config.fileOperation || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, fileOperation: value } })}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select file operation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="download">Download</SelectItem>
                                <SelectItem value="upload">Upload</SelectItem>
                                <SelectItem value="delete">Delete</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="write">Write</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {operation.config.fileOperation === 'download' && (
                            <div>
                              <Label>Download Protocol</Label>
                              <Select value={operation.config.downloadProtocol || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, downloadProtocol: value } })}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select protocol" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="http">HTTP</SelectItem>
                                  <SelectItem value="tcp_ip">TCP/IP</SelectItem>
                                  <SelectItem value="s3">S3</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label>File Path</Label>
                          <Input
                            className="w-full"
                            value={operation.config.filePath || ''}
                            onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, filePath: e.target.value } })}
                            placeholder="/path/to/file.txt"
                          />
                        </div>
                        {operation.config.fileOperation === 'download' && operation.config.downloadProtocol === 'http' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>URL</Label>
                              <Input
                                className="w-full"
                                value={operation.config.downloadUrl || ''}
                                onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, downloadUrl: e.target.value } })}
                                placeholder="https://example.com/file"
                              />
                            </div>
                            <div>
                              <Label>Method</Label>
                              <Select value={operation.config.httpMethod || 'GET'} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, httpMethod: value } })}>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GET">GET</SelectItem>
                                  <SelectItem value="POST">POST</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        {operation.config.fileOperation === 'download' && operation.config.downloadProtocol === 'tcp_ip' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Host</Label>
                              <Input
                                className="w-full"
                                value={operation.config.tcpHost || ''}
                                onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, tcpHost: e.target.value } })}
                                placeholder="192.168.1.1"
                              />
                            </div>
                            <div>
                              <Label>Port</Label>
                              <Input
                                className="w-full"
                                type="number"
                                value={operation.config.tcpPort || ''}
                                onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, tcpPort: e.target.value } })}
                                placeholder="8080"
                              />
                            </div>
                            <div>
                              <Label>Timeout (ms)</Label>
                              <Input
                                className="w-full"
                                type="number"
                                value={operation.config.tcpTimeout || '5000'}
                                onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, tcpTimeout: e.target.value } })}
                                placeholder="5000"
                              />
                            </div>
                          </div>
                        )}
                        {operation.config.fileOperation === 'download' && operation.config.downloadProtocol === 's3' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Bucket Name</Label>
                                <Input
                                  className="w-full"
                                  value={operation.config.s3Bucket || ''}
                                  onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, s3Bucket: e.target.value } })}
                                  placeholder="my-bucket"
                                />
                              </div>
                              <div>
                                <Label>Region</Label>
                                <Input
                                  className="w-full"
                                  value={operation.config.s3Region || 'us-east-1'}
                                  onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, s3Region: e.target.value } })}
                                  placeholder="us-east-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Object Key</Label>
                              <Input
                                className="w-full"
                                value={operation.config.s3Key || ''}
                                onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, s3Key: e.target.value } })}
                                placeholder="path/to/object.file"
                              />
                            </div>
                          </div>
                        )}
                        {(operation.config.fileOperation === 'write' || operation.config.fileOperation === 'upload') && (
                          <div>
                            <Label>Content/Source</Label>
                            <Textarea
                              className="w-full"
                              value={operation.config.fileContent || ''}
                              onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, fileContent: e.target.value } })}
                              placeholder="File content or source"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {operation.type === 'logic_conditions' && (
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <div>
                          <Label>Operation Type</Label>
                          <Select value={operation.config.operationType || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, operationType: value, logicalOperator: undefined, mathOperator: undefined, conditionalOperator: undefined } })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select operation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="logical">Logical (returns boolean)</SelectItem>
                              <SelectItem value="mathematical">Mathematical (returns number/string/json)</SelectItem>
                              <SelectItem value="conditional">Conditional (returns boolean)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {operation.config.operationType === 'logical' && (
                          <div>
                            <Label>Logical Operator</Label>
                            <Select value={operation.config.logicalOperator || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, logicalOperator: value } })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                                <SelectItem value="NOT">NOT</SelectItem>
                                <SelectItem value="XOR">XOR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {operation.config.operationType === 'mathematical' && (
                          <div>
                            <Label>Mathematical Operator</Label>
                            <Select value={operation.config.mathOperator || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, mathOperator: value } })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="+">+ (Add)</SelectItem>
                                <SelectItem value="-">- (Subtract)</SelectItem>
                                <SelectItem value="*">* (Multiply)</SelectItem>
                                <SelectItem value="/">/  (Divide)</SelectItem>
                                <SelectItem value="%">% (Modulo)</SelectItem>
                                <SelectItem value="^">^ (Power)</SelectItem>
                                <SelectItem value="concat">Concat (String)</SelectItem>
                                <SelectItem value="merge">Merge (JSON)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {operation.config.operationType === 'conditional' && (
                          <div>
                            <Label>Conditional Operator</Label>
                            <Select value={operation.config.conditionalOperator || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, conditionalOperator: value } })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="==">== (Equals)</SelectItem>
                                <SelectItem value="!=">!= (Not Equals)</SelectItem>
                                <SelectItem value=">">{">"} (Greater Than)</SelectItem>
                                <SelectItem value="<">{"<"} (Less Than)</SelectItem>
                                <SelectItem value=">=">{">="} (Greater or Equal)</SelectItem>
                                <SelectItem value="<=">{"<="} (Less or Equal)</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="startsWith">Starts With</SelectItem>
                                <SelectItem value="endsWith">Ends With</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {operation.config.operationType && (
                          <div>
                            <Label className="flex items-center justify-between">
                              Variables
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  const currentVars = operation.config.variables || [];
                                  updateOperation(operation.id, { 
                                    config: { ...operation.config, variables: [...currentVars, ''] } 
                                  });
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Variable
                              </Button>
                            </Label>
                            <div className="space-y-2 mt-2">
                              {(operation.config.variables || []).map((variable, varIdx) => (
                                <div key={varIdx} className="flex gap-2">
                                  <Input
                                    value={variable}
                                    onChange={(e) => {
                                      const newVars = [...(operation.config.variables || [])];
                                      newVars[varIdx] = e.target.value;
                                      updateOperation(operation.id, { config: { ...operation.config, variables: newVars } });
                                    }}
                                    placeholder="Variable name or value"
                                    className="flex-1"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      const newVars = (operation.config.variables || []).filter((_, idx) => idx !== varIdx);
                                      updateOperation(operation.id, { config: { ...operation.config, variables: newVars } });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {operation.type === 'run_script' && (
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <div>
                          <Label>Script Language</Label>
                          <Select value={operation.config.scriptLanguage || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, scriptLanguage: value } })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="bash">Bash</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Script Content</Label>
                          <Textarea
                            value={operation.config.scriptContent || ''}
                            onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, scriptContent: e.target.value } })}
                            placeholder="Enter your script here"
                            rows={5}
                          />
                        </div>
                      </div>
                    )}

                    {/* Input Mappings */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Input Mappings</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => addInputMapping(operation.id)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Mapping
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {operation.inputMappings.map((mapping) => (
                          <div key={mapping.id} className="flex gap-2 items-center bg-background p-2 rounded">
                            <Input
                              value={mapping.targetParameter}
                              onChange={(e) => updateInputMapping(operation.id, mapping.id, { targetParameter: e.target.value })}
                              placeholder="Target parameter"
                              className="flex-1"
                            />
                            <Select value={mapping.source} onValueChange={(value: any) => updateInputMapping(operation.id, mapping.id, { source: value, sourceParameter: '', sourceOperationId: undefined })}>
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="automation_input">Automation Input</SelectItem>
                                <SelectItem value="previous_operation">Previous Operation</SelectItem>
                                <SelectItem value="environment">Environment Variable</SelectItem>
                              </SelectContent>
                            </Select>
                            {mapping.source === 'automation_input' && (
                              <Select value={mapping.sourceParameter || undefined} onValueChange={(value) => updateInputMapping(operation.id, mapping.id, { sourceParameter: value })}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select input" />
                                </SelectTrigger>
                                <SelectContent>
                                  {inputParameters.filter(param => param.name.trim()).map(param => (
                                    <SelectItem key={param.id} value={param.name}>{param.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {mapping.source === 'previous_operation' && (
                              <>
                                <Select value={mapping.sourceOperationId || undefined} onValueChange={(value) => updateInputMapping(operation.id, mapping.id, { sourceOperationId: value, sourceParameter: '' })}>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select operation" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getPreviousOperationsForMapping(operation.id).filter(op => op.id.trim()).map(op => (
                                      <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {mapping.sourceOperationId && (
                                  <Select value={mapping.sourceParameter || undefined} onValueChange={(value) => updateInputMapping(operation.id, mapping.id, { sourceParameter: value })}>
                                    <SelectTrigger className="flex-1">
                                      <SelectValue placeholder="Select output" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {operations.find(op => op.id === mapping.sourceOperationId)?.outputParameters.filter(param => param.name.trim()).map(param => (
                                        <SelectItem key={param.id} value={param.name}>{param.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </>
                            )}
                            {mapping.source === 'environment' && (
                              <Select value={mapping.sourceParameter || undefined} onValueChange={(value) => updateInputMapping(operation.id, mapping.id, { sourceParameter: value })}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select env var" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[...environmentVariables, ...operation.environmentVariables].filter(env => env.key.trim()).map(env => (
                                    <SelectItem key={env.id} value={env.key}>{env.key}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeInputMapping(operation.id, mapping.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operation Environment Variables */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Operation Environment Variables</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => addOperationEnvVar(operation.id)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Variable
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {operation.environmentVariables.map((envVar) => (
                          <div key={envVar.id} className="flex gap-2 items-center bg-background p-2 rounded">
                            <Input
                              value={envVar.key}
                              onChange={(e) => updateOperationEnvVar(operation.id, envVar.id, { key: e.target.value })}
                              placeholder="KEY"
                              className="flex-1"
                            />
                            <Input
                              value={envVar.value}
                              onChange={(e) => updateOperationEnvVar(operation.id, envVar.id, { value: e.target.value })}
                              placeholder="value"
                              className="flex-1"
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOperationEnvVar(operation.id, envVar.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Output Parameters */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Output Parameters</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => addOperationOutputParameter(operation.id)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Output
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {operation.outputParameters.map((param) => (
                          <div key={param.id} className="flex gap-2 items-center bg-background p-2 rounded">
                            <Input
                              value={param.name}
                              onChange={(e) => updateOperationOutputParameter(operation.id, param.id, { name: e.target.value })}
                              placeholder="Output name"
                              className="flex-1"
                            />
                            <Select value={param.type || "string"} onValueChange={(value: any) => updateOperationOutputParameter(operation.id, param.id, { type: value })}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="object">Object</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                                <SelectItem value="list">List</SelectItem>
                                <SelectItem value="dict">Dict</SelectItem>
                                <SelectItem value="file">File</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOperationOutputParameter(operation.id, param.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Success/Failure Routing */}
                    <div className="border-t pt-4 space-y-3">
                      <Label className="text-sm font-semibold">Success/Failure Routing</Label>
                      
                      {/* On Success */}
                      <div className="bg-green-500/10 p-3 rounded-lg space-y-2">
                        <Label className="text-xs text-green-700 dark:text-green-400">On Success</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Action</Label>
                            <Select 
                              value={operation.onSuccess?.action || 'continue'} 
                              onValueChange={(value: any) => updateOperation(operation.id, { 
                                onSuccess: { ...operation.onSuccess, action: value, targetOperationId: value === 'goto' ? operation.onSuccess?.targetOperationId : undefined } 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Continue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="continue">Continue</SelectItem>
                                <SelectItem value="goto">Go To Operation</SelectItem>
                                <SelectItem value="end">End Automation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {operation.onSuccess?.action === 'goto' && (
                            <div>
                              <Label className="text-xs">Target Operation</Label>
                              <Select 
                                value={operation.onSuccess?.targetOperationId || undefined} 
                                onValueChange={(value) => updateOperation(operation.id, { 
                                  onSuccess: { ...operation.onSuccess, action: 'goto', targetOperationId: value } 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select operation" />
                                </SelectTrigger>
                                <SelectContent>
                                  {operations.filter(op => op.id !== operation.id && op.id.trim()).map(op => (
                                    <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* On Failure */}
                      <div className="bg-red-500/10 p-3 rounded-lg space-y-2">
                        <Label className="text-xs text-red-700 dark:text-red-400">On Failure</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Action</Label>
                            <Select 
                              value={operation.onFailure?.action || 'continue'} 
                              onValueChange={(value: any) => updateOperation(operation.id, { 
                                onFailure: { 
                                  ...operation.onFailure, 
                                  action: value, 
                                  targetOperationId: value === 'goto' ? operation.onFailure?.targetOperationId : undefined,
                                  retryCount: value === 'retry' ? (operation.onFailure?.retryCount || 3) : undefined
                                } 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Continue" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="continue">Continue</SelectItem>
                                <SelectItem value="goto">Go To Operation</SelectItem>
                                <SelectItem value="end">End Automation</SelectItem>
                                <SelectItem value="retry">Retry</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {operation.onFailure?.action === 'goto' && (
                            <div>
                              <Label className="text-xs">Target Operation</Label>
                              <Select 
                                value={operation.onFailure?.targetOperationId || undefined} 
                                onValueChange={(value) => updateOperation(operation.id, { 
                                  onFailure: { ...operation.onFailure, action: 'goto', targetOperationId: value } 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select operation" />
                                </SelectTrigger>
                                <SelectContent>
                                  {operations.filter(op => op.id !== operation.id && op.id.trim()).map(op => (
                                    <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {operation.onFailure?.action === 'retry' && (
                            <div>
                              <Label className="text-xs">Retry Count</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={operation.onFailure?.retryCount || 3}
                                onChange={(e) => updateOperation(operation.id, { 
                                  onFailure: { ...operation.onFailure, action: 'retry', retryCount: parseInt(e.target.value) || 3 } 
                                })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

            <Separator />

            {/* 5. Output Parameters */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                    Output Parameters
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addOutputParameter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Output
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Define what the automation returns or produces</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {outputParameters.map((param) => (
                  <div key={param.id} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <Label className="text-xs">Name *</Label>
                        <Input
                          className="w-full h-8"
                          value={param.name}
                          onChange={(e) => updateOutputParameter(param.id, { name: e.target.value })}
                          placeholder="summary_report"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select value={param.type} onValueChange={(value: any) => updateOutputParameter(param.id, { type: value })}>
                          <SelectTrigger className="w-full h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="object">Object</SelectItem>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                            <SelectItem value="dict">Dict</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Description</Label>
                        <Input
                          className="h-8"
                          value={param.description || ''}
                          onChange={(e) => updateOutputParameter(param.id, { description: e.target.value })}
                          placeholder="What this output contains"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button variant="ghost" size="sm" onClick={() => removeOutputParameter(param.id)} className="w-full md:w-auto h-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Example Value</Label>
                        <Input
                          className="h-8"
                          value={param.exampleValue || ''}
                          onChange={(e) => updateOutputParameter(param.id, { exampleValue: e.target.value })}
                          placeholder='{"status": "success", "count": 42}'
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={param.required} onCheckedChange={(checked) => updateOutputParameter(param.id, { required: checked })} />
                        <Label className="text-xs">Required</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Separator />

            {/* 7. Function Metadata (Optional) */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">7</span>
                  Function Metadata (Optional)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-2">Add descriptive metadata for documentation and reference</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="returnType">Return Type</Label>
                    <Input
                      id="returnType"
                      value={returnType}
                      onChange={(e) => setReturnType(e.target.value)}
                      placeholder="e.g., list, dict, file"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complexityLevel">Complexity Level</Label>
                    <Select value={complexityLevel} onValueChange={(value: any) => setComplexityLevel(value)}>
                      <SelectTrigger id="complexityLevel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="preferredLibraries">Preferred Libraries</Label>
                    <Input
                      id="preferredLibraries"
                      value={preferredLibraries}
                      onChange={(e) => setPreferredLibraries(e.target.value)}
                      placeholder="e.g., requests, pandas, boto3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Comma-separated list</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Automation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
