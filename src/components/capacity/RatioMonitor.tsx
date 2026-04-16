import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Users, User } from 'lucide-react';

interface RatioMonitorProps {
  classrooms: Array<{
    id: string;
    name: string;
    age_group: string;
    current_ratio: number;
    ratio_numerator: number;
    ratio_denominator: number;
    ratio_status: 'safe' | 'warning' | 'critical';
    current_enrollment: number;
  }>;
}

export default function RatioMonitor({ classrooms }: RatioMonitorProps) {
  
  const criticalRooms = classrooms.filter(c => c.ratio_status === 'critical');
  const warningRooms = classrooms.filter(c => c.ratio_status === 'warning');
  const safeRooms = classrooms.filter(c => c.ratio_status === 'safe');

  const getRatioStatusIcon = (status: string) => {
    if (status === 'critical') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getRatioStatusBadge = (status: string) => {
    if (status === 'critical') return <Badge variant="destructive">VIOLATION</Badge>;
    if (status === 'warning') return <Badge className="bg-yellow-500">WARNING</Badge>;
    return <Badge className="bg-green-500">COMPLIANT</Badge>;
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Summary */}
      {criticalRooms.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            🚨 {criticalRooms.length} classroom{criticalRooms.length > 1 ? 's' : ''} in ratio violation - immediate action required!
          </AlertDescription>
        </Alert>
      )}

      {warningRooms.length > 0 && criticalRooms.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ {warningRooms.length} classroom{warningRooms.length > 1 ? 's' : ''} approaching ratio limit
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Ratios */}
      {criticalRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Critical Ratio Violations ({criticalRooms.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalRooms.map((classroom) => (
              <Card key={classroom.id} className="p-4 border-red-300 bg-red-50">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{classroom.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{classroom.age_group}</p>
                    </div>
                    {getRatioStatusBadge(classroom.ratio_status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">{classroom.current_enrollment} children</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">? staff</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-red-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Current Ratio:</span>
                      <span className="text-lg font-bold text-red-600">
                        {classroom.current_ratio.toFixed(1)}:1
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-700">Maximum Allowed:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(classroom.ratio_denominator / classroom.ratio_numerator).toFixed(1)}:1
                      </span>
                    </div>
                  </div>

                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="text-xs">
                      Action Required: Add staff or move children to maintain compliance
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Warning Ratios */}
      {warningRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-yellow-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Approaching Limit ({warningRooms.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warningRooms.map((classroom) => (
              <Card key={classroom.id} className="p-4 border-yellow-300 bg-yellow-50">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{classroom.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{classroom.age_group}</p>
                    </div>
                    {getRatioStatusBadge(classroom.ratio_status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">{classroom.current_enrollment} children</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">? staff</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-yellow-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Current Ratio:</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {classroom.current_ratio.toFixed(1)}:1
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-700">Maximum Allowed:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(classroom.ratio_denominator / classroom.ratio_numerator).toFixed(1)}:1
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Safe Ratios */}
      {safeRooms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Compliant Ratios ({safeRooms.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safeRooms.map((classroom) => (
              <Card key={classroom.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{classroom.name}</h4>
                      <p className="text-xs text-gray-600 capitalize">{classroom.age_group}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Ratio:</span>
                      <span className="text-sm font-bold text-green-600">
                        {classroom.current_ratio.toFixed(1)}:1
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-blue-900 text-sm">How Ratio Monitoring Works</h4>
            <p className="text-xs text-blue-800">
              Only <strong>present children</strong> (checked in today) count toward ratio. Enrolled but absent children don't require staff coverage.
              The ratio is calculated in real-time based on daily check-ins.
            </p>
            <p className="text-xs text-blue-800 mt-2">
              <strong>State-Compliant Ratios:</strong>
              <br />• Infants (0-12 months): 1 staff per 4 children
              <br />• Toddlers (12-30 months): 1 staff per 6 children
              <br />• Preschool (30-48 months): 1 staff per 10 children
              <br />• Pre-K (48+ months): 1 staff per 12 children
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
}
