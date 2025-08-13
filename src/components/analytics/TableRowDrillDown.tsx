
import React, { useState } from 'react';
import { ProcessedData } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import { ChevronDown, ChevronUp, TrendingUp, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TableRowDrillDownProps {
  rowData: ProcessedData;
  relatedData: ProcessedData[];
}

const TableRowDrillDown: React.FC<TableRowDrillDownProps> = ({ rowData, relatedData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find related classes for this specific class type and trainer
  const relatedClasses = relatedData.filter(item => 
    item.cleanedClass === rowData.cleanedClass && 
    item.teacherName === rowData.teacherName
  );

  // Performance metrics
  const totalCheckins = relatedClasses.reduce((sum, item) => sum + Number(item.totalCheckins), 0);
  const totalRevenue = relatedClasses.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
  const avgAttendance = relatedClasses.length > 0 ? totalCheckins / relatedClasses.length : 0;

  // Monthly trend data
  const monthlyTrend = relatedClasses.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = { month, checkins: 0, revenue: 0 };
    }
    acc[month].checkins += Number(item.totalCheckins);
    acc[month].revenue += Number(item.totalRevenue);
    return acc;
  }, {} as Record<string, any>);

  const trendData = Object.values(monthlyTrend).slice(-6); // Last 6 months

  return (
    <div className="border-t border-gray-200">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between p-4 hover:bg-gray-50"
      >
        <span className="text-sm font-medium">View Detailed Analytics</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-3 text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-bold">{totalCheckins}</div>
                <div className="text-xs text-muted-foreground">Total Check-ins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <div className="text-lg font-bold">{avgAttendance.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Attendance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <div className="text-lg font-bold">{relatedClasses.length}</div>
                <div className="text-xs text-muted-foreground">Total Classes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-sm font-bold">{formatIndianCurrency(totalRevenue)}</div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          {trendData.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance Trend (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="checkins" fill="#26B5C0" name="Check-ins" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Class Schedule Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Class Schedule Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {relatedClasses.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm border rounded p-2">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {item.dayOfWeek}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.classTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.totalCheckins} attendees</div>
                      <div className="text-xs text-muted-foreground">
                        {formatIndianCurrency(Number(item.totalRevenue))}
                      </div>
                    </div>
                  </div>
                ))}
                {relatedClasses.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    +{relatedClasses.length - 5} more classes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TableRowDrillDown;
