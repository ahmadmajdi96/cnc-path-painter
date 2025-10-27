import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Database, FileText, Calculator, GitBranch, Upload, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Automation, AutomationOperation, AutomationParameter } from './AutomationControlSystem';

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
  const [outputParameters, setOutputParameters] = useState<AutomationParameter[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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
      tags
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
    setTags([]);
    setTagInput('');
  };

  const addOperation = () => {
    const newOperation: AutomationOperation = {
      id: Math.random().toString(36).substr(2, 9),
      order: operations.length + 1,
      type: 'database_retrieve',
      config: {},
      inputMappings: [],
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

  const addOperationOutputParameter = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    const newParam: AutomationParameter = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'string',
      required: false,
      description: ''
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

  const addInputParameter = () => {
    const newParam: AutomationParameter = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'string',
      required: false,
      description: ''
    };
    setInputParameters([...inputParameters, newParam]);
  };

  const updateInputParameter = (id: string, updates: Partial<AutomationParameter>) => {
    setInputParameters(inputParameters.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeInputParameter = (id: string) => {
    setInputParameters(inputParameters.filter(p => p.id !== id));
  };

  const addOutputParameter = () => {
    const newParam: AutomationParameter = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'string',
      required: false,
      description: ''
    };
    setOutputParameters([...outputParameters, newParam]);
  };

  const updateOutputParameter = (id: string, updates: Partial<AutomationParameter>) => {
    setOutputParameters(outputParameters.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeOutputParameter = (id: string) => {
    setOutputParameters(outputParameters.filter(p => p.id !== id));
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'database_retrieve':
      case 'crud_operation':
        return <Database className="h-4 w-4" />;
      case 'file_operation':
        return <FileText className="h-4 w-4" />;
      case 'mathematical_operation':
        return <Calculator className="h-4 w-4" />;
      case 'logical_operation':
        return <GitBranch className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Automation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Automation Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter automation name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this automation does"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              <Label>Enabled</Label>
            </div>
          </div>

          <Separator />

          {/* Automation Input Parameters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Automation Input Parameters</Label>
              <Button type="button" variant="outline" size="sm" onClick={addInputParameter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Input
              </Button>
            </div>

            {inputParameters.map((param) => (
              <Card key={param.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <Label>Name</Label>
                      <Input
                        value={param.name}
                        onChange={(e) => updateInputParameter(param.id, { name: e.target.value })}
                        placeholder="Parameter name"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={param.type} onValueChange={(value: any) => updateInputParameter(param.id, { type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button variant="destructive" size="sm" onClick={() => removeInputParameter(param.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={param.description || ''}
                      onChange={(e) => updateInputParameter(param.id, { description: e.target.value })}
                      placeholder="Parameter description"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={param.required} onCheckedChange={(checked) => updateInputParameter(param.id, { required: checked })} />
                    <Label>Required</Label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Operations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Operations (Sequential)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOperation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Operation
              </Button>
            </div>

            {operations.map((operation, index) => (
              <Card key={operation.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getOperationIcon(operation.type)}
                      Operation {index + 1}
                      {index > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => removeOperation(operation.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Operation Type */}
                  <div>
                    <Label>Operation Type</Label>
                    <Select value={operation.type} onValueChange={(value: any) => updateOperation(operation.id, { type: value, config: {} })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database_retrieve">Database Retrieve</SelectItem>
                        <SelectItem value="crud_operation">CRUD Operation</SelectItem>
                        <SelectItem value="file_operation">File Operation</SelectItem>
                        <SelectItem value="logical_operation">Logical Operation</SelectItem>
                        <SelectItem value="mathematical_operation">Mathematical Operation</SelectItem>
                        <SelectItem value="run_script">Run Script</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type-specific Configuration */}
                  {operation.type === 'database_retrieve' && (
                    <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                      <div>
                        <Label>Database</Label>
                        <Select value={operation.config.database || ''} onValueChange={(value) => updateOperation(operation.id, { config: { ...operation.config, database: value, table: undefined } })}>
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
                            <Select value={operation.config.table || ''} onValueChange={(value) => updateOperation(operation.id, { config: { ...operation.config, table: value } })}>
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
                            <Label>Query</Label>
                            <Textarea
                              value={operation.config.query || ''}
                              onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, query: e.target.value } })}
                              placeholder="SELECT * FROM table WHERE..."
                              rows={3}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {operation.type === 'crud_operation' && (
                    <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                      <div>
                        <Label>Database</Label>
                        <Select value={operation.config.database || ''} onValueChange={(value) => updateOperation(operation.id, { config: { ...operation.config, database: value, table: undefined } })}>
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
                            <Select value={operation.config.table || ''} onValueChange={(value) => updateOperation(operation.id, { config: { ...operation.config, table: value } })}>
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
                            <Select value={operation.config.operation || ''} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, operation: value } })}>
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
                        </>
                      )}
                    </div>
                  )}

                  {operation.type === 'file_operation' && (
                    <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                      <div>
                        <Label>File Operation</Label>
                        <Select value={operation.config.fileOperation || ''} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, fileOperation: value } })}>
                          <SelectTrigger>
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
                      <div>
                        <Label>File Path</Label>
                        <Input
                          value={operation.config.filePath || ''}
                          onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, filePath: e.target.value } })}
                          placeholder="/path/to/file.txt"
                        />
                      </div>
                      {(operation.config.fileOperation === 'write' || operation.config.fileOperation === 'upload') && (
                        <div>
                          <Label>Content/Source</Label>
                          <Textarea
                            value={operation.config.fileContent || ''}
                            onChange={(e) => updateOperation(operation.id, { config: { ...operation.config, fileContent: e.target.value } })}
                            placeholder="File content or source"
                            rows={3}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {operation.type === 'logical_operation' && (
                    <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                      <div>
                        <Label>Logical Operator</Label>
                        <Select value={operation.config.logicalOperator || ''} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, logicalOperator: value } })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and">AND</SelectItem>
                            <SelectItem value="or">OR</SelectItem>
                            <SelectItem value="not">NOT</SelectItem>
                            <SelectItem value="if">IF</SelectItem>
                            <SelectItem value="switch">SWITCH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {operation.type === 'mathematical_operation' && (
                    <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                      <div>
                        <Label>Mathematical Operator</Label>
                        <Select value={operation.config.mathOperator || ''} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, mathOperator: value } })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add">Add (+)</SelectItem>
                            <SelectItem value="subtract">Subtract (-)</SelectItem>
                            <SelectItem value="multiply">Multiply (×)</SelectItem>
                            <SelectItem value="divide">Divide (÷)</SelectItem>
                            <SelectItem value="modulo">Modulo (%)</SelectItem>
                            <SelectItem value="power">Power (^)</SelectItem>
                            <SelectItem value="sqrt">Square Root (√)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {operation.type === 'run_script' && (
                    <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                      <div>
                        <Label>Script Language</Label>
                        <Select value={operation.config.scriptLanguage || ''} onValueChange={(value: any) => updateOperation(operation.id, { config: { ...operation.config, scriptLanguage: value } })}>
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
                        <Label>Upload Script File</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".py,.js,.sh"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updateOperation(operation.id, { config: { ...operation.config, scriptFile: file, scriptFileName: file.name } });
                              }
                            }}
                          />
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {operation.config.scriptFileName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Selected: {operation.config.scriptFileName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Input Mappings */}
                  {index > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Map Inputs From:</Label>
                      <div className="bg-accent/30 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline">Automation Inputs</Badge>
                          <span className="text-muted-foreground">or</span>
                          <Badge variant="outline">Previous Operation Outputs</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Configure input mappings to use outputs from Operation {index}</p>
                      </div>
                    </div>
                  )}

                  {/* Output Parameters */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Output Parameters</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addOperationOutputParameter(operation.id)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Output
                      </Button>
                    </div>
                    {operation.outputParameters.map(param => (
                      <div key={param.id} className="flex items-center gap-2 bg-muted/30 p-2 rounded">
                        <Input
                          value={param.name}
                          onChange={(e) => updateOperationOutputParameter(operation.id, param.id, { name: e.target.value })}
                          placeholder="Output name"
                          className="h-8"
                        />
                        <Select value={param.type} onValueChange={(value: any) => updateOperationOutputParameter(operation.id, param.id, { type: value })}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="object">Object</SelectItem>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => removeOperationOutputParameter(operation.id, param.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Automation Output Parameters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Automation Output Parameters</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOutputParameter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Output
              </Button>
            </div>

            {outputParameters.map((param) => (
              <Card key={param.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <Label>Name</Label>
                      <Input
                        value={param.name}
                        onChange={(e) => updateOutputParameter(param.id, { name: e.target.value })}
                        placeholder="Parameter name"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={param.type} onValueChange={(value: any) => updateOutputParameter(param.id, { type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button variant="destructive" size="sm" onClick={() => removeOutputParameter(param.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={param.description || ''}
                      onChange={(e) => updateOutputParameter(param.id, { description: e.target.value })}
                      placeholder="Parameter description"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Automation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
