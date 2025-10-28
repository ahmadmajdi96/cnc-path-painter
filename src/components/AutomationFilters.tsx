import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Automation } from './AutomationControlSystem';

interface AutomationFiltersProps {
  automations: Automation[];
  onFilterChange: (filtered: Automation[]) => void;
}

export const AutomationFilters = ({ automations, onFilterChange }: AutomationFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = automations;

    if (searchTerm) {
      filtered = filtered.filter(automation =>
        automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        automation.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(automation =>
        statusFilter === 'enabled' ? automation.enabled : !automation.enabled
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(automation => 
        automation.operations.some(op => op.type === typeFilter)
      );
    }

    onFilterChange(filtered);
  }, [searchTerm, statusFilter, typeFilter, automations, onFilterChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search automations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="crud_operation">CRUD Operation</SelectItem>
              <SelectItem value="file_operation">File Operation</SelectItem>
              <SelectItem value="logic_conditions">Logic & Conditions</SelectItem>
              <SelectItem value="run_script">Run Script</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
