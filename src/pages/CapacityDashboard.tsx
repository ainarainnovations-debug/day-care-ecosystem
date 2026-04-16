import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, AlertCircle, Info, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Classroom {
  id: string;
  name: string;
  age_group: string;
  capacity: number;
  current_enrollment: number;
  min_age_months: number;
  max_age_months: number;
  is_active: boolean;
}

export default function CapacityDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCapacityData();
  }, []);

  const fetchCapacityData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch classrooms
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (classroomsError) throw classroomsError;

      setClassrooms(classroomsData || []);

    } catch (error) {
      console.error('Error fetching capacity data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load capacity data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getUtilization = (classroom: Classroom) => {
    if (classroom.capacity === 0) return 0;
    return (classroom.current_enrollment / classroom.capacity) * 100;
  };

  const getStatusColor = (classroom: Classroom) => {
    const available = classroom.capacity - classroom.current_enrollment;
    if (available === 0) return 'bg-red-500';
    if (available <= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (classroom: Classroom) => {
    const available = classroom.capacity - classroom.current_enrollment;
    if (available === 0) return <Badge variant="destructive">At Capacity</Badge>;
    if (available <= 2) return <Badge className="bg-yellow-500">Low Availability</Badge>;
    return <Badge className="bg-green-500">Available</Badge>;
  };

  const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);
  const totalEnrolled = classrooms.reduce((sum, c) => sum + c.current_enrollment, 0);
  const totalAvailable = totalCapacity - totalEnrolled;
  const overallUtilization = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Capacity Management</h1>
            <p className="text-gray-600">Real-time enrollment capacity monitoring</p>
          </div>
          <Button onClick={() => navigate('/provider/dashboard')} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Capacity Management System</strong> - This dashboard shows real-time enrollment capacity across all classrooms. 
            The full waitlist automation, ratio monitoring, and future projections are coming soon!
          </AlertDescription>
        </Alert>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollment</p>
                <p className="text-3xl font-bold text-gray-900">{totalEnrolled}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-3xl font-bold text-gray-900">{totalCapacity}</p>
              </div>
              <Users className="h-10 w-10 text-gray-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Spots</p>
                <p className="text-3xl font-bold text-gray-900">{totalAvailable}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilization Rate</p>
                <p className="text-3xl font-bold text-gray-900">{overallUtilization.toFixed(0)}%</p>
              </div>
              <Badge 
                variant={overallUtilization >= 95 ? 'destructive' : 'default'}
                className={overallUtilization >= 80 && overallUtilization < 95 ? 'bg-yellow-500' : ''}
              >
                {overallUtilization >= 95 ? 'At Capacity' : overallUtilization >= 80 ? 'High' : 'Available'}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Classrooms Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Classrooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((classroom) => {
              const utilization = getUtilization(classroom);
              const available = classroom.capacity - classroom.current_enrollment;

              return (
                <Card key={classroom.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {classroom.age_group.replace('-', ' ')}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(classroom)}`} />
                    </div>

                    {/* Capacity Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Capacity</span>
                        <span className="text-sm font-semibold">
                          {classroom.current_enrollment} / {classroom.capacity}
                        </span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{utilization.toFixed(0)}% utilized</span>
                        <span>{available} spots available</span>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Current Enrollment */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-900 font-medium">Enrolled</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                          {classroom.current_enrollment}
                        </p>
                      </div>

                      {/* Available Spots */}
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-900 font-medium">Available</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900">{available}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="pt-3 border-t">
                      {getStatusBadge(classroom)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/provider/dashboard`)}
                      >
                        View Details
                      </Button>
                      {available > 0 && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/provider/applications`)}
                        >
                          Enroll Child
                        </Button>
                      )}
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Section */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">Coming Soon: Advanced Features</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
              <div>
                <h4 className="font-semibold mb-2">✨ Live Tracking</h4>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Auto-count on enrollment - Instant spot decrement</li>
                  <li>Full = hard stop - Capacity enforcement with waitlist redirect</li>
                  <li>Check-in affects ratio - Real-time monitoring</li>
                  <li>Withdrawal releases spot - Automatic waitlist notification</li>
                  <li>Future capacity projection - Pending enrollment visibility</li>
                  <li>Scheduled absences - Spot protection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Waitlist Intelligence</h4>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Spot-open notification - Automated SMS/email alerts</li>
                  <li>Age-matched waitlist - Smart matching by age group</li>
                  <li>Classroom definition - Licensed capacity configuration</li>
                  <li>Ratio rules per room - State-compliant enforcement</li>
                  <li>Full-time vs part-time slots - Flexible scheduling</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
