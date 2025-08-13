
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessedData } from '@/types/data';
import { FilterOptions, getUniqueValues } from '@/utils/filterUtils';
import { Search, Filter, X, Calendar, Users, MapPin, Clock, BookOpen, RotateCcw } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

interface EnhancedDataFiltersProps {
  data: ProcessedData[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const EnhancedDataFilters: React.FC<EnhancedDataFiltersProps> = ({
  data,
  filters,
  onFiltersChange,
}) => {
  const trainers = getUniqueValues(data, 'teacherName');
  const classes = getUniqueValues(data, 'cleanedClass');
  const locations = getUniqueValues(data, 'location');
  const daysOfWeek = getUniqueValues(data, 'dayOfWeek');
  const periods = getUniqueValues(data, 'period');

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.selectedTrainer && filters.selectedTrainer !== 'all') count++;
    if (filters.selectedClass && filters.selectedClass !== 'all') count++;
    if (filters.selectedLocation && filters.selectedLocation !== 'all') count++;
    if (filters.selectedDayOfWeek && filters.selectedDayOfWeek !== 'all') count++;
    if (filters.selectedPeriod && filters.selectedPeriod !== 'all') count++;
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-background via-background to-muted/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <p className="text-sm text-muted-foreground">
                Refine your data analysis with precise filtering
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Search className="h-4 w-4" />
              Search
            </Label>
            <div className="relative">
              <Input
                placeholder="Search classes, trainers..."
                value={filters.searchTerm || ''}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Trainer */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Trainer
            </Label>
            <Select
              value={filters.selectedTrainer || 'all'}
              onValueChange={(value) => updateFilter('selectedTrainer', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All trainers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All trainers</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer} value={trainer}>
                    {trainer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Class Type
            </Label>
            <Select
              value={filters.selectedClass || 'all'}
              onValueChange={(value) => updateFilter('selectedClass', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classes.map((classType) => (
                  <SelectItem key={classType} value={classType}>
                    {classType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Select
              value={filters.selectedLocation || 'all'}
              onValueChange={(value) => updateFilter('selectedLocation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Day of Week */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Day of Week
            </Label>
            <Select
              value={filters.selectedDayOfWeek || 'all'}
              onValueChange={(value) => updateFilter('selectedDayOfWeek', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All days</SelectItem>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Period
            </Label>
            <Select
              value={filters.selectedPeriod || 'all'}
              onValueChange={(value) => updateFilter('selectedPeriod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All periods</SelectItem>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <DatePickerWithRange
              date={filters.dateRange}
              setDate={(dateRange) => updateFilter('dateRange', dateRange)}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  Search: {filters.searchTerm}
                  <button
                    onClick={() => updateFilter('searchTerm', '')}
                    className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.selectedTrainer && filters.selectedTrainer !== 'all' && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  Trainer: {filters.selectedTrainer}
                  <button
                    onClick={() => updateFilter('selectedTrainer', 'all')}
                    className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.selectedClass && filters.selectedClass !== 'all' && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  Class: {filters.selectedClass}
                  <button
                    onClick={() => updateFilter('selectedClass', 'all')}
                    className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.selectedLocation && filters.selectedLocation !== 'all' && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  Location: {filters.selectedLocation}
                  <button
                    onClick={() => updateFilter('selectedLocation', 'all')}
                    className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDataFilters;
