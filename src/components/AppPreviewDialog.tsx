
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CustomApp } from './AppBuilderControlSystem';

interface AppPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: CustomApp | null;
}

export const AppPreviewDialog: React.FC<AppPreviewDialogProps> = ({
  open,
  onOpenChange,
  app,
}) => {
  if (!app) return null;

  const renderField = (field: any) => {
    const commonProps = {
      key: field.id,
      id: field.id,
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input {...commonProps} type={field.type} />
            {field.dataEntryType === 'automated' && (
              <p className="text-xs text-blue-600">
                Auto-populated from: {field.integrationSource?.dataPath}
              </p>
            )}
          </div>
        );
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea {...commonProps} />
          </div>
        );
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Switch id={field.id} />
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.required && <span className="text-red-500">*</span>}
          </div>
        );
      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input {...commonProps} type="date" />
          </div>
        );
      case 'file':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input {...commonProps} type="file" />
          </div>
        );
      default:
        return null;
    }
  };

  const renderNavbar = () => {
    if (!app.navbar?.enabled) return null;

    return (
      <div 
        className="w-full px-6 py-3 border-b flex justify-between items-center"
        style={{
          backgroundColor: app.navbar.backgroundColor,
          color: app.navbar.textColor,
        }}
      >
        <div className="font-semibold text-lg">
          {app.navbar.title || app.name}
        </div>
        <div className="flex gap-4">
          {app.navbar.items.map((item) => (
            <div key={item.id}>
              {item.type === 'link' && (
                <a href={item.url} className="hover:underline">
                  {item.label}
                </a>
              )}
              {item.type === 'button' && (
                <Button variant="outline" size="sm">
                  {item.label}
                </Button>
              )}
              {item.type === 'text' && (
                <span>{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSection = (section: any) => {
    const sectionStyle = {
      backgroundColor: section.config?.backgroundColor || '#ffffff',
      textAlign: section.config?.textAlign || 'left',
      border: section.config?.showBorder ? '1px solid #e5e7eb' : 'none',
      position: 'absolute' as const,
      left: `${section.layout?.x || 0}%`,
      top: `${section.layout?.y || 0}px`,
      width: `${section.layout?.width || 100}%`,
      height: section.layout?.height ? `${section.layout.height}px` : 'auto',
      zIndex: section.layout?.zIndex || 1,
    };

    const gridCols = section.config?.columns === 3 ? 'grid-cols-3' :
                    section.config?.columns === 2 ? 'grid-cols-2' : 'grid-cols-1';

    switch (section.type) {
      case 'form':
        return (
          <Card key={section.id} style={sectionStyle}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid ${gridCols} gap-4`}>
                {section.fields?.map(renderField)}
              </div>
              <Button className="mt-6">Submit</Button>
            </CardContent>
          </Card>
        );
      case 'details':
      case 'text':
        return (
          <Card key={section.id} style={sectionStyle}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ textAlign: section.config?.textAlign }}>
                {section.content}
              </div>
            </CardContent>
          </Card>
        );
      case 'card':
        return (
          <Card key={section.id} style={sectionStyle}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{section.content}</p>
            </CardContent>
          </Card>
        );
      case 'list':
        return (
          <Card key={section.id} style={sectionStyle}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>• Sample list item 1</li>
                <li>• Sample list item 2</li>
                <li>• Sample list item 3</li>
              </ul>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const maxHeight = Math.max(...app.sections.map(s => (s.layout?.y || 0) + 400));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{app.name} - Preview</DialogTitle>
          <DialogDescription>
            Preview of how your application will look to users
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden bg-white">
          {renderNavbar()}
          
          {app.requiresAuth && (
            <div className="px-6 py-2 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="text-sm font-medium">🔒 Authentication Required</span>
                <span className="text-xs">Users will need to log in to access this app</span>
              </div>
            </div>
          )}

          <div className="text-center py-4 bg-blue-50">
            <h1 className="text-2xl font-bold">{app.name}</h1>
            <p className="text-gray-600">{app.description}</p>
          </div>

          <div 
            className="relative"
            style={{ 
              height: app.sections.length > 0 ? `${maxHeight}px` : '400px',
              minHeight: '400px'
            }}
          >
            {app.sections.map(renderSection)}

            {app.sections.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No sections configured yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
