import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar, Users, DollarSign, Clock, Check, X, Camera, Plus, FileText, Settings, Bell,
  LayoutDashboard, Baby, Activity, Wallet, CalendarClock, Timer, KeyRound, Inbox, PencilLine, Rocket
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import InviteCodeManager from "@/components/InviteCodeManager";
import ApplicationsManager from "@/components/ApplicationsManager";
import BookingSchedule from "@/components/BookingSchedule";
import ProviderTimeLabor from "@/components/provider/ProviderTimeLabor";
import ProviderSettings from "@/components/provider/ProviderSettings";
import ProviderSetupChecklist from "@/components/provider/ProviderSetupChecklist";
import ProviderProfileEditor from "@/components/provider/ProviderProfileEditor";
import { useAuth } from "@/hooks/useAuth";
import { providerDashboardService } from "@/services/providerDashboardService";
import { paymentService } from "@/services/paymentService";
import { capacityService } from "@/services/capacityService";

type ProviderTab = "today" | "schedule" | "children" | "activity" | "billing" | "availability" | "timelabor" | "invites" | "applications" | "editprofile" | "setup" | "settings";

const sidebarItems: { id: ProviderTab; label: string; icon: React.ElementType }[] = [
  { id: "today", label: "Today", icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "children", label: "Children", icon: Baby },
  { id: "activity", label: "Log Activity", icon: Activity },
  { id: "billing", label: "Billing", icon: Wallet },
  { id: "availability", label: "Availability", icon: CalendarClock },
  { id: "timelabor", label: "Time & Labor", icon: Timer },
  { id: "invites", label: "Invites", icon: KeyRound },
  { id: "applications", label: "Applications", icon: Inbox },
  { id: "editprofile", label: "Edit Profile", icon: PencilLine },
  { id: "setup", label: "Setup", icon: Rocket },
  { id: "settings", label: "Settings", icon: Settings },
];

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState<ProviderTab>("today");
  const { user } = useAuth();

  // Fetch real-time dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['provider-stats', user?.id],
    queryFn: () => providerDashboardService.getDashboardStats(user!.id),
    enabled: !!user?.id,
  });

  const { data: todayKids = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['todays-attendance', user?.id],
    queryFn: () => providerDashboardService.getTodaysAttendance(user!.id),
    enabled: !!user?.id,
  });

  const { data: pendingBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['pending-bookings', user?.id],
    queryFn: () => providerDashboardService.getPendingBookings(user!.id),
    enabled: !!user?.id,
  });

  const { data: enrolledChildren = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['enrolled-children', user?.id],
    queryFn: () => providerDashboardService.getEnrolledChildren(user!.id),
    enabled: !!user?.id,
  });

  // Fetch invoices for billing tab
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['provider-invoices', user?.id],
    queryFn: () => paymentService.getInvoices(user!.id),
    enabled: !!user?.id,
  });

  // Fetch all bookings for schedule view
  const { data: allBookings = [], isLoading: bookingsScheduleLoading } = useQuery({
    queryKey: ['all-bookings', user?.id],
    queryFn: () => providerDashboardService.getAllBookings(user!.id),
    enabled: !!user?.id,
  });

  // Fetch capacity stats for availability tab
  const { data: capacityStats, isLoading: capacityLoading } = useQuery({
    queryKey: ['capacity-stats', user?.id],
    queryFn: () => capacityService.getCapacityStats(user!.id),
    enabled: !!user?.id,
  });

  // Show loading state
  if (statsLoading || attendanceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "today":
        return (
          <div className="space-y-4">
            {pendingBookings.length > 0 && (
              <div className="bg-light-coral/30 rounded-xl border border-primary/20 p-5">
                <h3 className="font-heading font-semibold text-foreground mb-3">Pending Booking Requests</h3>
                {pendingBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <span className="font-medium text-foreground">{b.parent_name}</span>
                      <span className="text-sm text-muted-foreground"> — {b.child_name} • {new Date(b.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {b.booking_type}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-accent text-accent-foreground h-8"><Check className="w-3 h-3 mr-1" />Accept</Button>
                      <Button size="sm" variant="outline" className="h-8"><X className="w-3 h-3 mr-1" />Decline</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Access to New Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => window.location.href = '/provider/capacity'}
                className="bg-popover rounded-xl border border-border p-5 cursor-pointer hover:border-primary/50 hover:bg-light-sage/20 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-light-sage rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-semibold text-foreground mb-1">Capacity Management</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Track enrollment capacity, manage waitlists, and monitor classroom utilization
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-accent/10">6/8 enrolled</Badge>
                      <Badge variant="outline" className="bg-primary/10">75% utilization</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => window.location.href = '/provider/payments'}
                className="bg-popover rounded-xl border border-border p-5 cursor-pointer hover:border-primary/50 hover:bg-light-sage/20 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-light-sage rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-semibold text-foreground mb-1">Payment Collection</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Accept ACH, card, and FSA/HSA payments with instant confirmation and autopay
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-accent/10">82% autopay rate</Badge>
                      <Badge variant="outline" className="bg-primary/10">$45.6K collected</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-popover rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-heading font-semibold text-foreground">Today's Attendance</h3>
              </div>
              <div className="divide-y divide-border">
                {todayKids.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No children checked in today
                  </div>
                ) : (
                  todayKids.map((kid: any) => {
                    const checkInTime = kid.check_in_time ? new Date(kid.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null;
                    const isCheckedIn = !!kid.check_in_time && !kid.check_out_time;
                    
                    return (
                      <div key={kid.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-light-sage rounded-full flex items-center justify-center text-sm">👶</div>
                          <div>
                            <div className="font-medium text-foreground">
                              {kid.child_name} 
                              {kid.date_of_birth && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({Math.floor((new Date().getTime() - new Date(kid.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}y)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Parent: {kid.parent_name}
                              {kid.allergies && kid.allergies !== "None" && (
                                <Badge variant="outline" className="ml-1 text-xs text-destructive border-destructive/30">
                                  ⚠️ {kid.allergies}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {checkInTime && <span className="text-xs text-muted-foreground">Arrived {checkInTime}</span>}
                          <Badge className={isCheckedIn ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}>
                            {isCheckedIn ? "present" : "checked out"}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (isCheckedIn && kid.attendance_id) {
                                providerDashboardService.checkOutChild(kid.attendance_id);
                              }
                            }}
                          >
                            Check {isCheckedIn ? "out" : "in"}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      case "schedule":
        return <BookingSchedule bookings={allBookings} isLoading={bookingsScheduleLoading} />;
      case "children":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childrenLoading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">Loading children...</div>
            ) : enrolledChildren.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No enrolled children</div>
            ) : (
              enrolledChildren.map((kid: any) => {
                const age = kid.date_of_birth 
                  ? Math.floor((new Date().getTime() - new Date(kid.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                  : null;
                
                return (
                  <div key={kid.id} className="bg-popover rounded-xl border border-border p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 bg-light-sage rounded-full flex items-center justify-center text-xl">👶</div>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">{kid.first_name} {kid.last_name}</h3>
                        <p className="text-sm text-muted-foreground">Age: {age ? `${age}y` : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parent</span>
                        <span className="text-foreground">{kid.parent_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Allergies</span>
                        <span className={kid.allergies && kid.allergies !== "None" ? "text-destructive font-medium" : "text-foreground"}>
                          {kid.allergies || "None"}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">View Full Profile</Button>
                  </div>
                );
              })
            )}
          </div>
        );
      case "activity":
        return (
          <div className="bg-popover rounded-xl border border-border p-6">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Log an Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { icon: "📸", label: "Photo/Video" },
                { icon: "🍽️", label: "Meal" },
                { icon: "😴", label: "Nap" },
                { icon: "🚼", label: "Diaper" },
                { icon: "🎨", label: "Activity" },
                { icon: "💊", label: "Medicine" },
                { icon: "📝", label: "Note" },
                { icon: "🚨", label: "Incident" },
              ].map((action) => (
                <button key={action.label} className="p-4 bg-secondary rounded-lg text-center hover:bg-light-sage transition-colors">
                  <div className="text-2xl mb-1">{action.icon}</div>
                  <div className="text-sm text-foreground">{action.label}</div>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Select children</label>
              <div className="flex flex-wrap gap-2">
                {todayKids.filter((k: any) => k.check_in_time && !k.check_out_time).map((kid: any) => (
                  <Badge key={kid.id} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {kid.child_name}
                  </Badge>
                ))}
                <Badge variant="outline" className="cursor-pointer bg-primary text-primary-foreground">All</Badge>
              </div>
              <Input placeholder="Add a note..." />
              <Button className="bg-primary text-primary-foreground"><Camera className="w-4 h-4 mr-2" /> Upload & Send to Parents</Button>
            </div>
          </div>
        );
      case "billing":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Invoices — {format(new Date(), 'MMMM yyyy')}
              </h3>
              <Button size="sm" className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Create Invoice
              </Button>
            </div>
            <div className="bg-popover rounded-xl border border-border overflow-hidden">
              {invoicesLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading invoices...</div>
              ) : invoices.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No invoices found</div>
              ) : (
                <div className="divide-y divide-border">
                  {invoices.map((inv: any) => {
                    const dueDate = inv.due_date ? new Date(inv.due_date) : null;
                    const isOverdue = dueDate && dueDate < new Date() && inv.status === 'sent';
                    const displayStatus = isOverdue ? 'overdue' : inv.status;
                    
                    return (
                      <div key={inv.id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{inv.parent_name || 'Unknown Parent'}</div>
                          <div className="text-sm text-muted-foreground">
                            {inv.issue_date && format(new Date(inv.issue_date), 'MMM d')}
                            {dueDate && ` - Due ${format(dueDate, 'MMM d')}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">
                            ${inv.total_amount?.toFixed(2) || '0.00'}
                          </span>
                          <Badge className={
                            displayStatus === "succeeded" || displayStatus === "paid" ? "bg-accent text-accent-foreground" :
                            displayStatus === "sent" || displayStatus === "pending" ? "bg-secondary text-foreground" :
                            "bg-destructive text-destructive-foreground"
                          }>
                            {displayStatus}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <FileText className="w-3 h-3 mr-1" />View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      case "availability":
        const totalCapacity = capacityStats?.totalCapacity || 0;
        const totalEnrolled = capacityStats?.totalEnrolled || 0;
        const utilizationPercent = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-popover rounded-xl border border-border p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Capacity Settings</h3>
              {capacityLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading capacity data...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Maximum capacity</span>
                    <Input type="number" value={totalCapacity} readOnly className="w-20 text-center" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Current enrolled</span>
                    <span className="font-semibold text-foreground">{totalEnrolled}</span>
                  </div>
                  <Progress value={utilizationPercent} className="h-3" />
                  <p className="text-sm text-accent font-medium">
                    {capacityStats?.totalAvailable || 0} spots available
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = '/provider/capacity'}
                  >
                    Manage Capacity
                  </Button>
                </div>
              )}
            </div>
            <div className="bg-popover rounded-xl border border-border p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Operating Hours</h3>
              <div className="space-y-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-foreground w-24">{day}</span>
                    <div className="flex items-center gap-2">
                      <Input type="time" defaultValue="07:00" className="w-28" />
                      <span className="text-muted-foreground">to</span>
                      <Input type="time" defaultValue="18:00" className="w-28" />
                    </div>
                  </div>
                ))}
                {["Saturday", "Sunday"].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-foreground w-24">{day}</span>
                    <Badge variant="outline">Closed</Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-primary text-primary-foreground">Save Changes</Button>
            </div>
          </div>
        );
      case "timelabor": return <ProviderTimeLabor />;
      case "invites": return <InviteCodeManager />;
      case "applications": return <ApplicationsManager />;
      case "editprofile": return <ProviderProfileEditor />;
      case "setup": return <ProviderSetupChecklist />;
      case "settings": return <ProviderSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Left sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-popover border-r border-border p-4 flex-shrink-0 hidden md:flex flex-col gap-1">
          <div className="mb-4 px-3">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2"><LayoutDashboard className="w-5 h-5 stroke-[2.25]" /> Provider</h2>
            <p className="text-xs text-muted-foreground">Sunshine Home Daycare</p>
          </div>
          {sidebarItems.map((item) => {
            const SideIcon = item.icon;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-body transition-all duration-200 w-full relative ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
                    }`}
                  >
                    {activeTab === item.id && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                    )}
                    <SideIcon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeTab === item.id ? "stroke-[2.5]" : "stroke-[2.25] group-hover:stroke-[2.5]"}`} />
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
        <main key={activeTab} className="flex-1 p-6 md:p-8 max-w-5xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                {(() => { const ActiveIcon = sidebarItems.find(i => i.id === activeTab)?.icon; return ActiveIcon ? <ActiveIcon className="w-6 h-6 stroke-[2.25]" /> : null; })()}
                {sidebarItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">2</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats - only on Today */}
          {activeTab === "today" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { 
                  label: "Kids Today", 
                  value: stats?.kidsToday || "0/0", 
                  sub: `${todayKids.filter((k: any) => !k.check_in_time).length} expected`, 
                  icon: <Users className="w-5 h-5 text-primary" />, 
                  progress: stats?.kidsToday ? (parseInt(stats.kidsToday.split('/')[0]) / parseInt(stats.kidsToday.split('/')[1])) * 100 : 0 
                },
                { 
                  label: "Capacity", 
                  value: stats?.capacity || "0/0", 
                  sub: `${stats?.capacity ? parseInt(stats.capacity.split('/')[1]) - parseInt(stats.capacity.split('/')[0]) : 0} spots open`, 
                  icon: <Calendar className="w-5 h-5 text-accent" />, 
                  progress: stats?.capacity ? (parseInt(stats.capacity.split('/')[0]) / parseInt(stats.capacity.split('/')[1])) * 100 : 0 
                },
                { 
                  label: "This Month", 
                  value: `$${stats?.monthlyRevenue?.toLocaleString() || '0'}`, 
                  sub: "+12% vs last", 
                  icon: <DollarSign className="w-5 h-5 text-primary" />, 
                  progress: null 
                },
                { 
                  label: "Pending", 
                  value: stats?.pendingBookings?.toString() || "0", 
                  sub: "booking requests", 
                  icon: <Clock className="w-5 h-5 text-muted-foreground" />, 
                  progress: null 
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-popover rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-sm text-muted-foreground">{stat.label}</span></div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.sub}</div>
                  {stat.progress !== null && <Progress value={stat.progress} className="mt-2 h-2" />}
                </div>
              ))}
            </div>
          )}

          {/* Mobile tab selector */}
          <div className="md:hidden mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {(() => { const TabIcon = item.icon; return <TabIcon className="w-3.5 h-3.5 stroke-[2.25]" />; })()}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ProviderDashboard;
