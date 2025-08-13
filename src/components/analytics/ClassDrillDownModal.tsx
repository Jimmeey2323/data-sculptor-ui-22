
import React, { useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, MapPin, Users, TrendingUp, DollarSign, Target, Award } from 'lucide-react';

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

    // Monthly trend analysis
    const monthlyData = classData.reduce((acc, item) => {
      const month = new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, checkins: 0, revenue: 0, classes: 0 };
      }
      acc[month].checkins += Number(item.totalCheckins);
      acc[month].revenue += Number(item.totalRevenue);
      acc[month].classes += Number(item.totalOccurrences);
      return acc;
    }, {} as Record<string, any>);

    // Trainer performance
    const trainerData = classData.reduce((acc, item) => {
      if (!acc[item.teacherName]) {
        acc[item.teacherName] = { 
          name: item.teacherName, 
          checkins: 0, 
          revenue: 0, 
          classes: 0,
          avgAttendance: 0
        };
      }
      acc[item.teacherName].checkins += Number(item.totalCheckins);
      acc[item.teacherName].revenue += Number(item.totalRevenue);
      acc[item.teacherName].classes += Number(item.totalOccurrences);
      return acc;
    }, {} as Record<string, any>);

    // Calculate average attendance for trainers
    Object.values(trainerData).forEach((trainer: any) => {
      trainer.avgAttendance = trainer.classes > 0 ? trainer.checkins / trainer.classes : 0;
    });

    // Location performance
    const locationData = classData.reduce((acc, item) => {
      if (!acc[item.location]) {
        acc[item.location] = { location: item.location, checkins: 0, revenue: 0, classes: 0 };
      }
      acc[item.location].checkins += Number(item.totalCheckins);
      acc[item.location].revenue += Number(item.totalRevenue);
      acc[item.location].classes += Number(item.totalOccurrences);
      return acc;
    }, {} as Record<string, any>);

    // Time slot analysis
    const timeSlotData = classData.reduce((acc, item) => {
      if (!acc[item.classTime]) {
        acc[item.classTime] = { time: item.classTime, checkins: 0, revenue: 0, classes: 0 };
      }
      acc[item.classTime].checkins += Number(item.totalCheckins);
      acc[item.classTime].revenue += Number(item.totalRevenue);
      acc[item.classTime].classes += Number(item.totalOccurrences);
      return acc;
    }, {} as Record<string, any>);

    // Day of week analysis
    const dayData = classData.reduce((acc, item) => {
      if (!acc[item.dayOfWeek]) {
        acc[item.dayOfWeek] = { day: item.dayOfWeek, checkins: 0, revenue: 0, classes: 0 };
      }
      acc[item.dayOfWeek].checkins += Number(item.totalCheckins);
      acc[item.dayOfWeek].revenue += Number(item.totalRevenue);
      acc[item.dayOfWeek].classes += Number(item.totalOccurrences);
      return acc;
    }, {} as Record<string, any>);

    const totalCheckins = classData.reduce((sum, item) => sum + Number(item.totalCheckins), 0);
    const totalRevenue = classData.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
    const totalClasses = classData.reduce((sum, item) => sum + Number(item.totalOccurrences), 0);
    const avgAttendance = totalClasses > 0 ? totalCheckins / totalClasses : 0;

    return {
      summary: {
        totalCheckins,
        totalRevenue,
        totalClasses,
        avgAttendance,
        uniqueTrainers: new Set(classData.map(item => item.teacherName)).size,
        uniqueLocations: new Set(classData.map(item => item.location)).size
      },
      monthly: Object.values(monthlyData),
      trainers: Object.values(trainerData).sort((a: any, b: any) => b.checkins - a.checkins),
      locations: Object.values(locationData).sort((a: any, b: any) => b.checkins - a.checkins),
      timeSlots: Object.values(timeSlotData).sort((a: any, b: any) => b.checkins - a.checkins),
      days: Object.values(dayData)
    };
  }, [classData]);

  if (!analytics) return null;

  const COLORS = ['#26B5C0', '#88B48A', '#FF7D6B', '#9D8DF2', '#FFB347', '#A877B1', '#71AFE5', '#77DD77'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5" />
            {className} - Detailed Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{analytics.summary.totalCheckins.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Total Check-ins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold">{formatIndianCurrency(analytics.summary.totalRevenue)}</div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{analytics.summary.totalClasses}</div>
                <div className="text-xs text-muted-foreground">Total Classes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{analytics.summary.avgAttendance.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Attendance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{analytics.summary.uniqueTrainers}</div>
                <div className="text-xs text-muted-foreground">Trainers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold">{analytics.summary.uniqueLocations}</div>
                <div className="text-xs text-muted-foreground">Locations</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="trainers">Trainers</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="checkins" fill="#26B5C0" name="Check-ins" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FF7D6B" name="Revenue" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trainers" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trainer Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.trainers.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="checkins" fill="#26B5C0" name="Check-ins" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Trainers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analytics.trainers.slice(0, 5).map((trainer: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{trainer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {trainer.classes} classes • Avg: {trainer.avgAttendance.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{trainer.checkins}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatIndianCurrency(trainer.revenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="locations" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Location Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.locations}
                          dataKey="checkins"
                          nameKey="location"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => entry.location}
                        >
                          {analytics.locations.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analytics.locations.map((location: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <div>
                            <div className="font-medium">{location.location}</div>
                            <div className="text-sm text-muted-foreground">{location.classes} classes</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{location.checkins}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatIndianCurrency(location.revenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Time Slot</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.timeSlots}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="checkins" fill="#9D8DF2" name="Check-ins" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="checkins" fill="#88B48A" name="Check-ins" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDrillDownModal;
