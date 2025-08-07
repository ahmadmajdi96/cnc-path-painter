
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { AppSection, FormField } from './AppBuilderControlSystem';
import { FieldEditor } from './FieldEditor';

interface SectionEditorProps {
  section: AppSection;
  onUpdate: (section: AppSection) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate }) => {
  const handleBasicUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      [field]: value,
    });
  };

  const handleConfigUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      config: {
        ...section.config,
        [field]: value,
      },
    });
  };

  const handleLayoutUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      layout: {
        ...section.layout!,
        [field]: value,
      },
    });
  };

  const handleAddField = () => {
    if (section.type !== 'form') return;
    
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: 'New Field',
      required: false,
      dataEntryType: 'manual',
    };

    onUpdate({
      ...section,
      fields: [...(section.fields || []), newField],
    });
  };

  const handleUpdateField = (fieldId: string, updatedField: FormField) => {
    onUpdate({
      ...section,
      fields: section.fields?.map(field => 
        field.id === fieldId ? updatedField : field
      ),
    });
  };

  const handleDeleteField = (fieldId: string) => {
    onUpdate({
      ...section,
      fields: section.fields?.filter(field => field.id !== fieldId),
    });
  };

  return (
    <div className="space-y-4">
      {/* Basic Section Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Section Title</Label>
          <Input
            id="title"
            value={section.title}
            onChange={(e) => handleBasicUpdate('title', e.target.value)}
            placeholder="Enter section title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="columns">Columns</Label>
          <Select
            value={section.config?.columns?.toString()}
            onValueChange={(value) => handleConfigUpdate('columns', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Column</SelectItem>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content for non-form sections */}
      {(section.type === 'details' || section.type === 'text' || section.type === 'card') && (
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={section.content || ''}
            onChange={(e) => handleBasicUpdate('content', e.target.value)}
            placeholder="Enter section content"
            rows={4}
          />
        </div>
      )}

      {/* Layout Controls */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3 text-sm">Advanced Layout</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zIndex" className="text-xs">Layer Order (Z-Index)</Label>
            <Input
              id="zIndex"
              type="number"
              min="1"
              max="100"
              value={section.layout?.zIndex || 1}
              onChange={(e) => handleLayoutUpdate('zIndex', parseInt(e.target.value))}
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minHeight" className="text-xs">Min Height (px)</Label>
            <Input
              id="minHeight"
              type="number"
              min="0"
              value={section.layout?.height || ''}
              placeholder="Auto"
              onChange={(e) => handleLayoutUpdate('height', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="showBorder"
            checked={section.config?.showBorder || false}
            onCheckedChange={(checked) => handleConfigUpdate('showBorder', checked)}
          />
          <Label htmlFor="showBorder">Show Border</Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="textAlign">Text Alignment</Label>
          <Select
            value={section.config?.textAlign || 'left'}
            onValueChange={(value) => handleConfigUpdate('textAlign', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Background Color</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={section.config?.backgroundColor || '#ffffff'}
            onChange={(e) => handleConfigUpdate('backgroundColor', e.target.value)}
          />
        </div>
      </div>

      {/* Form Fields (only for form sections) */}
      {section.type === 'form' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Form Fields</h4>
            <Button variant="outline" size="sm" onClick={handleAddField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
          
          <div className="space-y-3">
            {section.fields?.map((field) => (
              <div key={field.id} className="border rounded-lg p-3 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium text-sm">{field.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteField(field.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <FieldEditor
                  field={field}
                  onUpdate={(updatedField) => handleUpdateField(field.id, updatedField)}
                />
              </div>
            ))}
            
            {(!section.fields || section.fields.length === 0) && (
              <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
                No fields added yet. Click "Add Field" to create form fields.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
