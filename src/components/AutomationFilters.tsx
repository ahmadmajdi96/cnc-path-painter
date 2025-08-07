
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Automation } from './AutomationControlSystem';

interface AutomationFiltersProps {
  automations: Automation[];
  onFilterChange: (filtered: Automation[]) => void;
}

export const AutomationFilters = ({ automations, onFilterChange }: AutomationFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [triggerTypeFilter, setTriggerTypeFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from automations
  const allTags = Array.from(
    new Set(automations.flatMap(automation => automation.tags))
  );

  // Get all unique trigger types
  const triggerTypes = Array.from(
    new Set(automations.map(automation => automation.trigger.type))
  );

  useEffect(() => {
    let filtered = automations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(automation =>
        automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        automation.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(automation =>
        statusFilter === 'enabled' ? automation.enabled : !automation.enabled
      );
    }

    // Trigger type filter
    if (triggerTypeFilter !== 'all') {
      filtered = filtered.filter(automation =>
        automation.trigger.type === triggerTypeFilter
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(automation =>
        selectedTags.some(tag => automation.tags.includes(tag))
      );
    }

    onFilterChange(filtered);
  }, [searchTerm, statusFilter, triggerTypeFilter, selectedTags, automations, onFilterChange]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTriggerTypeFilter('all');
    setSelectedTags([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search automations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Trigger Type</label>
          <Select value={triggerTypeFilter} onValueChange={setTriggerTypeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {triggerTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tags</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
};
