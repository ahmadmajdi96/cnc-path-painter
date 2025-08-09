
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AppSection } from './AppBuilderControlSystem';

interface SectionStylingPanelProps {
  section: AppSection;
  onUpdate: (section: AppSection) => void;
}

export const SectionStylingPanel: React.FC<SectionStylingPanelProps> = ({
  section,
  onUpdate,
}) => {
  const handleConfigUpdate = (field: string, value: any) => {
    onUpdate({
      ...section,
      config: {
        ...section.config,
        [field]: value,
      },
    });
  };

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

  return (
    <div className="space-y-6">
      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select
                value={section.config?.fontSize || 'base'}
                onValueChange={(value) => handleConfigUpdate('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                  <SelectItem value="2xl">2X Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Font Weight</Label>
              <Select
                value={section.config?.fontWeight || 'normal'}
                onValueChange={(value) => handleConfigUpdate('fontWeight', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="semibold">Semibold</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Font Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={section.config?.fontColor || '#000000'}
                onChange={(e) => handleConfigUpdate('fontColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={section.config?.fontColor || '#000000'}
                onChange={(e) => handleConfigUpdate('fontColor', e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <Select
              value={section.config?.textAlign || 'left'}
              onValueChange={(value) => handleConfigUpdate('textAlign', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Background & Border */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Background & Border</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={section.config?.backgroundColor || '#ffffff'}
                onChange={(e) => handleConfigUpdate('backgroundColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={section.config?.backgroundColor || '#ffffff'}
                onChange={(e) => handleConfigUpdate('backgroundColor', e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showBorder"
              checked={section.config?.showBorder || false}
              onCheckedChange={(checked) => handleConfigUpdate('showBorder', checked)}
            />
            <Label htmlFor="showBorder">Show Border</Label>
          </div>
        </CardContent>
      </Card>

      {/* List-specific styling */}
      {section.type === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">List Display Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>View Type</Label>
                <Select
                  value={section.config?.listItems?.viewType || 'list'}
                  onValueChange={(value) => handleListItemsUpdate('viewType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">List View</SelectItem>
                    <SelectItem value="grid">Grid View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {section.config?.listItems?.viewType === 'grid' && (
                <div className="space-y-2">
                  <Label>Items per Row</Label>
                  <Select
                    value={section.config?.listItems?.itemsPerRow?.toString() || '3'}
                    onValueChange={(value) => handleListItemsUpdate('itemsPerRow', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Items</SelectItem>
                      <SelectItem value="3">3 Items</SelectItem>
                      <SelectItem value="4">4 Items</SelectItem>
                      <SelectItem value="5">5 Items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="cardStyle"
                checked={section.config?.listItems?.cardStyle || false}
                onCheckedChange={(checked) => handleListItemsUpdate('cardStyle', checked)}
              />
              <Label htmlFor="cardStyle">Card Style</Label>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showSearch"
                  checked={section.config?.listItems?.showSearch || false}
                  onCheckedChange={(checked) => handleListItemsUpdate('showSearch', checked)}
                />
                <Label htmlFor="showSearch">Enable Search</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showFilter"
                  checked={section.config?.listItems?.showFilter || false}
                  onCheckedChange={(checked) => handleListItemsUpdate('showFilter', checked)}
                />
                <Label htmlFor="showFilter">Enable Filters</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
