
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface MachineFiltersProps {
  statusFilter: string;
  manufacturerFilter: string;
  onStatusFilterChange: (value: string) => void;
  onManufacturerFilterChange: (value: string) => void;
  onClearFilters: () => void;
  manufacturers: string[];
}

export const MachineFilters = ({
  statusFilter,
  manufacturerFilter,
  onStatusFilterChange,
  onManufacturerFilterChange,
  onClearFilters,
  manufacturers
}: MachineFiltersProps) => {
  const hasActiveFilters = statusFilter !== 'all' || manufacturerFilter !== 'all';

  return (
    <Card className="p-4 bg-white border border-gray-200 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Manufacturer</label>
          <Select value={manufacturerFilter} onValueChange={onManufacturerFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Manufacturers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-10"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
