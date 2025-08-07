
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { CustomApp, NavbarItem } from './AppBuilderControlSystem';
import { AppCanvasBuilder } from './AppCanvasBuilder';

interface ModernAppBuilderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: CustomApp | null;
  onSave: (app: Omit<CustomApp, 'id' | 'createdAt' | 'updatedAt' | 'url'>) => void;
}

export const ModernAppBuilderDrawer: React.FC<ModernAppBuilderDrawerProps> = ({
  open,
  onOpenChange,
  app,
  onSave,
}) => {
  const [appData, setAppData] = useState<Omit<CustomApp, 'id' | 'createdAt' | 'updatedAt' | 'url'>>({
    name: '',
    description: '',
    sections: [],
    status: 'draft',
    requiresAuth: false,
    navbar: {
      enabled: false,
      title: '',
      items: [],
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  });

  useEffect(() => {
    if (app) {
      setAppData({
        name: app.name,
        description: app.description,
        sections: app.sections,
        status: app.status,
        requiresAuth: app.requiresAuth,
        navbar: app.navbar || {
          enabled: false,
          title: '',
          items: [],
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
      });
    } else {
      setAppData({
        name: '',
        description: '',
        sections: [],
        status: 'draft',
        requiresAuth: false,
        navbar: {
          enabled: false,
          title: '',
          items: [],
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
      });
    }
  }, [app]);

  const handleBasicUpdate = (field: string, value: any) => {
    setAppData(prev => ({ ...prev, [field]: value }));
  };

  const handleNavbarUpdate = (field: string, value: any) => {
    setAppData(prev => ({
      ...prev,
      navbar: { ...prev.navbar!, [field]: value }
    }));
  };

  const handleAddNavbarItem = () => {
    const newItem: NavbarItem = {
      id: Date.now().toString(),
      label: 'New Item',
      type: 'link',
      url: '#',
    };
    setAppData(prev => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        items: [...(prev.navbar?.items || []), newItem]
      }
    }));
  };

  const handleUpdateNavbarItem = (itemId: string, updatedItem: NavbarItem) => {
    setAppData(prev => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        items: (prev.navbar?.items || []).map(item => 
          item.id === itemId ? updatedItem : item
        )
      }
    }));
  };

  const handleDeleteNavbarItem = (itemId: string) => {
    setAppData(prev => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        items: (prev.navbar?.items || []).filter(item => item.id !== itemId)
      }
    }));
  };

  const handleSave = () => {
    onSave(appData);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] max-w-full">
        <div className="flex flex-col h-full">
          <DrawerHeader className="border-b">
            <DrawerTitle>
              {app ? 'Edit Application' : 'Create New Application'}
            </DrawerTitle>
            <DrawerDescription>
              Modern drag-and-drop app builder with visual controls
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="builder" className="h-full flex flex-col">
              <div className="border-b px-6 py-2">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="builder">Visual Builder</TabsTrigger>
                  <TabsTrigger value="settings">App Settings</TabsTrigger>
                  <TabsTrigger value="navbar">Navigation</TabsTrigger>
                </TabsList>
              </div>

              {/* Visual Builder Tab */}
              <TabsContent value="builder" className="flex-1 m-0 p-0">
                <AppCanvasBuilder
                  app={appData}
                  onAppUpdate={setAppData}
                />
              </TabsContent>

              {/* App Settings Tab */}
              <TabsContent value="settings" className="flex-1 p-6 overflow-auto">
                <div className="max-w-2xl space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">App Name</Label>
                          <Input
                            id="name"
                            value={appData.name}
                            onChange={(e) => handleBasicUpdate('name', e.target.value)}
                            placeholder="Enter app name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select 
                            value={appData.status} 
                            onValueChange={(value: any) => handleBasicUpdate('status', value)}
                          >
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
                          value={appData.description}
                          onChange={(e) => handleBasicUpdate('description', e.target.value)}
                          placeholder="Enter app description"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requiresAuth"
                          checked={appData.requiresAuth}
                          onCheckedChange={(checked) => handleBasicUpdate('requiresAuth', checked)}
                        />
                        <Label htmlFor="requiresAuth">Require Authentication</Label>
                      </div>
                      {appData.requiresAuth && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            Users will need to log in to access this application. 
                            After creating the app, use the "Users" button to manage access.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Navbar Tab */}
              <TabsContent value="navbar" className="flex-1 p-6 overflow-auto">
                <div className="max-w-2xl space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Navigation Bar Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="navbarEnabled"
                          checked={appData.navbar?.enabled || false}
                          onCheckedChange={(checked) => handleNavbarUpdate('enabled', checked)}
                        />
                        <Label htmlFor="navbarEnabled">Enable Navigation Bar</Label>
                      </div>

                      {appData.navbar?.enabled && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="navbarTitle">Title</Label>
                              <Input
                                id="navbarTitle"
                                value={appData.navbar?.title || ''}
                                onChange={(e) => handleNavbarUpdate('title', e.target.value)}
                                placeholder="Navigation title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="navbarBg">Background Color</Label>
                              <Input
                                id="navbarBg"
                                type="color"
                                value={appData.navbar?.backgroundColor || '#ffffff'}
                                onChange={(e) => handleNavbarUpdate('backgroundColor', e.target.value)}
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
                              {appData.navbar?.items?.map((item) => (
                                <Card key={item.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                      <span className="font-medium text-sm">{item.label}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteNavbarItem(item.id)}
                                        className="text-red-600"
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
                                        <Label className="text-xs">URL</Label>
                                        <Input
                                          value={item.url || ''}
                                          onChange={(e) => handleUpdateNavbarItem(item.id, {
                                            ...item,
                                            url: e.target.value
                                          })}
                                          placeholder="URL or action"
                                          className="h-8"
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="border-t p-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!appData.name.trim()}>
              {app ? 'Update App' : 'Create App'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
