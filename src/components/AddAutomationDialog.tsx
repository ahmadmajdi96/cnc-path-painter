import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Automation, AutomationParameter } from './AutomationControlSystem';

interface AddAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddAutomationDialog = ({ open, onOpenChange, onAdd }: AddAutomationDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'database_retrieve' | 'crud_operation' | 'run_script'>('database_retrieve');
  const [enabled, setEnabled] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Config state
  const [query, setQuery] = useState('');
  const [database, setDatabase] = useState('');
  const [operation, setOperation] = useState<'create' | 'read' | 'update' | 'delete'>('read');
  const [table, setTable] = useState('');
  const [fields, setFields] = useState<string>('');
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [environment, setEnvironment] = useState<string>('');
  
  // Parameters state
  const [inputParameters, setInputParameters] = useState<AutomationParameter[]>([]);
  const [outputParameters, setOutputParameters] = useState<AutomationParameter[]>([]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const config: any = {};
    
    if (type === 'database_retrieve') {
      config.query = query;
      config.database = database;
    } else if (type === 'crud_operation') {
      config.operation = operation;
      config.table = table;
      config.fields = fields.split(',').map(f => f.trim()).filter(f => f);
    } else if (type === 'run_script') {
      config.scriptFile = scriptFile;
      config.scriptFileName = scriptFile?.name;
      config.scriptLanguage = 'python';
      try {
        config.environment = environment ? JSON.parse(environment) : {};
      } catch {
        config.environment = {};
      }
    }

    const newAutomation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      description: description.trim(),
      type,
      enabled,
      config,
      inputParameters,
      outputParameters,
      tags
    };

    onAdd(newAutomation);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('database_retrieve');
    setEnabled(true);
    setQuery('');
    setDatabase('');
    setOperation('read');
    setTable('');
    setFields('');
    setScriptFile(null);
    setEnvironment('');
    setInputParameters([]);
    setOutputParameters([]);
    setTags([]);
    setNewTag('');
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addInputParameter = () => {
    setInputParameters(prev => [...prev, {
      id: `in_${Date.now()}`,
      name: '',
      type: 'string',
      required: true
    }]);
  };

  const addOutputParameter = () => {
    setOutputParameters(prev => [...prev, {
      id: `out_${Date.now()}`,
      name: '',
      type: 'string',
      required: true
    }]);
  };

  const updateInputParameter = (index: number, field: keyof AutomationParameter, value: any) => {
    setInputParameters(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const updateOutputParameter = (index: number, field: keyof AutomationParameter, value: any) => {
    setOutputParameters(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const removeInputParameter = (index: number) => {
    setInputParameters(prev => prev.filter((_, i) => i !== index));
  };

  const removeOutputParameter = (index: number) => {
    setOutputParameters(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Automation Function</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Get User Data"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this automation does"
            />
          </div>

          {/* Type Selection */}
          <div>
            <Label htmlFor="type">Automation Type *</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="database_retrieve">Database Retrieve</SelectItem>
                <SelectItem value="crud_operation">CRUD Operation</SelectItem>
                <SelectItem value="run_script">Run Script</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type-specific Configuration */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Configuration</h3>
            
            {type === 'database_retrieve' && (
              <>
                <div>
                  <Label htmlFor="database">Database</Label>
                  <Input
                    id="database"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="e.g., main_db, analytics_db"
                  />
                </div>
                <div>
                  <Label htmlFor="query">SQL Query *</Label>
                  <Textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SELECT * FROM users WHERE id = $1"
                    rows={4}
                  />
                </div>
              </>
            )}

            {type === 'crud_operation' && (
              <>
                <div>
                  <Label htmlFor="operation">Operation *</Label>
                  <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="table">Table Name *</Label>
                  <Input
                    id="table"
                    value={table}
                    onChange={(e) => setTable(e.target.value)}
                    placeholder="e.g., users, products"
                  />
                </div>
                <div>
                  <Label htmlFor="fields">Fields (comma-separated)</Label>
                  <Input
                    id="fields"
                    value={fields}
                    onChange={(e) => setFields(e.target.value)}
                    placeholder="e.g., name, email, status"
                  />
                </div>
              </>
            )}

            {type === 'run_script' && (
              <>
                <div>
                  <Label htmlFor="scriptFile">Python Script File *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      id="scriptFile"
                      accept=".py"
                      onChange={(e) => setScriptFile(e.target.files?.[0] || null)}
                    />
                    {scriptFile && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{scriptFile.name}</Badge>
                        <X 
                          className="w-4 h-4 cursor-pointer" 
                          onClick={() => setScriptFile(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="environment">Environment Variables (JSON)</Label>
                  <Textarea
                    id="environment"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    placeholder='{"API_KEY": "value", "DEBUG": "true"}'
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          {/* Input Parameters */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Input Parameters</h3>
              <Button onClick={addInputParameter} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Input
              </Button>
            </div>
            {inputParameters.map((param, index) => (
              <div key={param.id} className="grid grid-cols-12 gap-2 items-start">
                <Input
                  className="col-span-3"
                  value={param.name}
                  onChange={(e) => updateInputParameter(index, 'name', e.target.value)}
                  placeholder="Parameter name"
                />
                <Select 
                  value={param.type} 
                  onValueChange={(value) => updateInputParameter(index, 'type', value)}
                >
                  <SelectTrigger className="col-span-2">
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
                <Input
                  className="col-span-5"
                  value={param.description || ''}
                  onChange={(e) => updateInputParameter(index, 'description', e.target.value)}
                  placeholder="Description"
                />
                <div className="col-span-1 flex items-center">
                  <Switch
                    checked={param.required}
                    onCheckedChange={(checked) => updateInputParameter(index, 'required', checked)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInputParameter(index)}
                  className="col-span-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Output Parameters */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Output Parameters</h3>
              <Button onClick={addOutputParameter} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Output
              </Button>
            </div>
            {outputParameters.map((param, index) => (
              <div key={param.id} className="grid grid-cols-12 gap-2 items-start">
                <Input
                  className="col-span-3"
                  value={param.name}
                  onChange={(e) => updateOutputParameter(index, 'name', e.target.value)}
                  placeholder="Parameter name"
                />
                <Select 
                  value={param.type} 
                  onValueChange={(value) => updateOutputParameter(index, 'type', value)}
                >
                  <SelectTrigger className="col-span-2">
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
                <Input
                  className="col-span-5"
                  value={param.description || ''}
                  onChange={(e) => updateOutputParameter(index, 'description', e.target.value)}
                  placeholder="Description"
                />
                <div className="col-span-1 flex items-center">
                  <Switch
                    checked={param.required}
                    onCheckedChange={(checked) => updateOutputParameter(index, 'required', checked)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOutputParameter(index)}
                  className="col-span-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Create Automation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
