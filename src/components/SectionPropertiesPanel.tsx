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
import { SectionStylingPanel } from './SectionStylingPanel';
import { DataConfigPanel } from './DataConfigPanel';

interface SectionPropertiesPanelProps {
  section: AppSection;
  onUpdate: (section: AppSection) => void;
  onClose: () => void;
}

// Mock integrations - in real app, this would come from the integration system
const mockIntegrations = [
  { id: '1', name: 'ERP Integration', protocol: 'REST_API' },
  { id: '2', name: 'SCADA System', protocol: 'OPC_UA' },
  { id: '3', name: 'Inventory Database', protocol: 'SQL' },
];

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

  const handleListItemsUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      config: {
        ...section.config,
        listItems: {
          ...section.config?.listItems,
          [field]: value,
        },
      },
    });
  };

  const handleItemTemplateUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      config: {
        ...section.config,
        listItems: {
          ...section.config?.listItems,
          itemTemplate: {
            ...section.config?.listItems?.itemTemplate,
            [field]: value,
          },
        },
      },
    });
  };

  const handleTriggerUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      config: {
        ...section.config,
        trigger: {
          ...section.config?.trigger,
          [field]: value,
        },
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

  const getAvailableForms = () => {
    // In a real app, this would get forms from the app context
    return [
      { id: 'form1', name: 'Customer Registration Form' },
      { id: 'form2', name: 'Product Order Form' },
    ];
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-900">Section Properties</h3>
          <p className="text-sm text-gray-600">{section.type.toUpperCase()} - {section.title}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            {section.type === 'form' && <TabsTrigger value="fields">Fields</TabsTrigger>}
            {section.type === 'confirmation' && <TabsTrigger value="actions">Actions</TabsTrigger>}
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

          {/* Styling Tab */}
          <TabsContent value="styling" className="space-y-4">
            <SectionStylingPanel section={section} onUpdate={onUpdate} />
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
          </TabsContent>

          {/* Data Tab (Available for all sections) */}
          <TabsContent value="data" className="space-y-4">
            <DataConfigPanel section={section} onUpdate={onUpdate} />
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

          {/* Actions Tab (Confirmation sections only) */}
          {section.type === 'confirmation' && (
            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Trigger Configuration</h4>
                
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select
                    value={section.config?.trigger?.type || 'form_submit'}
                    onValueChange={(value) => handleTriggerUpdate('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form_submit">Form Submission</SelectItem>
                      <SelectItem value="item_delete">Item Delete</SelectItem>
                      <SelectItem value="custom_action">Custom Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {section.config?.trigger?.type === 'form_submit' && (
                  <div className="space-y-2">
                    <Label>Target Form</Label>
                    <Select
                      value={section.config?.trigger?.targetId || ''}
                      onValueChange={(value) => handleTriggerUpdate('targetId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select form" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableForms().map((form) => (
                          <SelectItem key={form.id} value={form.id}>
                            {form.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <h4 className="font-medium">Dialog Content</h4>
                
                <div className="space-y-2">
                  <Label>Confirmation Text</Label>
                  <Textarea
                    value={section.config?.confirmationText || ''}
                    onChange={(e) => handleConfigUpdate('confirmationText', e.target.value)}
                    placeholder="Are you sure you want to proceed?"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Confirm Button</Label>
                    <Input
                      value={section.config?.confirmButtonText || ''}
                      onChange={(e) => handleConfigUpdate('confirmButtonText', e.target.value)}
                      placeholder="Confirm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cancel Button</Label>
                    <Input
                      value={section.config?.cancelButtonText || ''}
                      onChange={(e) => handleConfigUpdate('cancelButtonText', e.target.value)}
                      placeholder="Cancel"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
