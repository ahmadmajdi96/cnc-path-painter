import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Database, FileText, Calculator, GitBranch, ArrowRight, Settings, Globe, Repeat, Mail, Brain, Clock, Copy, Save, TestTube2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutomationVisualFlow } from './AutomationVisualFlow';
import { OperationTemplateDialog } from './OperationTemplateDialog';
import { OperationTestDialog } from './OperationTestDialog';
import type { Automation, AutomationOperation, AutomationParameter, OperationInputMapping, DynamicOutputParameter } from './AutomationControlSystem';
import { toast } from 'sonner';

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
  const [enabled, setEnabled] = useState(true);
  const [operations, setOperations] = useState<AutomationOperation[]>([]);
  const [inputParameters, setInputParameters] = useState<AutomationParameter[]>([]);
  const [outputParameters, setOutputParameters] = useState<DynamicOutputParameter[]>([]);
  const [onFailureAction, setOnFailureAction] = useState<'retry' | 'fail' | 'goto_operation' | 'goto_integration'>('fail');
  const [failureRetryCount, setFailureRetryCount] = useState(3);
  const [failureRetryDelay, setFailureRetryDelay] = useState(5);
  const [failureTargetOperationId, setFailureTargetOperationId] = useState<string>('');
  const [failureTargetIntegrationId, setFailureTargetIntegrationId] = useState<string>('');
  
  // Problem 2: Visual flow representation
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('list');
  
  // Problem 10: Templates
  const [operationTemplates, setOperationTemplates] = useState<AutomationOperation[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  // Problem 3: Testing
  const [testingOperation, setTestingOperation] = useState<AutomationOperation | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);

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
      enabled,
      operations,
      inputParameters,
      outputParameters,
      onFailure: {
        action: onFailureAction,
        retryCount: onFailureAction === 'retry' ? failureRetryCount : undefined,
        retryDelay: onFailureAction === 'retry' ? failureRetryDelay : undefined,
        targetOperationId: onFailureAction === 'goto_operation' ? failureTargetOperationId : undefined,
        targetIntegrationId: onFailureAction === 'goto_integration' ? failureTargetIntegrationId : undefined
      }
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEnabled(true);
    setOperations([]);
    setInputParameters([]);
    setOutputParameters([]);
    setOnFailureAction('fail');
    setFailureRetryCount(3);
    setFailureRetryDelay(5);
    setFailureTargetOperationId('');
    setFailureTargetIntegrationId('');
  };

  const addOperation = () => {
    const newOperation: AutomationOperation = {
      id: Math.random().toString(36).substr(2, 9),
      order: operations.length + 1,
      type: 'crud_operation',
      name: `Operation ${operations.length + 1}`,
      description: '',
      config: {},
      inputMappings: [],
      outputParameters: [],
      validationStatus: 'untested'
    };
    setOperations([...operations, newOperation]);
  };

  // Problem 10: Clone operation
  const cloneOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;
    
    const clonedOperation: AutomationOperation = {
      ...JSON.parse(JSON.stringify(operation)), // Deep clone
      id: Math.random().toString(36).substr(2, 9),
      order: operations.length + 1,
      name: `${operation.name} (Copy)`,
      validationStatus: 'untested'
    };
    setOperations([...operations, clonedOperation]);
    toast.success('Operation cloned successfully');
  };

  // Problem 10: Save as template
  const saveAsTemplate = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;
    
    const templateName = prompt('Enter template name:', operation.name);
    if (!templateName) return;
    
    const template: AutomationOperation = {
      ...JSON.parse(JSON.stringify(operation)),
      id: Math.random().toString(36).substr(2, 9),
      isTemplate: true,
      templateName,
      order: 0
    };
    setOperationTemplates([...operationTemplates, template]);
    toast.success('Template saved successfully');
  };

  // Problem 10: Load from template
  const loadFromTemplate = (template: AutomationOperation) => {
    const newOperation: AutomationOperation = {
      ...JSON.parse(JSON.stringify(template)),
      id: Math.random().toString(36).substr(2, 9),
      order: operations.length + 1,
      isTemplate: false,
      templateName: undefined,
      validationStatus: 'untested'
    };
    setOperations([...operations, newOperation]);
    toast.success('Template loaded successfully');
  };

  // Problem 3: Test operation
  const testOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;
    
    setTestingOperation(operation);
    setShowTestDialog(true);
  };

  // Problem 3: Handle validation result
  const handleValidationComplete = (operationId: string, isValid: boolean, message: string) => {
    setOperations(operations.map(op => 
      op.id === operationId 
        ? { ...op, validationStatus: isValid ? 'valid' : 'invalid', validationMessage: message } 
        : op
    ));
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
  // Operation Environment Variables - removed per requirements
  const addOperationEnvVar = (operationId: string) => {};
  const updateOperationEnvVar = (operationId: string, envId: string, updates: any) => {};
  const removeOperationEnvVar = (operationId: string, envId: string) => {};

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
    const newParam: DynamicOutputParameter = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'boolean',
      booleanValue: true
    };
    setOutputParameters([...outputParameters, newParam]);
  };

  const updateOutputParameter = (id: string, updates: Partial<DynamicOutputParameter>) => {
    setOutputParameters(outputParameters.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeOutputParameter = (id: string) => {
    setOutputParameters(outputParameters.filter(p => p.id !== id));
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
      case 'run_script':
        return <Calculator className="h-4 w-4" />;
      case 'http_request':
        return <Globe className="h-4 w-4" />;
      case 'data_transformation':
        return <Repeat className="h-4 w-4" />;
      case 'messaging':
        return <Mail className="h-4 w-4" />;
      case 'ai_model':
        return <Brain className="h-4 w-4" />;
      case 'delay':
        return <Clock className="h-4 w-4" />;
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
                    <div className="flex items-center space-x-2">
                      <Switch checked={param.required} onCheckedChange={(checked) => updateInputParameter(param.id, { required: checked })} />
                      <Label className="text-xs">Required</Label>
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
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
                      <Save className="h-4 w-4 mr-2" />
                      Load Template
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addOperation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Operation
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Add sequential steps that the automation performs</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Problem 2: Visual Flow Toggle */}
                <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">
                      <Settings className="h-4 w-4 mr-2" />
                      Detailed View
                    </TabsTrigger>
                    <TabsTrigger value="visual">
                      <Eye className="h-4 w-4 mr-2" />
                      Visual Flow
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visual" className="mt-4">
                    <AutomationVisualFlow operations={operations} />
                  </TabsContent>
                  
                  <TabsContent value="list" className="mt-4 space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Operation Name</Label>
                        <Input
                          value={operation.name}
                          onChange={(e) => updateOperation(operation.id, { name: e.target.value })}
                          placeholder="Operation name"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => cloneOperation(operation.id)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Clone
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => saveAsTemplate(operation.id)}
                          className="flex-1"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Template
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => testOperation(operation.id)}
                          className="flex-1"
                        >
                          <TestTube2 className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>

                    {/* Problem 7: Operation Description */}
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={operation.description || ''}
                        onChange={(e) => updateOperation(operation.id, { description: e.target.value })}
                        placeholder="Describe what this operation does"
                        rows={2}
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
                          <SelectItem value="http_request">HTTP/API Request</SelectItem>
                          <SelectItem value="data_transformation">Data Transformation</SelectItem>
                          <SelectItem value="messaging">Messaging (Email/Slack/SMS)</SelectItem>
                          <SelectItem value="conditional_logic">Conditional Logic Block</SelectItem>
                          <SelectItem value="delay">Delay / Wait</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Problem 9: Conditional Execution */}
                    <div className="border rounded-lg p-3 bg-blue-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Conditional Execution (Run If)</Label>
                        <Switch
                          checked={operation.runCondition?.enabled || false}
                          onCheckedChange={(checked) => updateOperation(operation.id, {
                            runCondition: checked ? {
                              enabled: true,
                              field: '',
                              operator: '==',
                              value: '',
                              source: 'automation_input'
                            } : undefined
                          })}
                        />
                      </div>
                      {operation.runCondition?.enabled && (
                        <div className="grid grid-cols-4 gap-2">
                          <Select 
                            value={operation.runCondition.source} 
                            onValueChange={(value: any) => updateOperation(operation.id, {
                              runCondition: { ...operation.runCondition!, source: value, sourceOperationId: undefined }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="automation_input">Input</SelectItem>
                              <SelectItem value="previous_operation">Previous Op</SelectItem>
                              <SelectItem value="environment">Env Var</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Field"
                            value={operation.runCondition.field}
                            onChange={(e) => updateOperation(operation.id, {
                              runCondition: { ...operation.runCondition!, field: e.target.value }
                            })}
                          />
                          <Select 
                            value={operation.runCondition.operator} 
                            onValueChange={(value: any) => updateOperation(operation.id, {
                              runCondition: { ...operation.runCondition!, operator: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="==">==</SelectItem>
                              <SelectItem value="!=">!=</SelectItem>
                              <SelectItem value=">">{">"}</SelectItem>
                              <SelectItem value="<">{"<"}</SelectItem>
                              <SelectItem value=">=">{"=>"}</SelectItem>
                              <SelectItem value="<=">{"<="}</SelectItem>
                              <SelectItem value="contains">contains</SelectItem>
                              <SelectItem value="exists">exists</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Value"
                            value={operation.runCondition.value}
                            onChange={(e) => updateOperation(operation.id, {
                              runCondition: { ...operation.runCondition!, value: e.target.value }
                            })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Problem 5: Iteration Support */}
                    <div className="border rounded-lg p-3 bg-purple-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Iteration (Repeat For Each)</Label>
                        <Switch
                          checked={operation.iteration?.enabled || false}
                          onCheckedChange={(checked) => updateOperation(operation.id, {
                            iteration: checked ? {
                              enabled: true,
                              sourceArray: '',
                              itemVariable: 'item',
                              source: 'automation_input'
                            } : undefined
                          })}
                        />
                      </div>
                      {operation.iteration?.enabled && (
                        <div className="grid grid-cols-3 gap-2">
                          <Select 
                            value={operation.iteration.source} 
                            onValueChange={(value: any) => updateOperation(operation.id, {
                              iteration: { ...operation.iteration!, source: value, sourceOperationId: undefined }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="automation_input">Input Array</SelectItem>
                              <SelectItem value="previous_operation">Previous Op Array</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Array name"
                            value={operation.iteration.sourceArray}
                            onChange={(e) => updateOperation(operation.id, {
                              iteration: { ...operation.iteration!, sourceArray: e.target.value }
                            })}
                          />
                          <Input
                            placeholder="Item variable"
                            value={operation.iteration.itemVariable}
                            onChange={(e) => updateOperation(operation.id, {
                              iteration: { ...operation.iteration!, itemVariable: e.target.value }
                            })}
                          />
                        </div>
                      )}
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
                          <Select value={operation.config.operationType || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, operationType: value, operations: [] } })}>
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

                        {(operation.config.operationType === 'mathematical' || operation.config.operationType === 'logical') && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="font-semibold">
                                {operation.config.operationType === 'mathematical' ? 'Mathematical Operations' : 'Logical Operations'}
                              </Label>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const currentOps = operation.config.operations || [];
                                  updateOperation(operation.id, { 
                                    config: { 
                                      ...operation.config, 
                                      operations: [
                                        ...currentOps, 
                                        {
                                          id: Math.random().toString(36).substr(2, 9),
                                          operator: operation.config.operationType === 'mathematical' ? '+' : 'AND',
                                          operands: [],
                                          outputName: `result_${currentOps.length + 1}`
                                        }
                                      ] 
                                    } 
                                  });
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Operation
                              </Button>
                            </div>
                            
                            {(operation.config.operations || []).map((subOp, subOpIdx) => (
                              <Card key={subOp.id} className="border bg-background/50">
                                <CardContent className="pt-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Operation {subOpIdx + 1}</Label>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        const newOps = (operation.config.operations || []).filter(op => op.id !== subOp.id);
                                        updateOperation(operation.id, { config: { ...operation.config, operations: newOps } });
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs">Operator</Label>
                                      <Select 
                                        value={subOp.operator} 
                                        onValueChange={(value) => {
                                          const newOps = [...(operation.config.operations || [])];
                                          newOps[subOpIdx] = { ...subOp, operator: value };
                                          updateOperation(operation.id, { config: { ...operation.config, operations: newOps } });
                                        }}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {operation.config.operationType === 'mathematical' ? (
                                            <>
                                              <SelectItem value="+">+ (Add)</SelectItem>
                                              <SelectItem value="-">- (Subtract)</SelectItem>
                                              <SelectItem value="*">* (Multiply)</SelectItem>
                                              <SelectItem value="/">/  (Divide)</SelectItem>
                                              <SelectItem value="%">% (Modulo)</SelectItem>
                                              <SelectItem value="^">^ (Power)</SelectItem>
                                              <SelectItem value="concat">Concat (String)</SelectItem>
                                              <SelectItem value="merge">Merge (JSON)</SelectItem>
                                            </>
                                          ) : (
                                            <>
                                              <SelectItem value="AND">AND</SelectItem>
                                              <SelectItem value="OR">OR</SelectItem>
                                              <SelectItem value="NOT">NOT</SelectItem>
                                              <SelectItem value="XOR">XOR</SelectItem>
                                            </>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Output Variable Name</Label>
                                      <Input
                                        className="h-8"
                                        value={subOp.outputName}
                                        onChange={(e) => {
                                          const newOps = [...(operation.config.operations || [])];
                                          newOps[subOpIdx] = { ...subOp, outputName: e.target.value };
                                          updateOperation(operation.id, { config: { ...operation.config, operations: newOps } });
                                        }}
                                        placeholder="result_name"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs">Operands / Variables</Label>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => {
                                          const newOps = [...(operation.config.operations || [])];
                                          const newOperands = [...(subOp.operands || []), { 
                                            id: Math.random().toString(36).substr(2, 9),
                                            source: 'manual' as const,
                                            value: ''
                                          }];
                                          newOps[subOpIdx] = { ...subOp, operands: newOperands };
                                          updateOperation(operation.id, { config: { ...operation.config, operations: newOps } });
                                        }}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Operand
                                      </Button>
                                    </div>
                                    
                                    {(subOp.operands || []).map((operand, operandIdx) => (
                                      <div key={operand.id} className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-4">
                                          <Label className="text-xs">Source</Label>
                                          <Select 
                                            value={operand.source} 
                                            onValueChange={(value) => {
                                              const newOps = [...(operation.config.operations || [])];
                                              const newOperands = [...(subOp.operands || [])];
                                              newOperands[operandIdx] = { ...operand, source: value as any, value: '', sourceOperationId: undefined };
                                              newOps[subOpIdx] = { ...subOp, operands: newOperands };
                                              updateOperation(operation.id, { config: { ...operation.config, operations: newOps } });
                                            }}
                                          >
                                            <SelectTrigger className="h-8">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="manual">Manual Input</SelectItem>
                                              <SelectItem value="current_operation">Current Operation Output</SelectItem>
                                              <SelectItem value="previous_operation">Previous Operation Output</SelectItem>
                                              <SelectItem value="integration_env">Integration Env Variable</SelectItem>
                                              <SelectItem value="automation_input">Automation Input Parameter</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        {operand.source === 'previous_operation' && (
                                          <div className="col-span-3">
                                            <Label className="text-xs">Operation</Label>
                                            <Select 
                                              value={operand.sourceOperationId || ''} 
                                              onValueChange={(value) => {
                                                const newOps = [...(operation.config.operations || [])];
                                                const newOperands = [...(subOp.operands || [])];
                                                newOperands[operandIdx] = { ...operand, sourceOperationId: value };
                                                newOps[subOpIdx] = { ...subOp, operands: newOperands };
                                                updateOperation(operation.id, { config: { ...operation.config, operations: newOps } });
                                              }}
                                            >
                                              <SelectTrigger className="h-8">
                                                <SelectValue placeholder="Select" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {getPreviousOperationsForMapping(operation.id).map(prevOp => (
                                                  <SelectItem key={prevOp.id} value={prevOp.id}>{prevOp.name}</SelectItem>
                                                ))}
                                                {(operation.config.operations || []).slice(0, subOpIdx).map(prevSubOp => (
                                                  <SelectItem key={prevSubOp.id} value={prevSubOp.id}>{prevSubOp.outputName}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                        
                                        <div className={operand.source === 'previous_operation' ? 'col-span-4' : 'col-span-7'}>
                                          <Label className="text-xs">
                                            {operand.source === 'manual' ? 'Value' : 
                                             operand.source === 'current_operation' ? 'Output Variable' :
                                             operand.source === 'previous_operation' ? 'Output Variable' :
                                             operand.source === 'integration_env' ? 'Env Variable Name' :
                                             'Input Parameter Name'}
                                          </Label>
                                          <Input
                                            className="h-8"
                                            value={operand.value}
                                            onChange={(e) => {
                                              const newOps = [...(operation.config.operations || [])];
                                              const newOperands = [...(subOp.operands || [])];
                                              newOperands[operandIdx] = { ...operand, value: e.target.value };
                                              newOps[subOpIdx] = { ...subOp, operands: newOperands };
                                              updateOperation(operation.id, { config: { ...operation.config, operations: newOps } });
                                            }}
                                            placeholder={
                                              operand.source === 'manual' ? 'Enter value' :
                                              operand.source === 'current_operation' ? 'result_1' :
                                              operand.source === 'integration_env' ? 'ENV_VAR_NAME' :
                                              'parameter_name'
                                            }
                                          />
                                        </div>
                                        
                                        <div className="col-span-1">
                                          <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 w-full"
                                            onClick={() => {
                                              const newOps = [...(operation.config.operations || [])];
                                              const newOperands = (subOp.operands || []).filter(op => op.id !== operand.id);
                                              newOps[subOpIdx] = { ...subOp, operands: newOperands };
                                              updateOperation(operation.id, { config: { ...operation.config, operations: newOps } });
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
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
                            
                            <div className="mt-3 space-y-2">
                              <Label className="text-xs">Variables (for comparison)</Label>
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

                    {/* Problem 1: HTTP Request operation */}
                    {operation.type === 'http_request' && (
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>HTTP Method</Label>
                            <Select value={operation.config.httpRequestMethod || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, httpRequestMethod: value } })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Timeout (seconds)</Label>
                            <Input
                              type="number"
                              value={operation.config.httpRequestTimeout || ''}
                              onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, httpRequestTimeout: parseInt(e.target.value) } })}
                              placeholder="30"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={operation.config.httpRequestUrl || ''}
                            onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, httpRequestUrl: e.target.value } })}
                            placeholder="https://api.example.com/endpoint"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Request Body - Dynamic Builder</Label>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                const currentBodyFields = operation.config.httpRequestBodyFields || [];
                                updateOperation(operation.id, { 
                                  config: { 
                                    ...operation.config, 
                                    httpRequestBodyFields: [
                                      ...currentBodyFields, 
                                      {
                                        id: Math.random().toString(36).substr(2, 9),
                                        key: '',
                                        source: 'manual',
                                        value: ''
                                      }
                                    ] 
                                  } 
                                });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Field
                            </Button>
                          </div>
                          
                          {(operation.config.httpRequestBodyFields || []).length > 0 && (
                            <div className="space-y-2 border rounded-lg p-3 bg-background/50">
                              {(operation.config.httpRequestBodyFields || []).map((field, fieldIdx) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                                  <div className="col-span-3">
                                    <Label className="text-xs">Key</Label>
                                    <Input
                                      className="h-8"
                                      value={field.key}
                                      onChange={(e) => {
                                        const newFields = [...(operation.config.httpRequestBodyFields || [])];
                                        newFields[fieldIdx] = { ...field, key: e.target.value };
                                        updateOperation(operation.id, { config: { ...operation.config, httpRequestBodyFields: newFields } });
                                      }}
                                      placeholder="field_name"
                                    />
                                  </div>
                                  
                                  <div className="col-span-3">
                                    <Label className="text-xs">Source</Label>
                                    <Select 
                                      value={field.source} 
                                      onValueChange={(value) => {
                                        const newFields = [...(operation.config.httpRequestBodyFields || [])];
                                        newFields[fieldIdx] = { ...field, source: value as any, value: '', sourceOperationId: undefined };
                                        updateOperation(operation.id, { config: { ...operation.config, httpRequestBodyFields: newFields } });
                                      }}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="manual">Manual Input</SelectItem>
                                        <SelectItem value="integration_env">Integration Env Variable</SelectItem>
                                        <SelectItem value="automation_input">Automation Input Parameter</SelectItem>
                                        <SelectItem value="automation_output">Automation Output Variable</SelectItem>
                                        <SelectItem value="operation_output">Operation Output Variable</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {field.source === 'operation_output' && (
                                    <div className="col-span-2">
                                      <Label className="text-xs">Operation</Label>
                                      <Select 
                                        value={field.sourceOperationId || ''} 
                                        onValueChange={(value) => {
                                          const newFields = [...(operation.config.httpRequestBodyFields || [])];
                                          newFields[fieldIdx] = { ...field, sourceOperationId: value };
                                          updateOperation(operation.id, { config: { ...operation.config, httpRequestBodyFields: newFields } });
                                        }}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getPreviousOperationsForMapping(operation.id).map(prevOp => (
                                            <SelectItem key={prevOp.id} value={prevOp.id}>{prevOp.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                  
                                  <div className={field.source === 'operation_output' ? 'col-span-3' : 'col-span-5'}>
                                    <Label className="text-xs">
                                      {field.source === 'manual' ? 'Value' :
                                       field.source === 'integration_env' ? 'Env Variable Name' :
                                       field.source === 'automation_input' ? 'Input Parameter Name' :
                                       field.source === 'automation_output' ? 'Output Variable Name' :
                                       'Output Variable Name'}
                                    </Label>
                                    <Input
                                      className="h-8"
                                      value={field.value}
                                      onChange={(e) => {
                                        const newFields = [...(operation.config.httpRequestBodyFields || [])];
                                        newFields[fieldIdx] = { ...field, value: e.target.value };
                                        updateOperation(operation.id, { config: { ...operation.config, httpRequestBodyFields: newFields } });
                                      }}
                                      placeholder={
                                        field.source === 'manual' ? 'Enter value' :
                                        field.source === 'integration_env' ? 'ENV_VAR_NAME' :
                                        'variable_name'
                                      }
                                    />
                                  </div>
                                  
                                  <div className="col-span-1">
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-full"
                                      onClick={() => {
                                        const newFields = (operation.config.httpRequestBodyFields || []).filter(f => f.id !== field.id);
                                        updateOperation(operation.id, { config: { ...operation.config, httpRequestBodyFields: newFields } });
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Preview (JSON)</Label>
                            <Textarea
                              className="font-mono text-xs"
                              value={JSON.stringify(
                                (operation.config.httpRequestBodyFields || []).reduce((acc, field) => {
                                  if (field.key) {
                                    acc[field.key] = field.source === 'manual' ? field.value : `{{${field.source}:${field.value}}}`;
                                  }
                                  return acc;
                                }, {} as Record<string, string>),
                                null,
                                2
                              )}
                              readOnly
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Problem 1: Data Transformation operation */}
                    {operation.type === 'data_transformation' && (
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <div>
                          <Label>Transformation Type</Label>
                          <Select value={operation.config.transformationType || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, transformationType: value } })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transformation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv_to_json">CSV to JSON</SelectItem>
                              <SelectItem value="json_to_csv">JSON to CSV</SelectItem>
                              <SelectItem value="xml_to_json">XML to JSON</SelectItem>
                              <SelectItem value="filter">Filter Data</SelectItem>
                              <SelectItem value="map">Map/Transform Fields</SelectItem>
                              <SelectItem value="aggregate">Aggregate/Group</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Transformation Script</Label>
                          <Textarea
                            value={operation.config.transformationScript || ''}
                            onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, transformationScript: e.target.value } })}
                            placeholder="Enter transformation logic or filter expression"
                            rows={4}
                          />
                        </div>
                      </div>
                    )}

                    {/* Problem 1: Messaging operation */}
                    {operation.type === 'messaging' && (
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <div>
                          <Label>Messaging Type</Label>
                          <Select value={operation.config.messagingType || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, messagingType: value } })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select messaging type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="slack">Slack</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="webhook">Webhook</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Recipient</Label>
                          <Input
                            value={operation.config.messagingRecipient || ''}
                            onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, messagingRecipient: e.target.value } })}
                            placeholder="email@example.com, #channel, or +1234567890"
                          />
                        </div>
                        <div>
                          <Label>Subject / Title</Label>
                          <Input
                            value={operation.config.messagingSubject || ''}
                            onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, messagingSubject: e.target.value } })}
                            placeholder="Message subject or title"
                          />
                        </div>
                        <div>
                          <Label>Message Body</Label>
                          <Textarea
                            value={operation.config.messagingBody || ''}
                            onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, messagingBody: e.target.value } })}
                            placeholder="Enter message content"
                            rows={4}
                          />
                        </div>
                      </div>
                    )}

                    {/* Problem 1: Delay operation */}
                    {operation.type === 'delay' && (
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Duration</Label>
                            <Input
                              type="number"
                              value={operation.config.delayDuration || ''}
                              onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, delayDuration: parseInt(e.target.value) } })}
                              placeholder="5"
                            />
                          </div>
                          <div>
                            <Label>Unit</Label>
                            <Select value={operation.config.delayUnit || undefined} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, delayUnit: value } })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="seconds">Seconds</SelectItem>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                            <Select value={mapping.source} onValueChange={(value: any) => updateInputMapping(operation.id, mapping.id, { source: value, sourceParameter: '', sourceOperationId: undefined })}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="automation_input">Automation Input</SelectItem>
                                <SelectItem value="previous_operation">Previous Operation</SelectItem>
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
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeInputMapping(operation.id, mapping.id)}>
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
                  </TabsContent>
                </Tabs>
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select value={param.type} onValueChange={(value: any) => updateOutputParameter(param.id, { type: value })}>
                          <SelectTrigger className="w-full h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boolean">Boolean (True/False)</SelectItem>
                            <SelectItem value="from_operations">From Previous Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {param.type === 'boolean' && (
                        <div>
                          <Label className="text-xs">Value</Label>
                          <Select value={param.booleanValue?.toString()} onValueChange={(value) => updateOutputParameter(param.id, { booleanValue: value === 'true' })}>
                            <SelectTrigger className="w-full h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="flex items-end">
                        <Button variant="ghost" size="sm" onClick={() => removeOutputParameter(param.id)} className="w-full md:w-auto h-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Automation</Button>
        </DialogFooter>
      </DialogContent>
      
      <OperationTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        templates={operationTemplates}
        onSelectTemplate={loadFromTemplate}
      />
      
      <OperationTestDialog
        open={showTestDialog}
        onOpenChange={setShowTestDialog}
        operation={testingOperation}
        onValidationComplete={handleValidationComplete}
      />
    </Dialog>
  );
};
