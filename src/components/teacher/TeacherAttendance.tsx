import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  getTeacherProfile,
  getAttendanceRecords,
  getProviderChildren,
  getTodayAttendance,
} from "@/lib/teacherService";
import type { TeacherProfile } from "@/types/teacher";

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

interface AttendanceRecord {
  id: string;
  child_id: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
  child: Child;
}

interface ChildWithAttendance extends Child {
  attendance: AttendanceRecord | null;
  checkedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
}

const getDaysOfWeek = (offset: number) => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const TeacherAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [children, setChildren] = useState<ChildWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState({ totalDays: 22, present: 0, absent: 0 });

  const days = getDaysOfWeek(weekOffset);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.provider_id) {
      loadDailyAttendance();
      loadMonthlyStats();
    }
  }, [selectedDay, profile]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    const teacherProfile = await getTeacherProfile(user.id);
    setProfile(teacherProfile);
    setLoading(false);
  };

  const loadDailyAttendance = async () => {
    if (!profile?.provider_id) return;

    try {
      // Get all children for this provider
      const allChildren = await getProviderChildren(profile.provider_id);

      // Get attendance records for selected day
      const startOfDay = new Date(selectedDay);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDay);
      endOfDay.setHours(23, 59, 59, 999);

      const attendanceRecords = await getAttendanceRecords(
        profile.provider_id,
        startOfDay,
        endOfDay
      );

      // Create a map of child_id to attendance record
      const attendanceMap = new Map<string, AttendanceRecord>();
      attendanceRecords.forEach((record: any) => {
        attendanceMap.set(record.child_id, record);
      });

      // Merge children with their attendance
      const childrenWithAttendance: ChildWithAttendance[] = allChildren.map((child: any) => {
        const attendance = attendanceMap.get(child.id);
        return {
          id: child.id,
          first_name: child.first_name,
          last_name: child.last_name,
          photo_url: child.photo_url,
          attendance: attendance || null,
          checkedIn: !!attendance && !attendance.check_out_time,
          checkInTime: attendance?.check_in_time
            ? new Date(attendance.check_in_time).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : null,
          checkOutTime: attendance?.check_out_time
            ? new Date(attendance.check_out_time).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : null,
        };
      });

      setChildren(childrenWithAttendance);
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance data',
        variant: 'destructive',
      });
    }
  };

  const loadMonthlyStats = async () => {
    if (!profile?.provider_id) return;

    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const records = await getAttendanceRecords(
        profile.provider_id,
        firstDayOfMonth,
        lastDayOfMonth
      );

      // Count unique days with attendance
      const daysWithAttendance = new Set(
        records.map((r: any) => new Date(r.check_in_time).toDateString())
      );

      const totalDays = lastDayOfMonth.getDate();
      const present = daysWithAttendance.size;
      const absent = totalDays - present;

      setMonthlyStats({ totalDays, present, absent });
    } catch (error) {
      console.error('Error loading monthly stats:', error);
    }
  };

  const isToday = (d: Date) => {
    const now = new Date();
    return d.toDateString() === now.toDateString();
  };

  const isSelected = (d: Date) => d.toDateString() === selectedDay.toDateString();

  const checkedInCount = children.filter((c) => c.checkedIn).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-20 space-y-6">
      {/* Week strip */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <p className="text-sm font-medium text-foreground">
          {days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
          {days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="p-1">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Day bubbles */}
      <div className="flex justify-between mb-6">
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => setSelectedDay(day)}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
              isSelected(day)
                ? "bg-primary text-primary-foreground"
                : isToday(day)
                ? "bg-primary/10"
                : ""
            }`}
          >
            <span
              className={`text-[10px] font-medium ${
                isSelected(day) ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
            </span>
            <span
              className={`text-sm font-bold ${
                isSelected(day) ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              {day.getDate()}
            </span>
          </button>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-light-sage/30 rounded-2xl p-4 text-center border border-accent/10">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/20"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-accent"
                strokeDasharray={`${
                  (monthlyStats.present / monthlyStats.totalDays) * 97.4
                } 97.4`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
              {monthlyStats.present}
            </span>
          </div>
          <p className="text-xs font-medium text-foreground">Days Active</p>
          <p className="text-[10px] text-muted-foreground">
            of {monthlyStats.totalDays} days
          </p>
        </div>

        <div className="bg-light-coral/20 rounded-2xl p-4 text-center border border-primary/10">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/20"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
                strokeDasharray={`${
                  (checkedInCount / (children.length || 1)) * 97.4
                } 97.4`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
              {checkedInCount}
            </span>
          </div>
          <p className="text-xs font-medium text-foreground">Checked In</p>
          <p className="text-[10px] text-muted-foreground">
            of {children.length} children
          </p>
        </div>
      </div>

      {/* Daily log header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {selectedDay.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </h3>
        <Badge variant="secondary" className="rounded-full text-xs">
          {checkedInCount}/{children.length}
        </Badge>
      </div>

      {/* Children attendance log */}
      <div className="space-y-2">
        {children.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No children assigned to this provider
          </p>
        ) : (
          children.map((child) => (
            <div
              key={child.id}
              className={`rounded-2xl p-3 border flex items-center gap-3 transition-all ${
                child.attendance
                  ? "bg-light-sage/20 border-accent/15"
                  : "bg-popover border-border"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                {child.photo_url ? (
                  <img
                    src={child.photo_url}
                    alt={`${child.first_name} ${child.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold">
                    {child.first_name[0]}
                    {child.last_name[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {child.first_name} {child.last_name}
                </p>
                {child.attendance && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        In: {child.checkInTime}
                      </span>
                    </div>
                    {child.checkOutTime && (
                      <span className="text-xs text-muted-foreground">
                        · Out: {child.checkOutTime}
                      </span>
                    )}
                    {child.attendance.check_in_latitude &&
                      child.attendance.check_in_longitude && (
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                      )}
                  </div>
                )}
              </div>
              <Badge
                variant={child.attendance ? "default" : "outline"}
                className={`rounded-full text-[10px] px-2 ${
                  child.attendance ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                {child.attendance
                  ? child.checkOutTime
                    ? "Completed"
                    : "Present"
                  : "Absent"}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
