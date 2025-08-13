
import React, { useState, useEffect } from 'react';
import { ProcessedData, ViewMode, FilterOption, SortOption } from '@/types/data';
import ViewSwitcherWrapper from './ViewSwitcherWrapper';
import { DataTable } from '@/components/DataTable';
import MetricsPanel from '@/components/MetricsPanel';
import ChartPanel from '@/components/ChartPanel';
import TopBottomClasses from '@/components/TopBottomClasses';
import GridView from '@/components/views/GridView';
import KanbanView from '@/components/views/KanbanView';
import TimelineView from '@/components/views/TimelineView';
import PivotView from '@/components/views/PivotView';
import TrainerComparisonView from '@/components/TrainerComparisonView';
import LocationComparisonView from '@/components/comparisons/LocationComparisonView';
import ClassComparisonView from '@/components/comparisons/ClassComparisonView';
import TimeComparisonView from '@/components/comparisons/TimeComparisonView';
import PivotTableConfiguration from '@/components/PivotTableConfiguration';
import EnhancedDataFilters from '@/components/EnhancedDataFilters';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { exportToCSV } from '@/utils/fileProcessing';
import { FilterOptions, applyFilters } from '@/utils/filterUtils';
import { 
  Download, 
  RefreshCw, 
  FileText,
  FileSpreadsheet,
  FileJson,
  Users,
  MapPin,
  Clock,
  BookOpen,
  Settings,
  Filter,
  X
} from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface DashboardProps {
  data: ProcessedData[];
  loading: boolean;
  progress: number;
  onReset: () => void;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  onLogout: () => void;
}

export const trainerAvatars: Record<string, string> = {
  "Siddhartha Kusuma": "https://i.imgur.com/XE0p6mW.jpg",
  "Shruti Suresh": "https://i.imgur.com/dBuz7oK.jpg",
  "Poojitha Bhaskar": "https://i.imgur.com/dvPLVXg.jpg",
  "Pushyank Nahar": "https://i.imgur.com/aHAJw6U.jpg",
  "Shruti Kulkarni": "https://i.imgur.com/CW2ZOUy.jpg",
  "Karan Bhatia": "https://i.imgur.com/y6d1H2z.jpg",
  "Pranjali Jain": "https://i.imgur.com/Hx8hTAk.jpg",
  "Anisha Shah": "https://i.imgur.com/7GM2oPn.jpg",
  "Saniya Jaiswal": "https://i.imgur.com/EP32RoZ.jpg",
  "Vivaran Dhasmana": "https://i.imgur.com/HGrGuq9.jpg",
  "Kajol Kanchan": "https://i.imgur.com/v9x0pFa.jpg"
};

