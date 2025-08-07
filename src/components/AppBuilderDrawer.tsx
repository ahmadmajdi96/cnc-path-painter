
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { CustomApp, AppSection, FormField, NavbarItem } from './AppBuilderControlSystem';
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
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [navbarEnabled, setNavbarEnabled] = useState(false);
  const [navbarTitle, setNavbarTitle] = useState('');
  const [navbarItems, setNavbarItems] = useState<NavbarItem[]>([]);
  const [navbarBgColor, setNavbarBgColor] = useState('#ffffff');
  const [navbarTextColor, setNavbarTextColor] = useState('#000000');

  useEffect(() => {
    if (app) {
      setName(app.name);
      setDescription(app.description);
      setSections(app.sections);
      setStatus(app.status);
      setRequiresAuth(app.requiresAuth);
      setNavbarEnabled(app.navbar?.enabled || false);
      setNavbarTitle(app.navbar?.title || '');
      setNavbarItems(app.navbar?.items || []);
      setNavbarBgColor(app.navbar?.backgroundColor || '#ffffff');
      setNavbarTextColor(app.navbar?.textColor || '#000000');
    } else {
      setName('');
      setDescription('');
      setSections([]);
      setStatus('draft');
      setRequiresAuth(false);
      setNavbarEnabled(false);
      setNavbarTitle('');
      setNavbarItems([]);
      setNavbarBgColor('#ffffff');
      setNavbarTextColor('#000000');
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
      layout: {
        width: 100,
        x: 0,
        y: sections.length * 300, // Stack sections vertically by default
        zIndex: 1,
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

  const handleAddNavbarItem = () => {
    const newItem: NavbarItem = {
      id: Date.now().toString(),
      label: 'New Item',
      type: 'link',
      url: '#',
    };
    setNavbarItems([...navbarItems, newItem]);
  };

  const handleUpdateNavbarItem = (itemId: string, updatedItem: NavbarItem) => {
    setNavbarItems(navbarItems.map(item => 
      item.id === itemId ? updatedItem : item
    ));
  };

  const handleDeleteNavbarItem = (itemId: string) => {
    setNavbarItems(navbarItems.filter(item => item.id !== itemId));
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      sections,
      status,
      requiresAuth,
      navbar: {
        enabled: navbarEnabled,
        title: navbarTitle,
        items: navbarItems,
        backgroundColor: navbarBgColor,
        textColor: navbarTextColor,
      },
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

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="navbar">Navigation</TabsTrigger>
                <TabsTrigger value="auth">Authentication</TabsTrigger>
              </TabsList>

              {/* Basic App Information */}
              <TabsContent value="basic" className="space-y-6">
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
              </TabsContent>

              {/* Section Builder */}
              <TabsContent value="sections" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>App Sections</CardTitle>
                        <CardDescription>Add and configure sections for your application</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleAddSection('form')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Form
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddSection('details')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddSection('card')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Card
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddSection('list')}>
                          <Plus className="w-4 h-4 mr-2" />
                          List
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddSection('text')}>
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
                          
                          {/* Section Layout Controls */}
                          <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-white rounded border">
                            <div className="space-y-1">
                              <Label className="text-xs">Width (%)</Label>
                              <Input
                                type="number"
                                min="10"
                                max="100"
                                value={section.layout?.width || 100}
                                onChange={(e) => handleUpdateSection(section.id, {
                                  ...section,
                                  layout: {
                                    ...section.layout!,
                                    width: parseInt(e.target.value)
                                  }
                                })}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Height (px)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={section.layout?.height || ''}
                                placeholder="Auto"
                                onChange={(e) => handleUpdateSection(section.id, {
                                  ...section,
                                  layout: {
                                    ...section.layout!,
                                    height: e.target.value ? parseInt(e.target.value) : undefined
                                  }
                                })}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">X Position (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={section.layout?.x || 0}
                                onChange={(e) => handleUpdateSection(section.id, {
                                  ...section,
                                  layout: {
                                    ...section.layout!,
                                    x: parseInt(e.target.value)
                                  }
                                })}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Y Position (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={section.layout?.y || 0}
                                onChange={(e) => handleUpdateSection(section.id, {
                                  ...section,
                                  layout: {
                                    ...section.layout!,
                                    y: parseInt(e.target.value)
                                  }
                                })}
                                className="h-8 text-xs"
                              />
                            </div>
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
              </TabsContent>

              {/* Navbar Configuration */}
              <TabsContent value="navbar" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Navigation Bar</CardTitle>
                    <CardDescription>Configure the top navigation bar for your application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="navbarEnabled"
                        checked={navbarEnabled}
                        onCheckedChange={setNavbarEnabled}
                      />
                      <Label htmlFor="navbarEnabled">Enable Navigation Bar</Label>
                    </div>

                    {navbarEnabled && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="navbarTitle">Navbar Title</Label>
                            <Input
                              id="navbarTitle"
                              value={navbarTitle}
                              onChange={(e) => setNavbarTitle(e.target.value)}
                              placeholder="Enter navbar title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="navbarBgColor">Background Color</Label>
                            <Input
                              id="navbarBgColor"
                              type="color"
                              value={navbarBgColor}
                              onChange={(e) => setNavbarBgColor(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Navigation Items</h4>
                            <Button variant="outline" size="sm" onClick={handleAddNavbarItem}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Item
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {navbarItems.map((item) => (
                              <div key={item.id} className="border rounded-lg p-3 bg-white">
                                <div className="flex justify-between items-start mb-3">
                                  <span className="font-medium text-sm">{item.label}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteNavbarItem(item.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Label</Label>
                                    <Input
                                      value={item.label}
                                      onChange={(e) => handleUpdateNavbarItem(item.id, {
                                        ...item,
                                        label: e.target.value
                                      })}
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Type</Label>
                                    <Select
                                      value={item.type}
                                      onValueChange={(value: any) => handleUpdateNavbarItem(item.id, {
                                        ...item,
                                        type: value
                                      })}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="link">Link</SelectItem>
                                        <SelectItem value="button">Button</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">URL/Action</Label>
                                    <Input
                                      value={item.url || ''}
                                      onChange={(e) => handleUpdateNavbarItem(item.id, {
                                        ...item,
                                        url: e.target.value
                                      })}
                                      placeholder={item.type === 'link' ? 'URL' : 'Action'}
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            {navbarItems.length === 0 && (
                              <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
                                No navigation items added yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Authentication */}
              <TabsContent value="auth" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>Configure access control for your application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requiresAuth"
                        checked={requiresAuth}
                        onCheckedChange={setRequiresAuth}
                      />
                      <Label htmlFor="requiresAuth">Require Authentication</Label>
                    </div>

                    {requiresAuth && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Authentication Enabled</h4>
                        <p className="text-sm text-blue-700">
                          Users will need to log in to access this application. After creating the app, 
                          use the "Users" button to manage who can access it.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
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
