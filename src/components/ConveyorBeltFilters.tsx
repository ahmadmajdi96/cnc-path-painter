
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface ConveyorBeltFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  locationFilter: string;
  onLocationFilterChange: (location: string) => void;
}

export const ConveyorBeltFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  locationFilter,
  onLocationFilterChange
}: ConveyorBeltFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search & Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search Conveyor Belts</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by name, model, or manufacturer..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label>Status</Label>
            <Select value={statusFilter || "all"} onValueChange={(value) => onStatusFilterChange(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Belt Type</Label>
            <Select value={typeFilter || "all"} onValueChange={(value) => onTypeFilterChange(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="flat">Flat Belt</SelectItem>
                <SelectItem value="modular">Modular Belt</SelectItem>
                <SelectItem value="cleated">Cleated Belt</SelectItem>
                <SelectItem value="inclined">Inclined Belt</SelectItem>
                <SelectItem value="curved">Curved Belt</SelectItem>
                <SelectItem value="roller">Roller Conveyor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => onLocationFilterChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
