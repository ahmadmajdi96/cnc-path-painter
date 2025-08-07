
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Trash2 } from 'lucide-react';
import { AppSection, FormField } from './AppBuilderControlSystem';
import { FormFieldEditor } from './FormFieldEditor';

interface SectionPropertiesPanelProps {
  section: AppSection;
  onUpdate: (section: AppSection) => void;
  onClose: () => void;
}

export const SectionPropertiesPanel: React.FC<SectionPropertiesPanelProps> = ({
  section,
  onUpdate,
  onClose,
}) => {
  const handleBasicUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      [field]: value,
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

  const handleConfigUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      config: {
        ...section.config,
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Section Properties</h3>
          <p className="text-sm text-gray-600">{section.type.toUpperCase()} - {section.title}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            {section.type === 'form' && <TabsTrigger value="fields">Fields</TabsTrigger>}
            {section.type !== 'form' && <TabsTrigger value="styling">Styling</TabsTrigger>}
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Section Title</Label>
              <Input
                id="title"
                value={section.title}
                onChange={(e) => handleBasicUpdate('title', e.target.value)}
                placeholder="Enter section title"
              />
            </div>

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
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="width">Width (%)</Label>
                <Input
                  id="width"
                  type="number"
                  min="10"
                  max="100"
                  value={section.layout?.width || 100}
                  onChange={(e) => handleLayoutUpdate('width', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  min="0"
                  value={section.layout?.height || ''}
                  placeholder="Auto"
                  onChange={(e) => handleLayoutUpdate('height', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="x">X Position (%)</Label>
                <Input
                  id="x"
                  type="number"
                  min="0"
                  max="100"
                  value={section.layout?.x || 0}
                  onChange={(e) => handleLayoutUpdate('x', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="y">Y Position (px)</Label>
                <Input
                  id="y"
                  type="number"
                  min="0"
                  value={section.layout?.y || 0}
                  onChange={(e) => handleLayoutUpdate('y', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zIndex">Layer Order</Label>
              <Input
                id="zIndex"
                type="number"
                min="1"
                max="100"
                value={section.layout?.zIndex || 1}
                onChange={(e) => handleLayoutUpdate('zIndex', parseInt(e.target.value))}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-900 mb-1">Layout Tips:</p>
              <p className="text-blue-700">• Use Ctrl+Click on a section to position it quickly</p>
              <p className="text-blue-700">• Adjust Z-index to control which sections appear on top</p>
            </div>
          </TabsContent>

          {/* Fields Tab (Form sections only) */}
          {section.type === 'form' && (
            <TabsContent value="fields" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Form Fields</h4>
                <Button variant="outline" size="sm" onClick={handleAddField}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-3">
                {section.fields?.map((field) => (
                  <Card key={field.id} className="bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">{field.label}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <FormFieldEditor
                        field={field}
                        onUpdate={(updatedField) => handleUpdateField(field.id, updatedField)}
                      />
                    </CardContent>
                  </Card>
                ))}

                {(!section.fields || section.fields.length === 0) && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    <p>No fields added yet</p>
                    <p className="text-sm">Click "Add Field" to create form fields</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Styling Tab */}
          {section.type !== 'form' && (
            <TabsContent value="styling" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="showBorder"
                  checked={section.config?.showBorder || false}
                  onCheckedChange={(checked) => handleConfigUpdate('showBorder', checked)}
                />
                <Label htmlFor="showBorder">Show Border</Label>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
