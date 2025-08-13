
import React, { useMemo, useState } from 'react';
import { ProcessedData } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatIndianCurrency } from './MetricsPanel';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, BarChart3, Eye } from 'lucide-react';
import ClassDrillDownModal from './analytics/ClassDrillDownModal';

interface TopBottomClassesProps {
  data: ProcessedData[];
}

const TopBottomClasses: React.FC<TopBottomClassesProps> = ({ data }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<ProcessedData[]>([]);

  const classStats = useMemo(() => {
    // Group by class name and aggregate data
    const classGroups = data.reduce((acc, item) => {
      const className = item.cleanedClass;
      if (!acc[className]) {
        acc[className] = {
          className,
          totalCheckins: 0,
          totalRevenue: 0,
          totalClasses: 0,
          classes: []
        };
      }
      
      acc[className].totalCheckins += Number(item.totalCheckins) || 0;
      acc[className].totalRevenue += Number(item.totalRevenue) || 0;
      acc[className].totalClasses += 1;
      acc[className].classes.push(item);
      
      return acc;
    }, {} as Record<string, {
      className: string;
      totalCheckins: number;
      totalRevenue: number;
      totalClasses: number;
      classes: ProcessedData[];
    }>);

    const classArray = Object.values(classGroups);

    // Sort by different metrics
    const topByAttendance = [...classArray]
      .sort((a, b) => b.totalCheckins - a.totalCheckins)
      .slice(0, 5);

    const bottomByAttendance = [...classArray]
      .sort((a, b) => a.totalCheckins - b.totalCheckins)
      .slice(0, 5);

    const topByRevenue = [...classArray]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    const bottomByRevenue = [...classArray]
      .sort((a, b) => a.totalRevenue - b.totalRevenue)
      .slice(0, 5);

    const topByClassCount = [...classArray]
      .sort((a, b) => b.totalClasses - a.totalClasses)
      .slice(0, 5);

    const bottomByClassCount = [...classArray]
      .sort((a, b) => a.totalClasses - b.totalClasses)
      .slice(0, 5);

    return {
      topByAttendance,
      bottomByAttendance,
      topByRevenue,
      bottomByRevenue,
      topByClassCount,
      bottomByClassCount,
      classGroups
    };
  }, [data]);

  const handleClassDrillDown = (className: string) => {
    const classData = classStats.classGroups[className]?.classes || [];
    setSelectedClass(className);
    setDrillDownData(classData);
  };

  const ClassCard = ({ 
    classData, 
    rank, 
    metric, 
    isTop = true 
  }: { 
    classData: any; 
    rank: number; 
    metric: 'attendance' | 'revenue' | 'classes';
    isTop?: boolean;
  }) => {
    const getMetricValue = () => {
      switch (metric) {
        case 'attendance':
          return classData.totalCheckins;
        case 'revenue':
          return formatIndianCurrency(classData.totalRevenue);
        case 'classes':
          return classData.totalClasses;
      }
    };

    const getMetricIcon = () => {
      switch (metric) {
        case 'attendance':
          return <Users className="h-4 w-4" />;
        case 'revenue':
          return <DollarSign className="h-4 w-4" />;
        case 'classes':
          return <Calendar className="h-4 w-4" />;
      }
    };

    const getGradientClass = () => {
      if (isTop) {
        switch (rank) {
          case 1:
            return 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950 dark:to-amber-900 border-yellow-200';
          case 2:
            return 'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-800 border-gray-200';
          case 3:
            return 'bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-900 border-orange-200';
          default:
            return 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200';
        }
      } else {
        return 'bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-pink-900 border-red-200';
      }
    };

    return (
      <Card className={`transition-all duration-300 hover:shadow-lg hover:scale-105 ${getGradientClass()}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                isTop 
                  ? rank === 1 
                    ? 'bg-yellow-500 text-white' 
                    : rank === 2 
                    ? 'bg-gray-400 text-white'
                    : rank === 3
                    ? 'bg-orange-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {rank}
              </div>
              {isTop ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClassDrillDown(classData.className)}
              className="h-8 w-8 p-0 hover:bg-background/50"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm leading-tight">{classData.className}</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                {getMetricIcon()}
                <span className="text-xs">
                  {metric === 'attendance' ? 'Total Attendance' : 
                   metric === 'revenue' ? 'Total Revenue' : 
                   'Total Classes'}
                </span>
              </div>
              <Badge 
                variant="secondary" 
                className={`font-bold ${
                  isTop ? 'bg-background/50 text-foreground' : 'bg-background/50 text-foreground'
                }`}
              >
                {getMetricValue()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{classData.totalCheckins}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{classData.totalClasses}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/30">
              <div className="text-xs text-muted-foreground">
                Avg: {(classData.totalCheckins / classData.totalClasses).toFixed(1)} per class
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Class Performance Rankings
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Based on {data.length} classes from your filtered data
          </p>
        </div>
        <Badge variant="outline" className="bg-muted/50">
          {Object.keys(classStats.classGroups).length} Unique Classes
        </Badge>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="attendance" className="data-[state=active]:bg-background">
            <Users className="w-4 h-4 mr-2" />
            By Attendance
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-background">
            <DollarSign className="w-4 h-4 mr-2" />
            By Revenue
          </TabsTrigger>
          <TabsTrigger value="classes" className="data-[state=active]:bg-background">
            <Calendar className="w-4 h-4 mr-2" />
            By Class Count
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Classes by Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classStats.topByAttendance.map((classData, index) => (
                  <ClassCard
                    key={classData.className}
                    classData={classData}
                    rank={index + 1}
                    metric="attendance"
                    isTop={true}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Bottom Classes by Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classStats.bottomByAttendance.map((classData, index) => (
                  <ClassCard
                    key={classData.className}
                    classData={classData}
                    rank={index + 1}
                    metric="attendance"
                    isTop={false}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Classes by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classStats.topByRevenue.map((classData, index) => (
                  <ClassCard
                    key={classData.className}
                    classData={classData}
                    rank={index + 1}
                    metric="revenue"
                    isTop={true}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Bottom Classes by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classStats.bottomByRevenue.map((classData, index) => (
                  <ClassCard
                    key={classData.className}
                    classData={classData}
                    rank={index + 1}
                    metric="revenue"
                    isTop={false}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Most Frequent Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classStats.topByClassCount.map((classData, index) => (
                  <ClassCard
                    key={classData.className}
                    classData={classData}
                    rank={index + 1}
                    metric="classes"
                    isTop={true}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Least Frequent Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classStats.bottomByClassCount.map((classData, index) => (
                  <ClassCard
                    key={classData.className}
                    classData={classData}
                    rank={index + 1}
                    metric="classes"
                    isTop={false}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ClassDrillDownModal
        isOpen={!!selectedClass}
        onClose={() => {
          setSelectedClass(null);
          setDrillDownData([]);
        }}
        classData={drillDownData}
        className={selectedClass || ''}
      />
    </div>
  );
};

export default TopBottomClasses;
