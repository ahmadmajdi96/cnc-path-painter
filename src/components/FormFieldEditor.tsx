
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { FormField } from './AppBuilderControlSystem';

interface FormFieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
}

// Mock integrations - in real app, this would come from the integration system
const mockIntegrations = [
  { id: '1', name: 'ERP Integration', protocol: 'REST_API' },
  { id: '2', name: 'SCADA System', protocol: 'OPC_UA' },
  { id: '3', name: 'Database Connector', protocol: 'SQL' },
];

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({ field, onUpdate }) => {
  const [options, setOptions] = useState<string[]>(field.options || []);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    setOptions(field.options || []);
  }, [field.options]);

  const handleUpdate = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const handleValidationUpdate = (validation: Partial<FormField['validation']>) => {
    onUpdate({
      ...field,
      validation: { ...field.validation, ...validation }
    });
  };

  const handleIntegrationUpdate = (integration: Partial<FormField['integrationSource']>) => {
    onUpdate({
      ...field,
      integrationSource: { ...field.integrationSource, ...integration }
    });
  };

  const addOption = () => {
    if (newOption.trim()) {
      const updatedOptions = [...options, newOption.trim()];
      setOptions(updatedOptions);
      onUpdate({ ...field, options: updatedOptions });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    onUpdate({ ...field, options: updatedOptions });
  };

  return (
    <div className="space-y-4">
      {/* Basic Field Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Field Type</Label>
          <Select value={field.type} onValueChange={(value: any) => handleUpdate({ type: value })}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="password">Password</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="file">File</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Data Entry</Label>
          <Select
            value={field.dataEntryType}
            onValueChange={(value: 'manual' | 'automated') => handleUpdate({ dataEntryType: value })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automated">Automated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Field Label</Label>
        <Input
          value={field.label}
          onChange={(e) => handleUpdate({ label: e.target.value })}
          placeholder="Enter field label"
          className="h-8"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Placeholder</Label>
        <Input
          value={field.placeholder || ''}
          onChange={(e) => handleUpdate({ placeholder: e.target.value })}
          placeholder="Enter placeholder text"
          className="h-8"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={field.required}
          onCheckedChange={(checked) => handleUpdate({ required: checked })}
        />
        <Label htmlFor="required" className="text-xs">Required Field</Label>
      </div>

      {/* Automated Data Entry Settings */}
      {field.dataEntryType === 'automated' && (
        <div className="p-3 border rounded-lg bg-blue-50 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Automated</Badge>
            <span className="text-xs text-blue-700">Data will be fetched from integration</span>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium">Integration Source</Label>
            <Select
              value={field.integrationSource?.integrationId || ''}
              onValueChange={(value) => {
                const integration = mockIntegrations.find(i => i.id === value);
                handleIntegrationUpdate({
                  integrationId: value,
                  protocol: integration?.protocol || '',
                });
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select integration" />
              </SelectTrigger>
              <SelectContent>
                {mockIntegrations.map((integration) => (
                  <SelectItem key={integration.id} value={integration.id}>
                    {integration.name} ({integration.protocol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Data Path</Label>
            <Input
              value={field.integrationSource?.dataPath || ''}
              onChange={(e) => handleIntegrationUpdate({ dataPath: e.target.value })}
              placeholder="/api/customer/name"
              className="h-8"
            />
          </div>
        </div>
      )}

      {/* Options for select and radio fields */}
      {(field.type === 'select' || field.type === 'radio') && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Options</Label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input value={option} readOnly className="h-7 text-xs" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="h-7 w-7 p-0 text-red-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
                onKeyPress={(e) => e.key === 'Enter' && addOption()}
                className="h-7 text-xs"
              />
              <Button
                onClick={addOption}
                size="sm"
                className="h-7 px-3 text-xs"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Rules */}
      {(field.type === 'text' || field.type === 'textarea') && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Validation</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-600">Min Length</Label>
              <Input
                type="number"
                value={field.validation?.minLength || ''}
                onChange={(e) => handleValidationUpdate({ minLength: parseInt(e.target.value) || undefined })}
                placeholder="0"
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Max Length</Label>
              <Input
                type="number"
                value={field.validation?.maxLength || ''}
                onChange={(e) => handleValidationUpdate({ maxLength: parseInt(e.target.value) || undefined })}
                placeholder="100"
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
