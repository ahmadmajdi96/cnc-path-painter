import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FunctionData } from '../FunctionBuilder';

interface FunctionGroup {
  id: string;
  name: string;
  color: string;
}

const categories = [
  'data_processing',
  'integration',
  'notification',
  'validation',
  'transformation',
  'scheduling',
  'reporting',
  'utility'
];

interface FunctionInfoSectionProps {
  data: FunctionData;
  onChange: (data: FunctionData) => void;
  disabled: boolean;
  projectId: string | null;
}

export const FunctionInfoSection: React.FC<FunctionInfoSectionProps> = ({
  data,
  onChange,
  disabled,
  projectId
}) => {
  const [groups, setGroups] = useState<FunctionGroup[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchGroups();
    }
  }, [projectId]);

  const fetchGroups = async () => {
    const { data: groupsData } = await supabase
      .from('function_groups')
      .select('id, name, color')
      .eq('project_id', projectId)
      .order('name');
    
    setGroups(groupsData || []);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Function Name</Label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Enter function name"
            disabled={disabled}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select
            value={data.category}
            onValueChange={(value) => onChange({ ...data, category: value })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Group</Label>
        <Select
          value={data.group_id || 'none'}
          onValueChange={(value) => onChange({ ...data, group_id: value === 'none' ? null : value })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select group (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Group</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Describe what this function does"
          rows={4}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
