
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from './AppBuilderControlSystem';

// Mock integrations data - in real app, this would come from the integration system
const mockIntegrations = [
  { id: '1', name: 'ERP to MES Integration', protocol: 'REST_API' },
  { id: '2', name: 'SCADA to Database Sync', protocol: 'OPC_UA' },
];

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ field, onUpdate }) => {
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
    <div className="grid grid-cols-2 gap-4">
      {/* Basic Field Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Field Type</Label>
          <Select value={field.type} onValueChange={(value: any) => handleUpdate({ type: value })}>
            <SelectTrigger>
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
          <Label>Field Label</Label>
          <Input
            value={field.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => handleUpdate({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="required"
            checked={field.required}
            onCheckedChange={(checked) => handleUpdate({ required: checked })}
          />
          <Label htmlFor="required">Required Field</Label>
        </div>
      </div>

      {/* Data Entry and Integration Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Data Entry Type</Label>
          <Select
            value={field.dataEntryType}
            onValueChange={(value: 'manual' | 'automated') => handleUpdate({ dataEntryType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Entry</SelectItem>
              <SelectItem value="automated">Automated from Integration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {field.dataEntryType === 'automated' && (
          <div className="space-y-3 p-3 border rounded-lg bg-blue-50">
            <div className="space-y-2">
              <Label>Integration Source</Label>
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
                <SelectTrigger>
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
              <Label>Data Path</Label>
              <Input
                value={field.integrationSource?.dataPath || ''}
                onChange={(e) => handleIntegrationUpdate({ dataPath: e.target.value })}
                placeholder="/api/customer/name"
              />
            </div>
          </div>
        )}

        {/* Options for select and radio fields */}
        {(field.type === 'select' || field.type === 'radio') && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={option} readOnly />
                  <button
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add new option"
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <button
                  onClick={addOption}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        {(field.type === 'text' || field.type === 'textarea') && (
          <div className="space-y-2">
            <Label>Validation</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Min Length</Label>
                <Input
                  type="number"
                  value={field.validation?.minLength || ''}
                  onChange={(e) => handleValidationUpdate({ minLength: parseInt(e.target.value) || undefined })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Max Length</Label>
                <Input
                  type="number"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) => handleValidationUpdate({ maxLength: parseInt(e.target.value) || undefined })}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
