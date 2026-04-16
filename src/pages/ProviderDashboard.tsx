import { useState } from "react";
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

const todayKids = [
  { id: 1, name: "Emma S.", age: "2y", arrived: "7:15 AM", parent: "Sarah", status: "present", allergies: "None" },
  { id: 2, name: "Noah T.", age: "3y", arrived: "7:30 AM", parent: "Jessica", status: "present", allergies: "Dairy" },
  { id: 3, name: "Olivia R.", age: "1y", arrived: "8:00 AM", parent: "Michael", status: "present", allergies: "None" },
  { id: 4, name: "Liam K.", age: "4y", arrived: "—", parent: "Amanda", status: "expected", allergies: "Peanuts" },
  { id: 5, name: "Ava M.", age: "2y", arrived: "—", parent: "David", status: "absent", allergies: "None" },
];

const pendingBookings = [
  { id: 1, parent: "Lisa Chen", child: "Sophia", date: "Jan 20", type: "Full Day", price: 65 },
  { id: 2, parent: "Mark Johnson", child: "Ethan", date: "Jan 22", type: "Half Day (AM)", price: 40 },
];

const invoices = [
  { id: 1, parent: "Sarah Smith", amount: 1300, period: "Jan 1-15", status: "paid" },
  { id: 2, parent: "Jessica Taylor", amount: 1300, period: "Jan 1-15", status: "paid" },
  { id: 3, parent: "Michael Rodriguez", amount: 650, period: "Jan 1-15", status: "pending" },
  { id: 4, parent: "Amanda Kim", amount: 1300, period: "Jan 1-15", status: "overdue" },
];

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState<ProviderTab>("today");

  const renderContent = () => {
    switch (activeTab) {
      case "today":
        return (
          <div className="space-y-4">
            {pendingBookings.length > 0 && (
              <div className="bg-light-coral/30 rounded-xl border border-primary/20 p-5">
                <h3 className="font-heading font-semibold text-foreground mb-3">Pending Booking Requests</h3>
                {pendingBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <span className="font-medium text-foreground">{b.parent}</span>
                      <span className="text-sm text-muted-foreground"> — {b.child} • {b.date} • {b.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-accent text-accent-foreground h-8"><Check className="w-3 h-3 mr-1" />Accept</Button>
                      <Button size="sm" variant="outline" className="h-8"><X className="w-3 h-3 mr-1" />Decline</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-popover rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-heading font-semibold text-foreground">Today's Attendance</h3>
              </div>
              <div className="divide-y divide-border">
                {todayKids.map((kid) => (
                  <div key={kid.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-light-sage rounded-full flex items-center justify-center text-sm">👶</div>
                      <div>
                        <div className="font-medium text-foreground">{kid.name} <span className="text-xs text-muted-foreground">({kid.age})</span></div>
                        <div className="text-xs text-muted-foreground">Parent: {kid.parent} {kid.allergies !== "None" && <Badge variant="outline" className="ml-1 text-xs text-destructive border-destructive/30">⚠️ {kid.allergies}</Badge>}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {kid.arrived !== "—" && <span className="text-xs text-muted-foreground">Arrived {kid.arrived}</span>}
                      <Badge className={
                        kid.status === "present" ? "bg-accent text-accent-foreground" :
                        kid.status === "expected" ? "bg-secondary text-foreground" :
                        "bg-muted text-muted-foreground"
                      }>{kid.status}</Badge>
                      <Button variant="outline" size="sm">Check {kid.status === "present" ? "out" : "in"}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "schedule":
        return <BookingSchedule />;
      case "children":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayKids.map((kid) => (
              <div key={kid.id} className="bg-popover rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-light-sage rounded-full flex items-center justify-center text-xl">👶</div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{kid.name}</h3>
                    <p className="text-sm text-muted-foreground">Age: {kid.age}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Parent</span><span className="text-foreground">{kid.parent}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Allergies</span><span className={kid.allergies !== "None" ? "text-destructive font-medium" : "text-foreground"}>{kid.allergies}</span></div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">View Full Profile</Button>
              </div>
            ))}
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
                {todayKids.filter(k => k.status === "present").map((kid) => (
                  <Badge key={kid.id} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">{kid.name}</Badge>
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
              <h3 className="font-heading text-lg font-semibold text-foreground">Invoices — January 2025</h3>
              <Button size="sm" className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Create Invoice</Button>
            </div>
            <div className="bg-popover rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{inv.parent}</div>
                      <div className="text-sm text-muted-foreground">{inv.period}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">${inv.amount}</span>
                      <Badge className={
                        inv.status === "paid" ? "bg-accent text-accent-foreground" :
                        inv.status === "pending" ? "bg-secondary text-foreground" :
                        "bg-destructive text-destructive-foreground"
                      }>{inv.status}</Badge>
                      <Button variant="outline" size="sm"><FileText className="w-3 h-3 mr-1" />View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "availability":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-popover rounded-xl border border-border p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Capacity Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Maximum capacity</span>
                  <Input type="number" defaultValue={8} className="w-20 text-center" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Current enrolled</span>
                  <span className="font-semibold text-foreground">6</span>
                </div>
                <Progress value={75} className="h-3" />
                <p className="text-sm text-accent font-medium">2 spots available</p>
              </div>
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
                { label: "Kids Today", value: "3/5", sub: "2 expected", icon: <Users className="w-5 h-5 text-primary" />, progress: 60 },
                { label: "Capacity", value: "6/8", sub: "2 spots open", icon: <Calendar className="w-5 h-5 text-accent" />, progress: 75 },
                { label: "This Month", value: "$3,250", sub: "+12% vs last", icon: <DollarSign className="w-5 h-5 text-primary" />, progress: null },
                { label: "Pending", value: "2", sub: "booking requests", icon: <Clock className="w-5 h-5 text-muted-foreground" />, progress: null },
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
