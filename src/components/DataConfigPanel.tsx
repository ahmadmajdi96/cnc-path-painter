
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { AppSection } from './AppBuilderControlSystem';

interface DataConfigPanelProps {
  section: AppSection;
  onUpdate: (section: AppSection) => void;
}

// Mock integrations with sample data structure
const mockIntegrations = [
  {
    id: '1',
    name: 'ERP Integration',
    sampleData: {
      id: '123',
      name: 'Product A',
      description: 'High quality product',
      imageUrl: '/api/images/product-a.jpg',
      quantity: 50,
      location: 'Warehouse A',
      price: 99.99,
      category: 'Electronics',
      inStock: true
    }
  },
  {
    id: '2',
    name: 'Inventory System',
    sampleData: {
      itemId: 'INV-001',
      title: 'Item Title',
      subtitle: 'Item Description',
      image: '/api/inventory/image.jpg',
      qty: 25,
      warehouse: 'Location B',
      status: 'available'
    }
  }
];

export const DataConfigPanel: React.FC<DataConfigPanelProps> = ({
  section,
  onUpdate,
}) => {
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

  const handleSelectedFieldUpdate = (fieldKey: string, fieldData: any) => {
    onUpdate({
      ...section,
      config: {
        ...section.config,
        listItems: {
          ...section.config?.listItems,
          selectedFields: {
            ...section.config?.listItems?.selectedFields,
            [fieldKey]: fieldData,
          },
        },
      },
    });
  };

  const addStaticDataItem = () => {
    const currentData = section.config?.listItems?.staticData || [];
    const newItem = {
      id: Date.now().toString(),
      title: 'New Item',
      subtitle: 'Item description',
      image: '/placeholder.svg',
      quantity: 1,
      location: 'Location'
    };

    handleListItemsUpdate('staticData', [...currentData, newItem]);
  };

  const removeStaticDataItem = (index: number) => {
    const currentData = section.config?.listItems?.staticData || [];
    handleListItemsUpdate('staticData', currentData.filter((_, i) => i !== index));
  };

  const selectedIntegration = mockIntegrations.find(
    i => i.id === section.config?.listItems?.integrationId
  );

  return (
    <div className="space-y-6">
      {/* Data Source Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Source Type</Label>
            <Select
              value={section.config?.listItems?.dataSource || 'static'}
              onValueChange={(value) => handleListItemsUpdate('dataSource', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static Data</SelectItem>
                <SelectItem value="integration">Integration Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {section.config?.listItems?.dataSource === 'integration' && (
            <>
              <div className="space-y-2">
                <Label>Select Integration</Label>
                <Select
                  value={section.config?.listItems?.integrationId || ''}
                  onValueChange={(value) => handleListItemsUpdate('integrationId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose integration" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIntegrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        {integration.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Path</Label>
                <Input
                  value={section.config?.listItems?.dataPath || ''}
                  onChange={(e) => handleListItemsUpdate('dataPath', e.target.value)}
                  placeholder="/api/data/items"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Field Mapping for Integration Data */}
      {section.config?.listItems?.dataSource === 'integration' && selectedIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Field Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Available fields from {selectedIntegration.name}:
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
                {JSON.stringify(selectedIntegration.sampleData, null, 2)}
              </div>
            </div>

            <Separator />

            {['image', 'title', 'subtitle', 'quantity', 'location'].map((fieldType) => (
              <div key={fieldType} className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs capitalize">{fieldType}</Label>
                  <Input
                    placeholder={`${fieldType} field`}
                    value={section.config?.listItems?.selectedFields?.[fieldType]?.field || ''}
                    onChange={(e) => handleSelectedFieldUpdate(fieldType, {
                      ...section.config?.listItems?.selectedFields?.[fieldType],
                      field: e.target.value,
                      label: fieldType
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Display Label</Label>
                  <Input
                    placeholder="Label"
                    value={section.config?.listItems?.selectedFields?.[fieldType]?.label || fieldType}
                    onChange={(e) => handleSelectedFieldUpdate(fieldType, {
                      ...section.config?.listItems?.selectedFields?.[fieldType],
                      field: section.config?.listItems?.selectedFields?.[fieldType]?.field || '',
                      label: e.target.value
                    })}
                  />
                </div>
                <Select
                  value={section.config?.listItems?.selectedFields?.[fieldType]?.type || 'text'}
                  onValueChange={(value) => handleSelectedFieldUpdate(fieldType, {
                    ...section.config?.listItems?.selectedFields?.[fieldType],
                    field: section.config?.listItems?.selectedFields?.[fieldType]?.field || '',
                    label: section.config?.listItems?.selectedFields?.[fieldType]?.label || fieldType,
                    type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Static Data Management */}
      {section.config?.listItems?.dataSource === 'static' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Static Data Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addStaticDataItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.config?.listItems?.staticData?.map((item, index) => (
              <div key={index} className="border rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Item {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStaticDataItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Title"
                    value={item.title || ''}
                    onChange={(e) => {
                      const newData = [...(section.config?.listItems?.staticData || [])];
                      newData[index] = { ...item, title: e.target.value };
                      handleListItemsUpdate('staticData', newData);
                    }}
                  />
                  <Input
                    placeholder="Subtitle"
                    value={item.subtitle || ''}
                    onChange={(e) => {
                      const newData = [...(section.config?.listItems?.staticData || [])];
                      newData[index] = { ...item, subtitle: e.target.value };
                      handleListItemsUpdate('staticData', newData);
                    }}
                  />
                  <Input
                    placeholder="Quantity"
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => {
                      const newData = [...(section.config?.listItems?.staticData || [])];
                      newData[index] = { ...item, quantity: parseInt(e.target.value) || 0 };
                      handleListItemsUpdate('staticData', newData);
                    }}
                  />
                  <Input
                    placeholder="Location"
                    value={item.location || ''}
                    onChange={(e) => {
                      const newData = [...(section.config?.listItems?.staticData || [])];
                      newData[index] = { ...item, location: e.target.value };
                      handleListItemsUpdate('staticData', newData);
                    }}
                  />
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
                No items added yet. Click "Add Item" to create static data.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
