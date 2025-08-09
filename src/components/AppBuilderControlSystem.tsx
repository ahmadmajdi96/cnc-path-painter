import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Save, Eye, Settings, Trash2, FileText, List, CreditCard, Type, CheckSquare, Layout } from 'lucide-react';
import { AppCanvasBuilder } from './AppCanvasBuilder';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file' | 'password';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  dataEntryType: 'manual' | 'automated' | 'barcode' | 'qr' | 'nfc' | 'integration';
  integrationMapping?: {
    integrationId: string;
    fieldPath: string;
  };
  integrationSource?: {
    integrationId: string;
    protocol: string;
    dataPath: string;
  };
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface NavbarItem {
  id: string;
  label: string;
  type: 'link' | 'button' | 'text';
  url?: string;
}

export interface AppSection {
  id: string;
  type: 'form' | 'details' | 'card' | 'list' | 'text' | 'confirmation';
  title: string;
  fields?: FormField[];
  content?: string;
  config?: {
    columns?: number;
    showBorder?: boolean;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontColor?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    fontFamily?: string;
    dataSource?: 'static' | 'integration';
    staticData?: any[];
    integrationId?: string;
    dataPath?: string;
    listItems?: {
      integrationId?: string;
      dataPath?: string;
      viewType?: 'list' | 'grid';
      itemsPerRow?: number;
      cardStyle?: boolean;
      showSearch?: boolean;
      showFilter?: boolean;
      searchFields?: string[];
      filterFields?: string[];
      staticData?: any[];
      dataSource?: 'static' | 'integration';
      selectedFields?: {
        [key: string]: {
          field: string;
          label: string;
          type: 'text' | 'number' | 'image' | 'boolean';
        };
      };
      itemTemplate?: {
        image?: { field: string; fallback: string };
        title?: { field: string; fallback: string };
        subtitle?: { field: string; fallback: string };
        quantity?: { field: string; fallback: string };
        location?: { field: string; fallback: string };
      };
    };
    trigger?: {
      type: 'form_submit' | 'item_delete' | 'custom_action';
      targetId?: string;
      action?: string;
    };
    confirmationText?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
  };
  layout?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    zIndex?: number;
  };
}

export interface CustomApp {
  id: string;
  name: string;
  description: string;
  sections: AppSection[];
  createdAt: string;
  updatedAt: string;
  url: string;
  status: 'draft' | 'published' | 'archived';
  requiresAuth: boolean;
  users?: AppUser[];
  navbar?: {
    enabled: boolean;
    title: string;
    items: NavbarItem[];
    backgroundColor: string;
    textColor: string;
  };
  canvasSettings?: {
    backgroundColor: string;
    borderRadius: number;
  };
}

export interface AppSettings {
  navbar?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: 'sm' | 'base' | 'lg';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    showBorder?: boolean;
  };
  globalStyles?: {
    fontFamily?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export const AppBuilderControlSystem: React.FC = () => {
  const [apps, setApps] = useState<CustomApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<CustomApp | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAppData, setNewAppData] = useState({
    name: '',
    description: '',
  });

  const handleCreateApp = () => {
    if (!newAppData.name.trim()) return;

    const newApp: CustomApp = {
      id: Date.now().toString(),
      name: newAppData.name,
      description: newAppData.description,
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      url: `/app/${Date.now()}`,
      status: 'draft',
      requiresAuth: false,
      users: [],
      navbar: {
        enabled: false,
        title: '',
        items: [],
        backgroundColor: '#ffffff',
        textColor: '#000000',
      },
      canvasSettings: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
      },
    };

    setApps([...apps, newApp]);
    setSelectedApp(newApp);
    setIsCreating(false);
    setNewAppData({ name: '', description: '' });
  };

  const handleUpdateApp = (updatedApp: Omit<CustomApp, 'id' | 'createdAt' | 'updatedAt' | 'url'>) => {
    if (!selectedApp) return;

    const updated: CustomApp = {
      ...selectedApp,
      ...updatedApp,
      updatedAt: new Date().toISOString(),
    };

    setApps(apps.map(app => app.id === selectedApp.id ? updated : app));
    setSelectedApp(updated);
  };

  const handleDeleteApp = (appId: string) => {
    setApps(apps.filter(app => app.id !== appId));
    if (selectedApp?.id === appId) {
      setSelectedApp(null);
    }
  };

  const sectionIcons = {
    form: FileText,
    details: Layout,
    card: CreditCard,
    list: List,
    text: Type,
    confirmation: CheckSquare,
  };

  if (selectedApp) {
    return (
      <div className="h-screen bg-gray-50">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedApp(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Apps
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{selectedApp.name}</h1>
                <p className="text-sm text-gray-600">{selectedApp.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedApp.sections.length} sections
              </Badge>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
        
        <AppCanvasBuilder
          app={selectedApp}
          onAppUpdate={handleUpdateApp}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">App Builder</h1>
          <p className="text-gray-600">Create and manage your custom applications</p>
        </div>

        {/* Create New App */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New App
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">App Name</Label>
                    <Input
                      id="appName"
                      value={newAppData.name}
                      onChange={(e) => setNewAppData({ ...newAppData, name: e.target.value })}
                      placeholder="Enter app name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appDescription">Description</Label>
                    <Input
                      id="appDescription"
                      value={newAppData.description}
                      onChange={(e) => setNewAppData({ ...newAppData, description: e.target.value })}
                      placeholder="Enter app description"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateApp} disabled={!newAppData.name.trim()}>
                    Create App
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Apps List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteApp(app.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sections:</span>
                    <Badge variant="outline">{app.sections.length}</Badge>
                  </div>
                  
                  {app.sections.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {app.sections.slice(0, 3).map((section) => {
                        const Icon = sectionIcons[section.type];
                        return (
                          <div key={section.id} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs">
                            <Icon className="w-3 h-3" />
                            {section.type}
                          </div>
                        );
                      })}
                      {app.sections.length > 3 && (
                        <div className="bg-gray-100 rounded px-2 py-1 text-xs">
                          +{app.sections.length - 3} more
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                      className="flex-1"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(app.url, '_blank')}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Created: {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {apps.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No apps yet</h3>
              <p>Create your first application to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
