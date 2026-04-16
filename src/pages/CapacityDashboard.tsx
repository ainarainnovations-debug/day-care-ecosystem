import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, TrendingUp, AlertCircle, Info, Settings, Bell, LayoutDashboard, Calendar, Baby, Activity, Wallet, CalendarClock, Timer, KeyRound, Inbox, PencilLine, Rocket, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { capacityService } from '@/services/capacityService';

const sidebarItems = [
  { id: "today", label: "Today", icon: LayoutDashboard, path: "/provider/dashboard" },
  { id: "schedule", label: "Schedule", icon: Calendar, path: "/provider/dashboard" },
  { id: "children", label: "Children", icon: Baby, path: "/provider/dashboard" },
  { id: "activity", label: "Log Activity", icon: Activity, path: "/provider/dashboard" },
  { id: "billing", label: "Billing", icon: Wallet, path: "/provider/dashboard" },
  { id: "availability", label: "Availability", icon: CalendarClock, path: "/provider/dashboard" },
  { id: "timelabor", label: "Time & Labor", icon: Timer, path: "/provider/dashboard" },
  { id: "invites", label: "Invites", icon: KeyRound, path: "/provider/dashboard" },
  { id: "applications", label: "Applications", icon: Inbox, path: "/provider/dashboard" },
  { id: "editprofile", label: "Edit Profile", icon: PencilLine, path: "/provider/dashboard" },
  { id: "setup", label: "Setup", icon: Rocket, path: "/provider/dashboard" },
  { id: "settings", label: "Settings", icon: Settings, path: "/provider/dashboard" },
];

export default function CapacityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch real capacity data from database
  const { data: capacityData, isLoading, error } = useQuery({
    queryKey: ['capacity-stats', user?.id],
    queryFn: () => capacityService.getCapacityStats(user!.id),
    enabled: !!user?.id,
  });

  const classrooms = capacityData?.classrooms || [];
  const totalCapacity = capacityData?.totalCapacity || 0;
  const totalEnrolled = capacityData?.totalEnrolled || 0;
  const totalAvailable = capacityData?.totalAvailable || 0;
  const overallUtilization = capacityData?.utilization || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading capacity data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Alert className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error loading capacity data</strong><br />
              {error instanceof Error ? error.message : 'An error occurred'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Left sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-popover border-r border-border p-4 flex-shrink-0 hidden md:flex flex-col gap-1">
          <div className="mb-4 px-3">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 stroke-[2.25]" /> Provider
            </h2>
            <p className="text-xs text-muted-foreground">Sunshine Home Daycare</p>
          </div>
          {sidebarItems.map((item) => {
            const SideIcon = item.icon;
            const isActive = false; // No sidebar item is active on this page
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-body transition-all duration-200 w-full relative ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                    )}
                    <SideIcon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "stroke-[2.5]" : "stroke-[2.25] group-hover:stroke-[2.5]"}`} />
                    {item.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6 stroke-[2.25]" />
                Capacity Management
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Real-time enrollment capacity monitoring</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
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
              const utilization = classroom.licensed_capacity > 0 ? (classroom.current_enrollment / classroom.licensed_capacity) * 100 : 0;
              const available = classroom.available_spots;

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
                        <span className="font-semibold">{classroom.current_enrollment} / {classroom.licensed_capacity}</span>
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
        </main>
      </div>
    </div>
  );
}
