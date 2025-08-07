
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CustomApp, AppSection, FormField } from './AppBuilderControlSystem';

interface AppCanvasPreviewProps {
  app: CustomApp;
}

export const AppCanvasPreview: React.FC<AppCanvasPreviewProps> = ({ app }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                  <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
              required={field.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (section: AppSection) => {
    const sectionStyle = {
      position: 'absolute' as const,
      left: `${section.layout?.x || 0}%`,
      top: `${section.layout?.y || 0}px`,
      width: `${section.layout?.width || 100}%`,
      height: section.layout?.height ? `${section.layout.height}px` : 'auto',
      zIndex: section.layout?.zIndex || 1,
    };

    const backgroundColor = section.config?.backgroundColor || '#ffffff';
    const textAlign = section.config?.textAlign || 'left';
    const showBorder = section.config?.showBorder;

    return (
      <div
        key={section.id}
        style={sectionStyle}
        className="transition-all"
      >
        <Card 
          className={showBorder ? 'border' : 'border-0 shadow-none'}
          style={{ backgroundColor }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ textAlign }}>{section.title}</CardTitle>
          </CardHeader>
          <CardContent style={{ textAlign }}>
            {section.type === 'form' && (
              <div className="space-y-4">
                {section.fields?.map(renderField)}
                {section.fields && section.fields.length > 0 && (
                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                )}
              </div>
            )}

            {(section.type === 'details' || section.type === 'text' || section.type === 'card') && (
              <div className="whitespace-pre-wrap">
                {section.content || `This is a ${section.type} section. Add your content here.`}
              </div>
            )}

            {section.type === 'list' && (
              <div>
                {section.content ? (
                  <div className="whitespace-pre-wrap">{section.content}</div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    <li>List item 1</li>
                    <li>List item 2</li>
                    <li>List item 3</li>
                  </ul>
                )}
              </div>
            )}

            {section.type === 'confirmation' && (
              <div className="text-center space-y-4">
                <div className="whitespace-pre-wrap">
                  {section.content || 'Thank you! Your submission has been received.'}
                </div>
                <Button variant="outline">Continue</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-gray-50 relative overflow-auto">
      {/* Navbar */}
      {app.navbar?.enabled && (
        <div 
          className="w-full border-b sticky top-0 z-50"
          style={{ 
            backgroundColor: app.navbar.backgroundColor || '#ffffff',
            color: app.navbar.textColor || '#000000'
          }}
        >
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="font-semibold">{app.navbar.title || app.name}</div>
            <div className="flex items-center gap-4">
              {app.navbar.items.map((item) => (
                <a
                  key={item.id}
                  href={item.url || '#'}
                  className={`
                    ${item.type === 'button' ? 'px-3 py-1 bg-blue-600 text-white rounded' : ''}
                    ${item.type === 'link' ? 'hover:underline' : ''}
                  `}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* App Content */}
      <div className="relative min-h-screen p-8">
        {app.sections.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No sections added</div>
              <div className="text-sm">Add sections to see your app preview</div>
            </div>
          </div>
        ) : (
          app.sections.map(renderSection)
        )}
      </div>
    </div>
  );
};
