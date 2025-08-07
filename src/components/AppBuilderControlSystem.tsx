import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2, ExternalLink, Users } from 'lucide-react';
import { ModernAppBuilderDrawer } from './ModernAppBuilderDrawer';
import { AppPreviewDialog } from './AppPreviewDialog';
import { AppAuthDialog } from './AppAuthDialog';

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  dataEntryType: 'manual' | 'automated';
  integrationSource?: {
    integrationId: string;
    protocol: string;
    dataPath: string;
  };
  options?: string[]; // for select, radio
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface AppSection {
  id: string;
  type: 'form' | 'details' | 'card' | 'list' | 'confirmation' | 'text';
  title: string;
  content?: string;
  fields?: FormField[];
  config?: {
    columns?: number;
    showBorder?: boolean;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  layout?: {
    width: number; // percentage of container width
    height?: number; // fixed height in pixels, optional
    x: number; // horizontal position as percentage
    y: number; // vertical position as percentage
    zIndex?: number; // layering order
  };
}

export interface NavbarItem {
  id: string;
  label: string;
  type: 'link' | 'button' | 'text';
  url?: string;
  action?: string;
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface CustomApp {
  id: string;
  name: string;
  description: string;
  sections: AppSection[];
  status: 'draft' | 'published' | 'archived';
  url?: string;
  createdAt: string;
  updatedAt: string;
  navbar?: {
    enabled: boolean;
    title?: string;
    items: NavbarItem[];
    backgroundColor?: string;
    textColor?: string;
  };
  requiresAuth: boolean;
  users?: AppUser[];
}

export const AppBuilderControlSystem = () => {
  const [apps, setApps] = useState<CustomApp[]>([
    {
      id: '1',
      name: 'Customer Registration Form',
      description: 'A comprehensive customer registration form with automated data integration',
      sections: [
        {
          id: '1',
          type: 'form',
          title: 'Customer Information',
          fields: [
            {
              id: '1',
              type: 'text',
              label: 'Full Name',
              required: true,
              dataEntryType: 'manual'
            },
            {
              id: '2',
              type: 'email',
              label: 'Email Address',
              required: true,
              dataEntryType: 'automated',
              integrationSource: {
                integrationId: '1',
                protocol: 'REST_API',
                dataPath: '/customer/email'
              }
            }
          ],
          layout: {
            width: 100,
            x: 0,
            y: 0
          }
        }
      ],
      status: 'published',
      url: 'https://app.company.com/customer-registration',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      requiresAuth: false,
      navbar: {
        enabled: false,
        items: []
      }
    }
  ]);

  const [selectedApp, setSelectedApp] = useState<CustomApp | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleCreateApp = () => {
    setSelectedApp(null);
    setShowDrawer(true);
  };

  const handleEditApp = (app: CustomApp) => {
    setSelectedApp(app);
    setShowDrawer(true);
  };

  const handleSaveApp = (appData: Omit<CustomApp, 'id' | 'createdAt' | 'updatedAt' | 'url'>) => {
    if (selectedApp) {
      // Update existing app
      const updatedApp: CustomApp = {
        ...selectedApp,
        ...appData,
        updatedAt: new Date().toISOString(),
      };
      setApps(apps.map(app => app.id === selectedApp.id ? updatedApp : app));
    } else {
      // Create new app
      const newApp: CustomApp = {
        ...appData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setApps([...apps, newApp]);
    }
    setShowDrawer(false);
  };

  const handleDeleteApp = (id: string) => {
    setApps(apps.filter(app => app.id !== id));
  };

  const handlePublishApp = (app: CustomApp) => {
    const publishedApp: CustomApp = {
      ...app,
      status: 'published',
      url: `https://app.company.com/${app.name.toLowerCase().replace(/\s+/g, '-')}`,
      updatedAt: new Date().toISOString(),
    };
    setApps(apps.map(a => a.id === app.id ? publishedApp : a));
  };

  const handlePreviewApp = (app: CustomApp) => {
    setSelectedApp(app);
    setShowPreview(true);
  };

  const handleManageAuth = (app: CustomApp) => {
    setSelectedApp(app);
    setShowAuth(true);
  };

  const handleUpdateAppUsers = (appId: string, users: AppUser[]) => {
    setApps(apps.map(app => 
      app.id === appId ? { ...app, users, updatedAt: new Date().toISOString() } : app
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">App Builder</h1>
          <p className="text-gray-600">Create and manage custom applications with modern drag-and-drop interface</p>
        </div>
        <Button onClick={handleCreateApp} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New App
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{app.name}</CardTitle>
                  <CardDescription>{app.description}</CardDescription>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  app.status === 'published' ? 'bg-green-100 text-green-800' :
                  app.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {app.status}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  {app.sections.length} section{app.sections.length !== 1 ? 's' : ''}
                  {app.requiresAuth && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      Auth Required
                    </span>
                  )}
                  {app.navbar?.enabled && (
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      Has Navbar
                    </span>
                  )}
                </div>
                
                {app.url && app.status === 'published' && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4" />
                    <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Live App
                    </a>
                  </div>
                )}

                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewApp(app)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditApp(app)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  {app.requiresAuth && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageAuth(app)}
                      className="flex items-center gap-1"
                    >
                      <Users className="w-4 h-4" />
                      Users
                    </Button>
                  )}
                  {app.status === 'draft' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePublishApp(app)}
                    >
                      Publish
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteApp(app.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ModernAppBuilderDrawer
        open={showDrawer}
        onOpenChange={setShowDrawer}
        app={selectedApp}
        onSave={handleSaveApp}
      />

      <AppPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        app={selectedApp}
      />

      <AppAuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        app={selectedApp}
        onUpdateUsers={handleUpdateAppUsers}
      />
    </div>
  );
};
