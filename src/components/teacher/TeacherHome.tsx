import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Users, CalendarDays, AlertTriangle, Pill, Cake } from "lucide-react";
import teacherAvatar from "@/assets/teacher-avatar.jpg";

const TeacherHome = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || "Teacher";

  // Mock data — will connect to real data later
  const classInfo = { name: "Toddler 2", checkedIn: 3, total: 10 };
  const notifications = 5;

  const upcomingEvents = [
    { id: "1", title: "Field Trip to Zoo", date: "Monday, Jul 16", time: "12:00 AM", startDate: "16 Jul", endDate: "28 Jul" },
  ];

  const alerts = [
    { id: "1", type: "birthday", title: "Birthday", desc: "John's, Sofia & Lia Birthday", color: "bg-purple-50 text-purple-700", icon: Cake },
    { id: "2", type: "allergy", title: "Dietary Restriction", desc: "Sara allergy to Peanut", highlight: "Peanut", color: "bg-rose-50 text-rose-700", icon: AlertTriangle },
    { id: "3", type: "medicine", title: "Medicine", desc: "Joe Aspirin tablet at 12:00 AM", highlight: "12:00 AM", color: "bg-emerald-50 text-emerald-700", icon: Pill },
  ];

  return (
    <div className="px-4 pt-4">

      {/* Check-in card */}
      <div className="bg-secondary rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground font-medium">You have checked-in {classInfo.name}</p>
          <Badge variant="outline" className="mt-2 rounded-full text-xs">Class Check-Out</Badge>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-light-sage/40 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-sage" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{classInfo.checkedIn}/{classInfo.total}</p>
            <p className="text-xs text-muted-foreground">Total Children</p>
          </div>
        </div>
        <div className="bg-light-coral/40 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-coral" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{notifications}</p>
            <p className="text-xs text-muted-foreground">Notifications</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-foreground">Upcoming Events</h2>
          <button className="text-xs text-primary font-medium">More →</button>
        </div>
        {upcomingEvents.map((event) => (
          <div key={event.id} className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl p-4 flex items-center gap-4">
            <div className="flex gap-1">
              <div className="bg-popover rounded-lg px-2 py-1 text-center shadow-sm">
                <span className="text-[10px] text-muted-foreground block -rotate-90 writing-mode-vertical">{event.endDate}</span>
              </div>
              <div className="bg-popover rounded-lg px-2 py-1 text-center shadow-sm">
                <span className="text-[10px] text-muted-foreground block -rotate-90 writing-mode-vertical">{event.startDate}</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground">{event.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">{event.date} | {event.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-3 pb-4">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} className="bg-popover rounded-2xl p-4 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.color.split(" ")[0]}`}>
                  <Icon className={`w-5 h-5 ${alert.color.split(" ")[1]}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${alert.color.split(" ")[1]}`}>{alert.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.highlight
                      ? alert.desc.replace(alert.highlight, "")
                      : alert.desc}
                    {alert.highlight && <span className="text-primary font-medium"> {alert.highlight}</span>}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherHome;
