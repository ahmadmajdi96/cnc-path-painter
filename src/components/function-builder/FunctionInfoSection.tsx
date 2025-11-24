import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { FunctionData } from '../FunctionBuilder';

interface FunctionInfoSectionProps {
  data: FunctionData;
  onChange: (data: FunctionData) => void;
  disabled: boolean;
}

const categories = [
  'data_processing',
  'api_integration',
  'file_management',
  'notification',
  'authentication',
  'validation',
  'transformation',
  'reporting',
  'scheduling',
  'other'
];

export const FunctionInfoSection: React.FC<FunctionInfoSectionProps> = ({
  data,
  onChange,
  disabled
}) => {
  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!data.tags.includes(tagInput.trim())) {
        onChange({ ...data, tags: [...data.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({ ...data, tags: data.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Function Name *</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="my_awesome_function"
          disabled={disabled}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={data.category}
          onValueChange={(value) => onChange({ ...data, category: value })}
          disabled={disabled}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Describe what this function does..."
          disabled={disabled}
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type and press Enter to add tags"
          disabled={disabled}
          className="mt-2"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1">
              {tag}
              {!disabled && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
