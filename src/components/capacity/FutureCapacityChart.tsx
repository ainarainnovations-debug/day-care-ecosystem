import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { format, eachWeekOfInterval, endOfWeek, addWeeks } from 'date-fns';

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
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [weeksToShow, setWeeksToShow] = useState(12);

  const projections = useMemo(() => {
    const weeks = eachWeekOfInterval({
      start: new Date(),
      end: addWeeks(new Date(), weeksToShow)
    });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const classroomProjections: Record<string, any> = {};

      classrooms.forEach((classroom) => {
        // Simulate gradual enrollment growth
        const weekIdx = weeks.indexOf(weekStart);
        const pendingGrowth = Math.floor(weekIdx * 0.3);
        const projectedTotal = classroom.current_enrollment + pendingGrowth;
        const available = Math.max(0, classroom.licensed_capacity - projectedTotal);
        const utilization = classroom.licensed_capacity > 0
          ? (projectedTotal / classroom.licensed_capacity) * 100 : 0;

        let status: 'safe' | 'warning' | 'critical' = 'safe';
        if (utilization >= 100) status = 'critical';
        else if (utilization >= 90) status = 'warning';

        classroomProjections[classroom.id] = {
          current: classroom.current_enrollment,
          pending: pendingGrowth,
          total: Math.min(projectedTotal, classroom.licensed_capacity),
          capacity: classroom.licensed_capacity,
          available,
          utilization: Math.min(utilization, 100),
          status
        };
      });

      return { weekStart, weekEnd, classroomProjections };
    });
  }, [classrooms, weeksToShow]);

  const getStatusColor = (status: string) => {
    if (status === 'critical') return 'bg-destructive';
    if (status === 'warning') return 'bg-secondary';
    return 'bg-accent';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'critical') return <Badge variant="destructive">At Capacity</Badge>;
    if (status === 'warning') return <Badge className="bg-secondary text-foreground">Near Capacity</Badge>;
    return <Badge className="bg-accent text-accent-foreground">Available</Badge>;
  };

  const filteredClassrooms = selectedClassroom === 'all'
    ? classrooms
    : classrooms.filter(c => c.id === selectedClassroom);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Future Capacity Projection</h3>
        </div>
        <div className="flex gap-3">
          <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Classroom" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classrooms</SelectItem>
              {classrooms.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={weeksToShow.toString()} onValueChange={(val) => setWeeksToShow(parseInt(val))}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 Weeks</SelectItem>
              <SelectItem value="8">8 Weeks</SelectItem>
              <SelectItem value="12">12 Weeks</SelectItem>
              <SelectItem value="26">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          Projected capacity based on current enrollment trends. Use this to plan staffing and prevent overbooking.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {filteredClassrooms.map((classroom) => (
          <Card key={classroom.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-foreground">{classroom.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {classroom.age_group.replace('-', ' ')} • Capacity: {classroom.licensed_capacity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-2xl font-bold text-foreground">{classroom.current_enrollment}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {projections.slice(0, 8).map((projection, idx) => {
                  const data = projection.classroomProjections[classroom.id];
                  if (!data) return null;
                  return (
                    <div key={idx} className={`border rounded-lg p-4 ${idx === 0 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {format(projection.weekStart, 'MMM d')} - {format(projection.weekEnd, 'MMM d')}
                            </p>
                            {idx === 0 && <Badge variant="outline" className="mt-1 text-xs">This Week</Badge>}
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(data.status)}`} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Projected:</span>
                            <span className="font-bold">{data.total} / {data.capacity}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          {getStatusBadge(data.status)}
                          <p className="text-xs text-muted-foreground mt-1">{data.available} spots available</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
