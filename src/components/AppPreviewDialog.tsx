
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

  const renderSection = (section: any) => {
    const sectionStyle = {
      backgroundColor: section.config?.backgroundColor || '#ffffff',
      textAlign: section.config?.textAlign || 'left',
      border: section.config?.showBorder ? '1px solid #e5e7eb' : 'none',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{app.name} - Preview</DialogTitle>
          <DialogDescription>
            Preview of how your application will look to users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="text-center py-4 bg-blue-50 rounded-lg">
            <h1 className="text-2xl font-bold">{app.name}</h1>
            <p className="text-gray-600">{app.description}</p>
          </div>

          {app.sections.map(renderSection)}

          {app.sections.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No sections configured yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
