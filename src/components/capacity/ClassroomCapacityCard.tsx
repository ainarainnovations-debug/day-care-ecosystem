import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClassroomCapacityCardProps {
  classroom: {
    id: string;
    name: string;
    age_group: string;
    licensed_capacity: number;
    current_enrollment: number;
    available_spots: number;
    pending_enrollments: number;
    waitlist_count: number;
    current_ratio: number;
    ratio_status: 'safe' | 'warning' | 'critical';
  };
}

export default function ClassroomCapacityCard({ classroom }: ClassroomCapacityCardProps) {
  const navigate = useNavigate();
  
  const utilization = classroom.licensed_capacity > 0
    ? (classroom.current_enrollment / classroom.licensed_capacity) * 100
    : 0;

  const getStatusColor = () => {
    if (classroom.available_spots === 0) return 'bg-red-500';
    if (classroom.available_spots <= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRatioColor = () => {
    if (classroom.ratio_status === 'critical') return 'text-red-600';
    if (classroom.ratio_status === 'warning') return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{classroom.age_group.replace('-', ' ')}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} title="Capacity status" />
        </div>

        {/* Capacity Stats */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Capacity</span>
            <span className="text-sm font-semibold">
              {classroom.current_enrollment} / {classroom.licensed_capacity}
            </span>
          </div>
          <Progress value={utilization} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{utilization.toFixed(0)}% utilized</span>
            <span>{classroom.available_spots} spots available</span>
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
            <p className="text-2xl font-bold text-green-900">
              {classroom.available_spots}
            </p>
          </div>

          {/* Pending Enrollments */}
          {classroom.pending_enrollments > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-900 font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {classroom.pending_enrollments}
              </p>
            </div>
          )}

          {/* Waitlist */}
          {classroom.waitlist_count > 0 && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-orange-900 font-medium">Waitlist</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {classroom.waitlist_count}
              </p>
            </div>
          )}
        </div>

        {/* Ratio Status */}
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Ratio</span>
            <span className={`text-sm font-semibold ${getRatioColor()}`}>
              {classroom.current_ratio.toFixed(1)}:1
            </span>
          </div>
          {classroom.ratio_status === 'critical' && (
            <Badge variant="destructive" className="mt-2 w-full justify-center">
              ⚠️ Ratio Violation
            </Badge>
          )}
          {classroom.ratio_status === 'warning' && (
            <Badge className="mt-2 w-full justify-center bg-yellow-500">
              ⚠️ Near Limit
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate(`/provider/classroom/${classroom.id}/details`)}
          >
            View Details
          </Button>
          {classroom.available_spots > 0 && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => navigate(`/provider/applications?classroom=${classroom.id}`)}
            >
              Enroll Child
            </Button>
          )}
          {classroom.available_spots === 0 && (
            <Button 
              size="sm" 
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(`/provider/waitlist?classroom=${classroom.id}`)}
            >
              View Waitlist
            </Button>
          )}
        </div>

      </div>
    </Card>
  );
}
