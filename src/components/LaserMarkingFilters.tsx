
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';

interface LaserMarkingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  manufacturerFilter: string;
  onManufacturerChange: (value: string) => void;
}

export const LaserMarkingFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  manufacturerFilter,
  onManufacturerChange
}: LaserMarkingFiltersProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4" />
          Search & Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <Label htmlFor="search" className="text-xs">Search Lasers</Label>
          <Input
            id="search"
            placeholder="Search by name or model..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="status" className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="manufacturer" className="text-xs">Manufacturer</Label>
            <Input
              id="manufacturer"
              placeholder="Filter by manufacturer..."
              value={manufacturerFilter}
              onChange={(e) => onManufacturerChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
