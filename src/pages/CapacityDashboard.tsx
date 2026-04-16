import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, AlertCircle, Info, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Classroom {
  id: string;
  name: string;
  age_group: string;
  capacity: number;
  current_enrollment: number;
}

// Mock data since classrooms table doesn't exist yet
const mockClassrooms: Classroom[] = [
  { id: '1', name: 'Infants', age_group: 'infant', capacity: 8, current_enrollment: 6 },
  { id: '2', name: 'Toddlers', age_group: 'toddler', capacity: 12, current_enrollment: 10 },
  { id: '3', name: 'Pre-K', age_group: 'pre-k', capacity: 16, current_enrollment: 14 },
];

export default function CapacityDashboard() {
  const navigate = useNavigate();
  const classrooms = mockClassrooms;

  const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);
  const totalEnrolled = classrooms.reduce((sum, c) => sum + c.current_enrollment, 0);
  const totalAvailable = totalCapacity - totalEnrolled;
  const overallUtilization = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Capacity Management</h1>
            <p className="text-muted-foreground">Real-time enrollment capacity monitoring</p>
          </div>
          <Button onClick={() => navigate('/provider/dashboard')} variant="outline">
            <Settings className="mr-2 h-4 w-4" />Back to Dashboard
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Capacity Management</strong> — Real-time enrollment capacity across all classrooms.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Enrolled', value: totalEnrolled, icon: <Users className="h-8 w-8 text-primary" /> },
            { label: 'Capacity', value: totalCapacity, icon: <Users className="h-8 w-8 text-muted-foreground" /> },
            { label: 'Available', value: totalAvailable, icon: <TrendingUp className="h-8 w-8 text-accent" /> },
            { label: 'Utilization', value: `${overallUtilization.toFixed(0)}%`, icon: <Badge variant={overallUtilization >= 95 ? 'destructive' : 'default'}>{overallUtilization >= 95 ? 'Full' : 'OK'}</Badge> },
          ].map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Classrooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((classroom) => {
              const utilization = classroom.capacity > 0 ? (classroom.current_enrollment / classroom.capacity) * 100 : 0;
              const available = classroom.capacity - classroom.current_enrollment;

              return (
                <Card key={classroom.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{classroom.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{classroom.age_group}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${available === 0 ? 'bg-destructive' : available <= 2 ? 'bg-secondary' : 'bg-accent'}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-semibold">{classroom.current_enrollment} / {classroom.capacity}</span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                      <p className="text-xs text-muted-foreground">{available} spots available</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
