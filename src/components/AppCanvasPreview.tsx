
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Filter, Image, MapPin, Hash } from 'lucide-react';
import { CustomApp, AppSection, FormField } from './AppBuilderControlSystem';

interface AppCanvasPreviewProps {
  app: CustomApp;
}

export const AppCanvasPreview: React.FC<AppCanvasPreviewProps> = ({ app }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);

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

  const renderListContent = (section: AppSection) => {
    const listConfig = section.config?.listItems;
    const isGrid = listConfig?.viewType === 'grid';
    const itemsPerRow = listConfig?.itemsPerRow || 3;
    const cardStyle = listConfig?.cardStyle ?? true;
    const showSearch = listConfig?.showSearch ?? false;
    const showFilter = listConfig?.showFilter ?? false;
    
    // Use static data or fallback sample data
    const sampleData = listConfig?.staticData && listConfig.staticData.length > 0 
      ? listConfig.staticData 
      : [
          { id: '1', title: 'Sample Item 1', subtitle: 'Description for item 1', quantity: 10, location: 'A1', image: '/placeholder.svg' },
          { id: '2', title: 'Sample Item 2', subtitle: 'Description for item 2', quantity: 5, location: 'B2', image: '/placeholder.svg' },
          { id: '3', title: 'Sample Item 3', subtitle: 'Description for item 3', quantity: 8, location: 'C3', image: '/placeholder.svg' },
        ];

    const filteredData = searchQuery 
      ? sampleData.filter(item => 
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : sampleData;

    return (
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        {(showSearch || showFilter) && (
          <div className="flex gap-2">
            {showSearch && (
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            {showFilter && (
              <Button
                variant={filterActive ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterActive(!filterActive)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            )}
          </div>
        )}

        {/* List Content */}
        <div className={`
          ${isGrid 
            ? `grid gap-4 ${itemsPerRow === 2 ? 'grid-cols-2' : itemsPerRow === 3 ? 'grid-cols-3' : itemsPerRow === 4 ? 'grid-cols-4' : 'grid-cols-3'}`
            : 'space-y-3'
          }
        `}>
          {filteredData.map((item, index) => (
            <div
              key={item.id || index}
              className={`
                ${cardStyle 
                  ? 'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4' 
                  : 'bg-gray-50 rounded p-3 border border-gray-100'
                }
              `}
            >
              <div className={`flex ${isGrid ? 'flex-col' : 'flex-row'} gap-3`}>
                {/* Image */}
                <div className={`${isGrid ? 'w-full h-32' : 'w-16 h-16'} bg-gray-200 rounded flex items-center justify-center flex-shrink-0`}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <Image className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {item.title || listConfig?.itemTemplate?.title?.fallback || 'Item Title'}
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">
                    {item.subtitle || listConfig?.itemTemplate?.subtitle?.fallback || 'Item Description'}
                  </div>
                  
                  {!isGrid && (
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      {(item.quantity !== undefined || listConfig?.itemTemplate?.quantity) && (
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span>{item.quantity || listConfig?.itemTemplate?.quantity?.fallback || '0'}</span>
                        </div>
                      )}
                      {(item.location || listConfig?.itemTemplate?.location) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.location || listConfig?.itemTemplate?.location?.fallback || 'Location'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>{searchQuery ? 'No items found matching your search' : 'No items to display'}</p>
          </div>
        )}

        {/* Data Source Info */}
        <div className="text-xs text-center text-gray-500 pt-2 border-t">
          {listConfig?.dataSource === 'integration' 
            ? `Integration: ${listConfig.integrationId ? 'Connected' : 'Not configured'}`
            : `Static data (${filteredData.length} items)`
          }
        </div>
      </div>
    );
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
    const fontSize = section.config?.fontSize;
    const fontWeight = section.config?.fontWeight;
    const fontColor = section.config?.fontColor;

    const cardStyle: React.CSSProperties = {
      backgroundColor,
      ...(fontSize && { fontSize: `var(--font-size-${fontSize})` }),
      ...(fontWeight && { fontWeight }),
      ...(fontColor && { color: fontColor }),
    };

    return (
      <div
        key={section.id}
        style={sectionStyle}
        className="transition-all"
      >
        <Card 
          className={showBorder ? 'border' : 'border-0 shadow-none'}
          style={cardStyle}
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

            {section.type === 'list' && renderListContent(section)}

            {section.type === 'confirmation' && (
              <div className="text-center space-y-4">
                <div className="whitespace-pre-wrap">
                  {section.config?.confirmationText || 'Are you sure you want to proceed?'}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    {section.config?.cancelButtonText || 'Cancel'}
                  </Button>
                  <Button>
                    {section.config?.confirmButtonText || 'Confirm'}
                  </Button>
                </div>
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
      <div 
        className="relative min-h-screen p-8"
        style={{
          backgroundColor: app.canvasSettings?.backgroundColor || '#ffffff',
          borderRadius: `${app.canvasSettings?.borderRadius || 0}px`,
        }}
      >
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
