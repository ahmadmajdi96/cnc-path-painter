
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { CustomApp, AppSection, FormField } from './AppBuilderControlSystem';
import { SectionEditor } from './SectionEditor';

interface AppBuilderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: CustomApp | null;
  onSave: (app: Omit<CustomApp, 'id' | 'createdAt' | 'updatedAt' | 'url'>) => void;
}

export const AppBuilderDrawer: React.FC<AppBuilderDrawerProps> = ({
  open,
  onOpenChange,
  app,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<AppSection[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  useEffect(() => {
    if (app) {
      setName(app.name);
      setDescription(app.description);
      setSections(app.sections);
      setStatus(app.status);
    } else {
      setName('');
      setDescription('');
      setSections([]);
      setStatus('draft');
    }
  }, [app]);

  const handleAddSection = (type: AppSection['type']) => {
    const newSection: AppSection = {
      id: Date.now().toString(),
      type,
      title: `New ${type} section`,
      fields: type === 'form' ? [] : undefined,
      config: {
        columns: 1,
        showBorder: true,
        backgroundColor: '#ffffff',
        textAlign: 'left',
      },
    };
    setSections([...sections, newSection]);
  };

  const handleUpdateSection = (sectionId: string, updatedSection: AppSection) => {
    setSections(sections.map(section => 
      section.id === sectionId ? updatedSection : section
    ));
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      sections,
      status,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-6xl">
          <DrawerHeader>
            <DrawerTitle>
              {app ? 'Edit Application' : 'Create New Application'}
            </DrawerTitle>
            <DrawerDescription>
              Build custom forms and applications with automated data integration
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Basic App Information */}
            <Card>
              <CardHeader>
                <CardTitle>App Information</CardTitle>
                <CardDescription>Basic details about your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">App Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter app name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter app description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section Builder */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>App Sections</CardTitle>
                    <CardDescription>Add and configure sections for your application</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSection('form')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Form
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSection('details')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSection('card')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Card
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSection('list')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      List
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSection('text')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Text
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{section.type.toUpperCase()} - {section.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <SectionEditor
                        section={section}
                        onUpdate={(updatedSection) => handleUpdateSection(section.id, updatedSection)}
                      />
                    </div>
                  ))}
                  
                  {sections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No sections added yet. Click the buttons above to add sections to your app.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!name.trim()}>
                {app ? 'Update App' : 'Create App'}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
