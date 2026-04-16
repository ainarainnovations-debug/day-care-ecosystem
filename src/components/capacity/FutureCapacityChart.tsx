import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachWeekOfInterval, addWeeks } from 'date-fns';

interface PendingEnrollment {
  id: string;
  first_name: string;
  last_name: string;
  classroom_id: string;
  enrollment_start_date: string;
  schedule_type: string;
}

interface WeeklyProjection {
  weekStart: Date;
  weekEnd: Date;
  classroomProjections: Record<string, {
    current: number;
    pending: number;
    total: number;
    capacity: number;
    available: number;
    utilization: number;
    status: 'safe' | 'warning' | 'critical';
  }>;
}

interface FutureCapacityChartProps {
  classrooms: Array<{
    id: string;
    name: string;
    age_group: string;
    licensed_capacity: number;
    current_enrollment: number;
  }>;
}

export default function FutureCapacityChart({ classrooms }: FutureCapacityChartProps) {
  const [projections, setProjections] = useState<WeeklyProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [weeksToShow, setWeeksToShow] = useState(12);

  useEffect(() => {
    fetchFutureProjections();
  }, [classrooms, weeksToShow]);

  const fetchFutureProjections = async () => {
    try {
      setLoading(true);

      // Get all pending enrollments (future start dates)
      const { data: pendingData, error } = await supabase
        .from('children')
        .select('id, first_name, last_name, classroom_id, enrollment_start_date, schedule_type')
        .eq('enrollment_status', 'pending')
        .gte('enrollment_start_date', new Date().toISOString().split('T')[0])
        .lte('enrollment_start_date', addWeeks(new Date(), weeksToShow).toISOString().split('T')[0]);

      if (error) throw error;

      const pendingEnrollments = pendingData as PendingEnrollment[] || [];

      // Generate weekly projections
      const weeks = eachWeekOfInterval({
        start: new Date(),
        end: addWeeks(new Date(), weeksToShow)
      });

      const weeklyProjections: WeeklyProjection[] = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart);
        
        const classroomProjections: Record<string, any> = {};

        classrooms.forEach((classroom) => {
          // Count pending enrollments that start during this week
          const pendingForWeek = pendingEnrollments.filter((enrollment) => {
            const startDate = new Date(enrollment.enrollment_start_date);
            return enrollment.classroom_id === classroom.id &&
                   startDate >= weekStart &&
                   startDate <= weekEnd;
          }).length;

          // Count all enrollments that will have started by end of this week
          const cumulativePending = pendingEnrollments.filter((enrollment) => {
            const startDate = new Date(enrollment.enrollment_start_date);
            return enrollment.classroom_id === classroom.id &&
                   startDate <= weekEnd;
          }).length;

          const currentEnrollment = classroom.current_enrollment;
          const projectedTotal = currentEnrollment + cumulativePending;
          const available = Math.max(0, classroom.licensed_capacity - projectedTotal);
          const utilization = classroom.licensed_capacity > 0
            ? (projectedTotal / classroom.licensed_capacity) * 100
            : 0;

          let status: 'safe' | 'warning' | 'critical' = 'safe';
          if (utilization >= 100) status = 'critical';
          else if (utilization >= 90) status = 'warning';

          classroomProjections[classroom.id] = {
            current: currentEnrollment,
            pending: cumulativePending,
            total: projectedTotal,
            capacity: classroom.licensed_capacity,
            available,
            utilization,
            status
          };
        });

        return {
          weekStart,
          weekEnd,
          classroomProjections
        };
      });

      setProjections(weeklyProjections);

    } catch (error) {
      console.error('Error fetching future projections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'critical') return 'bg-red-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'critical') return <Badge variant="destructive">At Capacity</Badge>;
    if (status === 'warning') return <Badge className="bg-yellow-500">Near Capacity</Badge>;
    return <Badge className="bg-green-500">Available</Badge>;
  };

  const filteredClassrooms = selectedClassroom === 'all' 
    ? classrooms 
    : classrooms.filter(c => c.id === selectedClassroom);

  if (loading) {
    return <div className="text-center py-8">Loading projections...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Future Capacity Projection</h3>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Classroom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classrooms</SelectItem>
              {classrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={weeksToShow.toString()} onValueChange={(val) => setWeeksToShow(parseInt(val))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 Weeks</SelectItem>
              <SelectItem value="8">8 Weeks</SelectItem>
              <SelectItem value="12">12 Weeks</SelectItem>
              <SelectItem value="26">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          This projection shows when classrooms will reach capacity based on <strong>pending enrollments</strong> with future start dates.
          Use this to plan staffing, prevent overbooking, and identify when to start actively recruiting for specific age groups.
        </AlertDescription>
      </Alert>

      {/* Timeline View */}
      <div className="space-y-3">
        {filteredClassrooms.map((classroom) => (
          <Card key={classroom.id} className="p-6">
            <div className="space-y-4">
              
              {/* Classroom Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{classroom.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {classroom.age_group.replace('-', ' ')} • Licensed Capacity: {classroom.licensed_capacity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Enrollment</p>
                  <p className="text-2xl font-bold text-gray-900">{classroom.current_enrollment}</p>
                </div>
              </div>

              {/* Weekly Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {projections.map((projection, idx) => {
                  const data = projection.classroomProjections[classroom.id];
                  if (!data) return null;

                  const isCurrentWeek = idx === 0;

                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-lg p-4 ${isCurrentWeek ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="space-y-2">
                        
                        {/* Week Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-600">
                              {format(projection.weekStart, 'MMM d')} - {format(projection.weekEnd, 'MMM d')}
                            </p>
                            {isCurrentWeek && (
                              <Badge variant="outline" className="mt-1 text-xs">This Week</Badge>
                            )}
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(data.status)}`} />
                        </div>

                        {/* Capacity Numbers */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Current:</span>
                            <span className="font-semibold">{data.current}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">+ Pending:</span>
                            <span className="font-semibold text-blue-600">+{data.pending}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-1 border-t">
                            <span className="text-gray-700 font-medium">Projected:</span>
                            <span className="font-bold">{data.total} / {data.capacity}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="pt-2">
                          {getStatusBadge(data.status)}
                          <p className="text-xs text-gray-600 mt-1">
                            {data.available} spots available
                          </p>
                          <p className="text-xs text-gray-500">
                            {data.utilization.toFixed(0)}% utilized
                          </p>
                        </div>

                        {/* Warnings */}
                        {data.status === 'critical' && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertTriangle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              Will be at capacity!
                            </AlertDescription>
                          </Alert>
                        )}
                        {data.status === 'warning' && (
                          <Alert className="mt-2 bg-yellow-50 border-yellow-200">
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                            <AlertDescription className="text-xs text-yellow-800">
                              Approaching capacity
                            </AlertDescription>
                          </Alert>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </Card>
        ))}
      </div>

      {/* Summary Insights */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900">Capacity Planning Insights</h4>
            <div className="space-y-1 text-sm text-blue-800">
              {projections.map((projection, idx) => {
                const criticalRooms = Object.entries(projection.classroomProjections)
                  .filter(([_, data]) => data.status === 'critical')
                  .map(([id, _]) => classrooms.find(c => c.id === id)?.name)
                  .filter(Boolean);

                if (criticalRooms.length > 0 && idx < 8) {
                  return (
                    <p key={idx}>
                      • Week of <strong>{format(projection.weekStart, 'MMM d')}</strong>: 
                      {criticalRooms.join(', ')} will be at capacity
                    </p>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
