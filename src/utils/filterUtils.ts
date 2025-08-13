
import { ProcessedData } from '@/types/data';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';

export interface FilterOptions {
  searchTerm?: string;
  selectedTrainer?: string;
  selectedClass?: string;
  selectedLocation?: string;
  selectedDayOfWeek?: string;
  selectedPeriod?: string;
  dateRange?: DateRange;
}

export function getUniqueValues(data: ProcessedData[], field: keyof ProcessedData): string[] {
  const values = data.map(item => String(item[field])).filter(Boolean);
  return Array.from(new Set(values)).sort();
}

export function applyFilters(data: ProcessedData[], filters: FilterOptions): ProcessedData[] {
  if (!data || data.length === 0) return [];
  
  return data.filter(item => {
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const searchableText = `${item.teacherName} ${item.cleanedClass} ${item.location}`.toLowerCase();
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    // Trainer filter
    if (filters.selectedTrainer && filters.selectedTrainer !== 'all') {
      if (item.teacherName !== filters.selectedTrainer) {
        return false;
      }
    }

    // Class filter
    if (filters.selectedClass && filters.selectedClass !== 'all') {
      if (item.cleanedClass !== filters.selectedClass) {
        return false;
      }
    }

    // Location filter
    if (filters.selectedLocation && filters.selectedLocation !== 'all') {
      if (item.location !== filters.selectedLocation) {
        return false;
      }
    }

    // Day of week filter
    if (filters.selectedDayOfWeek && filters.selectedDayOfWeek !== 'all') {
      if (item.dayOfWeek !== filters.selectedDayOfWeek) {
        return false;
      }
    }

    // Period filter
    if (filters.selectedPeriod && filters.selectedPeriod !== 'all') {
      if (item.period !== filters.selectedPeriod) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      try {
        const itemDate = parseISO(item.date);
        
        if (filters.dateRange.from && filters.dateRange.to) {
          // Both dates specified
          if (!isWithinInterval(itemDate, { start: filters.dateRange.from, end: filters.dateRange.to })) {
            return false;
          }
        } else if (filters.dateRange.from) {
          // Only start date specified
          if (itemDate < filters.dateRange.from) {
            return false;
          }
        } else if (filters.dateRange.to) {
          // Only end date specified
          if (itemDate > filters.dateRange.to) {
            return false;
          }
        }
      } catch (error) {
        console.warn('Error parsing date for filtering:', item.date, error);
        // If date parsing fails, exclude the item
        return false;
      }
    }

    return true;
  });
}
