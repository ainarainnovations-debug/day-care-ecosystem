import { useState } from "react";
import { Clock, Users, TrendingUp, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockTeachers = [
  {
    id: "1",
    name: "Ms. Sara",
    role: "Lead Teacher",
    avatar: "👩‍🏫",
    thisWeek: "38h 15m",
    today: "7h 30m",
    status: "active" as const,
    punchIn: "7:30 AM",
    weeklyTarget: 40,
    weeklyActual: 38.25,
    breaksTaken: 2,
    overtimeHours: 0,
  },
  {
    id: "2",
    name: "Mr. James",
    role: "Assistant Teacher",
    avatar: "👨‍🏫",
    thisWeek: "32h 00m",
    today: "6h 45m",
    status: "on_break" as const,
    punchIn: "8:00 AM",
    weeklyTarget: 40,
    weeklyActual: 32,
    breaksTaken: 3,
    overtimeHours: 0,
  },
  {
    id: "3",
    name: "Ms. Emily",
    role: "Floater",
    avatar: "👩‍🏫",
    thisWeek: "22h 30m",
    today: "—",
    status: "off" as const,
    punchIn: null,
    weeklyTarget: 25,
    weeklyActual: 22.5,
    breaksTaken: 0,
    overtimeHours: 0,
  },
];

const weeklySummary = {
  totalHours: "92h 45m",
  totalLabor: "$2,318.75",
  avgHoursPerDay: "18.5h",
  staffOnDuty: 2,
  staffTotal: 3,
};

const ProviderTimeLabor = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekLabel = weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : `${Math.abs(weekOffset)} weeks ago`;

  return (
    <div className="space-y-6">
      {/* Week Navigator */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">Time & Labor</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <Badge variant="secondary" className="rounded-full text-xs">{weekLabel}</Badge>
          <button onClick={() => setWeekOffset((w) => Math.min(0, w + 1))} className="p-1">
            <ChevronRight className={`w-4 h-4 ${weekOffset === 0 ? "text-muted" : "text-muted-foreground"}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Hours", value: weeklySummary.totalHours, icon: <Clock className="w-5 h-5 text-primary" />, bg: "bg-light-coral/30" },
          { label: "Labor Cost", value: weeklySummary.totalLabor, icon: <TrendingUp className="w-5 h-5 text-accent" />, bg: "bg-light-sage/40" },
          { label: "Avg / Day", value: weeklySummary.avgHoursPerDay, icon: <Calendar className="w-5 h-5 text-primary" />, bg: "bg-light-coral/30" },
          { label: "On Duty", value: `${weeklySummary.staffOnDuty}/${weeklySummary.staffTotal}`, icon: <Users className="w-5 h-5 text-accent" />, bg: "bg-light-sage/40" },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">{card.icon}</div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Teacher List */}
      <div>
        <h4 className="font-heading font-semibold text-foreground mb-3">Staff Hours</h4>
        <div className="space-y-3">
          {mockTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-popover rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-light-sage flex items-center justify-center text-lg">
                    {teacher.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.role}</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`rounded-full text-[10px] ${
                    teacher.status === "active"
                      ? "bg-accent/15 text-accent"
                      : teacher.status === "on_break"
                      ? "bg-secondary text-muted-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {teacher.status === "active" ? "🟢 Active" : teacher.status === "on_break" ? "☕ Break" : "⚫ Off"}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{teacher.thisWeek} / {teacher.weeklyTarget}h target</span>
                  <span>{Math.round((teacher.weeklyActual / teacher.weeklyTarget) * 100)}%</span>
                </div>
                <Progress value={(teacher.weeklyActual / teacher.weeklyTarget) * 100} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Today: <span className="text-foreground font-medium">{teacher.today}</span>
                </span>
                {teacher.punchIn && (
                  <span className="text-muted-foreground">
                    Punch in: <span className="text-foreground font-medium">{teacher.punchIn}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderTimeLabor;
