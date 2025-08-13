
import React, { useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, MapPin, Users, TrendingUp, DollarSign, Target, Award, User } from 'lucide-react';

interface ClassDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ProcessedData[];
  className: string;
}

const ClassDrillDownModal: React.FC<ClassDrillDownModalProps> = ({ 
  isOpen, 
  onClose, 
  classData, 
  className 
}) => {
  const analytics = useMemo(() => {
    if (!classData.length) return null;

    // Sort by date (most recent first)
    const sortedClasses = [...classData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Summary stats
    const totalCheckins = classData.reduce((sum, item) => sum + Number(item.totalCheckins), 0);
    const totalRevenue = classData.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
    const totalClasses = classData.length;
    const avgAttendance = totalClasses > 0 ? totalCheckins / totalClasses : 0;

    // Group by trainer for trainer tab
    const trainerClasses = classData.reduce((acc, item) => {
      if (!acc[item.teacherName]) {
        acc[item.teacherName] = [];
      }
      acc[item.teacherName].push(item);
      return acc;
    }, {} as Record<string, ProcessedData[]>);

    // Group by location for location tab
    const locationClasses = classData.reduce((acc, item) => {
      if (!acc[item.location]) {
        acc[item.location] = [];
      }
      acc[item.location].push(item);
      return acc;
    }, {} as Record<string, ProcessedData[]>);

    // Group by time for schedule tab
    const timeClasses = classData.reduce((acc, item) => {
      if (!acc[item.classTime]) {
        acc[item.classTime] = [];
      }
      acc[item.classTime].push(item);
      return acc;
    }, {} as Record<string, ProcessedData[]>);

    return {
      summary: {
        totalCheckins,
        totalRevenue,
        totalClasses,
        avgAttendance,
        uniqueTrainers: new Set(classData.map(item => item.teacherName)).size,
        uniqueLocations: new Set(classData.map(item => item.location)).size
      },
      allClasses: sortedClasses,
      trainerClasses,
      locationClasses,
      timeClasses
    };
  }, [classData]);

  if (!analytics) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const ClassTable = ({ classes, showTrainer = true, showLocation = true, showTime = true }: { 
    classes: ProcessedData[], 
    showTrainer?: boolean, 
    showLocation?: boolean, 
    showTime?: boolean 
  }) => (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {showTrainer && <TableHead>Trainer</TableHead>}
            {showTime && <TableHead>Time</TableHead>}
            {showLocation && <TableHead>Location</TableHead>}
            <TableHead className="text-right">Attendance</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((classItem, index) => (
            <TableRow key={index} className="hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-medium">{new Date(classItem.date).toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">{classItem.dayOfWeek}</div>
                </div>
              </TableCell>
              {showTrainer && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(classItem.teacherName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{classItem.teacherName}</span>
                  </div>
                </TableCell>
              )}
              {showTime && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{classItem.classTime}</span>
                  </div>
                </TableCell>
              )}
              {showLocation && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{classItem.location}</span>
                  </div>
                </TableCell>
              )}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Users className="h-3 w-3 text-blue-600" />
                  <span className="font-medium">{classItem.totalCheckins}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-medium text-green-600">
                  {formatIndianCurrency(Number(classItem.totalRevenue))}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-primary" />
            {className} - Individual Class Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.summary.totalCheckins}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Total Check-ins</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold text-green-900 dark:text-green-100">{formatIndianCurrency(analytics.summary.totalRevenue)}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Total Revenue</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analytics.summary.totalClasses}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Total Classes</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{analytics.summary.avgAttendance.toFixed(1)}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Avg Attendance</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200">
              <CardContent className="p-4 text-center">
                <User className="h-6 w-6 mx-auto mb-2 text-pink-600" />
                <div className="text-2xl font-bold text-pink-900 dark:text-pink-100">{analytics.summary.uniqueTrainers}</div>
                <div className="text-xs text-pink-700 dark:text-pink-300">Trainers</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200">
              <CardContent className="p-4 text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-teal-600" />
                <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{analytics.summary.uniqueLocations}</div>
                <div className="text-xs text-teal-700 dark:text-teal-300">Locations</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-muted/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-background">All Classes</TabsTrigger>
              <TabsTrigger value="trainers" className="data-[state=active]:bg-background">By Trainer</TabsTrigger>
              <TabsTrigger value="locations" className="data-[state=active]:bg-background">By Location</TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-background">By Time</TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-background">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    All Individual Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClassTable classes={analytics.allClasses} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trainers" className="space-y-4">
              {Object.entries(analytics.trainerClasses).map(([trainerName, classes]) => (
                <Card key={trainerName} className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {trainerName} ({classes.length} classes)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ClassTable classes={classes} showTrainer={false} />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="locations" className="space-y-4">
              {Object.entries(analytics.locationClasses).map(([location, classes]) => (
                <Card key={location} className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {location} ({classes.length} classes)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ClassTable classes={classes} showLocation={false} />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              {Object.entries(analytics.timeClasses).map(([time, classes]) => (
                <Card key={time} className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {time} ({classes.length} classes)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ClassTable classes={classes} showTime={false} />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Performing Classes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {[...analytics.allClasses]
                          .sort((a, b) => Number(b.totalCheckins) - Number(a.totalCheckins))
                          .slice(0, 10)
                          .map((classItem, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                              <div>
                                <div className="font-medium">{new Date(classItem.date).toLocaleDateString()}</div>
                                <div className="text-sm text-muted-foreground">
                                  {classItem.teacherName} • {classItem.location}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600">{classItem.totalCheckins} attendees</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatIndianCurrency(Number(classItem.totalRevenue))}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Classes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {analytics.allClasses.slice(0, 10).map((classItem, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                            <div>
                              <div className="font-medium">{new Date(classItem.date).toLocaleDateString()}</div>
                              <div className="text-sm text-muted-foreground">
                                {classItem.teacherName} • {classItem.classTime}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{classItem.totalCheckins} attendees</div>
                              <div className="text-sm text-muted-foreground">
                                {formatIndianCurrency(Number(classItem.totalRevenue))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDrillDownModal;
