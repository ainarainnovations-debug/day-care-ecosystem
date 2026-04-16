import { useState, useEffect } from "react";
import { Coffee, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  clockIn,
  clockOut,
  getCurrentTimeEntry,
  getTimeEntries,
  getTeacherProfile,
  updateTimeEntry,
} from "@/lib/teacherService";
import type { TimeEntry, TeacherProfile } from "@/types/teacher";

const TeacherPunchClock = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [weeklyEntries, setWeeklyEntries] = useState<TimeEntry[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const profile = await getTeacherProfile(user.id);
    setTeacherProfile(profile);
    const entry = await getCurrentTimeEntry(user.id);
    setCurrentEntry(entry);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const entries = await getTimeEntries(user.id, startOfWeek);
    setWeeklyEntries(entries);
  };

  const getLocation = (): Promise<{ lat: number; lng: number } | undefined> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(undefined);
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(undefined),
        { timeout: 5000 }
      );
    });

  const handlePunch = async () => {
    if (isPunchedIn) {
      if (!currentEntry) return;
      setLoading(true);
      if (isOnBreak && breakStart) {
        const extra = Math.floor((Date.now() - breakStart.getTime()) / 60000);
        await updateTimeEntry(currentEntry.id, { break_duration_minutes: breakMinutes + extra });
      }
      const location = await getLocation();
      const entry = await clockOut(currentEntry.id, location);
      if (entry) {
        setCurrentEntry(null);
        setIsOnBreak(false);
        setBreakMinutes(0);
        setBreakStart(null);
        toast({ title: "Clocked Out! 👋", description: `Worked ${entry.total_hours?.toFixed(1) || 0}h` });
        await loadData();
      } else {
        toast({ title: "Error", description: "Failed to clock out.", variant: "destructive" });
      }
      setLoading(false);
    } else {
      if (!user || !teacherProfile) return;
      setLoading(true);
      const location = await getLocation();
      const entry = await clockIn(user.id, teacherProfile.provider_id, location);
      if (entry) {
        setCurrentEntry(entry);
        toast({ title: "Clocked In! ✅", description: `Started at ${new Date(entry.clock_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` });
      } else {
        toast({ title: "Error", description: "Failed to clock in.", variant: "destructive" });
      }
      setLoading(false);
    }
  };

  const handleBreakToggle = async () => {
    if (!currentEntry) return;
    if (!isOnBreak) {
      setIsOnBreak(true);
      setBreakStart(new Date());
      toast({ title: "Break started ☕" });
    } else {
      if (breakStart) {
        const dur = Math.floor((Date.now() - breakStart.getTime()) / 60000);
        const total = breakMinutes + dur;
        setBreakMinutes(total);
        await updateTimeEntry(currentEntry.id, { break_duration_minutes: total });
        toast({ title: "Break ended 🍽️", description: `${dur} min break` });
      }
      setIsOnBreak(false);
      setBreakStart(null);
    }
  };

  const isPunchedIn = !!currentEntry;

  const formatDuration = (start: string) => {
    const ms = Date.now() - new Date(start).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const weekTotals = weeklyEntries.reduce(
    (acc, e) => ({
      hours: acc.hours + (e.total_hours || 0),
      earnings: acc.earnings + (e.gross_pay || 0),
    }),
    { hours: 0, earnings: 0 }
  );

  const timeStr = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="px-4 pt-6 pb-6 flex flex-col items-center">
      {/* Date & time display */}
      <p className="text-sm text-muted-foreground mb-1">{dateStr}</p>
      <p className="text-4xl font-bold text-foreground tracking-tight mb-6 font-mono">{timeStr}</p>

      {/* Big circular punch button */}
      <button
        onClick={handlePunch}
        disabled={loading}
        className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 mb-4 ${
          isPunchedIn
            ? "bg-destructive/90 text-destructive-foreground shadow-destructive/30"
            : "bg-primary text-primary-foreground shadow-primary/30"
        } ${loading ? "opacity-60" : ""}`}
      >
        <span className="text-5xl mb-1">{isPunchedIn ? "🛑" : "👆"}</span>
        <span className="text-lg font-bold">{loading ? "..." : isPunchedIn ? "Check Out" : "Check In"}</span>
      </button>

      {/* Status info */}
      {isPunchedIn && currentEntry && (
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">
            {isOnBreak ? "On break" : "Working"} · {formatDuration(currentEntry.clock_in_time)}
          </p>
          {currentEntry.clock_in_lat && (
            <p className="text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 inline mr-0.5" /> Location tracked
            </p>
          )}
        </div>
      )}

      {/* Break button */}
      {isPunchedIn && (
        <Button
          onClick={handleBreakToggle}
          variant="outline"
          size="sm"
          className="rounded-full px-6 mb-6"
        >
          <Coffee className="w-4 h-4 mr-2" />
          {isOnBreak ? "End Break" : "Lunch Break"}
          {breakMinutes > 0 && ` (${breakMinutes}m)`}
        </Button>
      )}

      {!isPunchedIn && <div className="mb-6" />}

      {/* Weekly summary cards */}
      <div className="w-full grid grid-cols-3 gap-3">
        <div className="bg-popover rounded-2xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{weekTotals.hours.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Hours</p>
        </div>
        <div className="bg-popover rounded-2xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">${weekTotals.earnings.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Earned</p>
        </div>
        <div className="bg-popover rounded-2xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{weeklyEntries.length}</p>
          <p className="text-xs text-muted-foreground">Shifts</p>
        </div>
      </div>

      {/* Recent entries */}
      {weeklyEntries.length > 0 && (
        <div className="w-full mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Recent</h3>
          {weeklyEntries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-xl">
              <span className="text-sm text-foreground">
                {new Date(entry.clock_in_time).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span className="text-sm font-semibold text-foreground">{entry.total_hours?.toFixed(1) || "—"}h</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherPunchClock;