const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  loading, 
  progress, 
  onReset,
  viewMode,
  setViewMode,
  onLogout
}) => {
  const { toast } = useToast();
  const [filteredData, setFilteredData] = useState<ProcessedData[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [activeComparisonTab, setActiveComparisonTab] = useState('trainers');
  const [savedPivotConfigs, setSavedPivotConfigs] = useState<any[]>([]);
  const [showPivotConfig, setShowPivotConfig] = useState(false);

  // Apply filters effect
  useEffect(() => {
    if (!data.length) return;
    const result = applyFilters(data, filters);
    setFilteredData(result);
  }, [data, filters]);

  // Load saved pivot configurations from localStorage on component mount
  useEffect(() => {
    const savedConfigs = localStorage.getItem('pivotConfigs');
    if (savedConfigs) {
      try {
        setSavedPivotConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error('Error loading saved pivot configurations:', error);
      }
    }
  }, []);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    if (format === 'csv') {
      exportToCSV(filteredData);
    } else if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "class_data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else if (format === 'excel') {
      exportToCSV(filteredData);
    }
  };
  
  const clearFilters = () => {
    setFilters({});
  };

  const handleSavePivotConfig = (config: any) => {
    const newConfigs = [...savedPivotConfigs, config];
    setSavedPivotConfigs(newConfigs);
    localStorage.setItem('pivotConfigs', JSON.stringify(newConfigs));
    toast({
      title: "Configuration Saved",
      description: "Your pivot table configuration has been saved."
    });
  };

  const handleDeletePivotConfig = (index: number) => {
    const newConfigs = savedPivotConfigs.filter((_, i) => i !== index);
    setSavedPivotConfigs(newConfigs);
    localStorage.setItem('pivotConfigs', JSON.stringify(newConfigs));
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-12 min-h-[60vh]">
        <h2 className="text-2xl font-semibold">Processing Data</h2>
        <ProgressBar progress={progress} />
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Analyzed 
            <span className="text-primary mx-1">
              <CountUp 
                end={data.length} 
                decimals={0}
              />
            </span> 
            records so far
          </p>
          <p className="text-sm text-muted-foreground">Please wait while we process your file...</p>
        </div>
      </div>
    );
  }

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-6 animate-fade-in bg-gradient-to-b from-background via-background to-muted/20 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.img 
              src="https://i.imgur.com/9mOm7gP.png" 
              alt="Logo" 
              className="h-10 w-auto"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Class Analytics Dashboard
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{filteredData.length} Classes</span>
                {activeFilterCount > 0 && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="h-5 px-2 text-xs">
                      {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={onReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Upload New
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export for Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" onClick={() => setShowPivotConfig(true)} className="hidden md:flex">
              <Settings className="mr-2 h-4 w-4" />
              Customize
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Enhanced Filters */}
        <EnhancedDataFilters 
          data={data} 
          filters={filters} 
          onFiltersChange={handleFiltersChange} 
        />

        {/* Metrics Panel */}
        <MetricsPanel data={filteredData} />
        
        {/* Top/Bottom Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-3 border-border/50 shadow-lg bg-gradient-to-br from-background to-muted/30">
            <CardContent className="p-6">
              <TopBottomClasses data={filteredData} />
            </CardContent>
          </Card>
        </div>
        
        {/* Comparison Analysis */}
        <div className="mb-6">
          <Card className="border-border/50 shadow-lg bg-gradient-to-br from-background to-muted/30">
            <CardContent className="p-6">
              <Tabs defaultValue="trainers" value={activeComparisonTab} onValueChange={setActiveComparisonTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Comparison Analysis
                  </h2>
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="trainers" className="data-[state=active]:bg-background">
                      <Users className="w-4 h-4 mr-2" />
                      Trainers
                    </TabsTrigger>
                    <TabsTrigger value="locations" className="data-[state=active]:bg-background">
                      <MapPin className="w-4 h-4 mr-2" />
                      Locations
                    </TabsTrigger>
                    <TabsTrigger value="classes" className="data-[state=active]:bg-background">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Classes
                    </TabsTrigger>
                    <TabsTrigger value="time" className="data-[state=active]:bg-background">
                      <Clock className="w-4 h-4 mr-2" />
                      Time & Day
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="trainers" className="mt-0">
                  <TrainerComparisonView data={filteredData} trainerAvatars={trainerAvatars} />
                </TabsContent>
                
                <TabsContent value="locations" className="mt-0">
                  <LocationComparisonView data={filteredData} />
                </TabsContent>
                
                <TabsContent value="classes" className="mt-0">
                  <ClassComparisonView data={filteredData} />
                </TabsContent>
                
                <TabsContent value="time" className="mt-0">
                  <TimeComparisonView data={filteredData} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* View Switcher */}
        <ViewSwitcherWrapper viewMode={viewMode} setViewMode={setViewMode} />

        {/* Data Views */}
        <div className="bg-background border border-border/50 rounded-xl shadow-lg mb-6 overflow-hidden">
          {viewMode === 'table' && <DataTable data={filteredData} trainerAvatars={trainerAvatars} />}
          {viewMode === 'grid' && <GridView data={filteredData} trainerAvatars={trainerAvatars} />}
          {viewMode === 'kanban' && <KanbanView data={filteredData} trainerAvatars={trainerAvatars} />}
          {viewMode === 'timeline' && <TimelineView data={filteredData} trainerAvatars={trainerAvatars} />}
          {viewMode === 'pivot' && <PivotView data={filteredData} trainerAvatars={trainerAvatars} />}
        </div>
        
        {/* Chart Panel */}
        <ChartPanel data={filteredData} />
      </div>

      {/* Pivot Configuration Dialog */}
      {showPivotConfig && (
        <Dialog open={showPivotConfig} onOpenChange={setShowPivotConfig}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Dashboard Customization</DialogTitle>
            </DialogHeader>
            <PivotTableConfiguration 
              onSave={handleSavePivotConfig}
              onClose={() => setShowPivotConfig(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
