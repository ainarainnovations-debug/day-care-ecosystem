import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, startOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ViewMode = "day" | "week" | "month";
type BookingType = "full_day" | "half_day" | "hourly";

interface ScheduleBooking {
  id: string;
  childName: string;
  parentName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: BookingType;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  notes?: string;
}

// Mock data
const mockBookings: ScheduleBooking[] = [
  { id: "1", childName: "Emma S.", parentName: "Sarah Smith", date: "2026-04-13", startTime: "07:00", endTime: "15:00", type: "full_day", status: "confirmed" },
  { id: "2", childName: "Noah T.", parentName: "Jessica Taylor", date: "2026-04-13", startTime: "08:00", endTime: "12:00", type: "half_day", status: "confirmed" },
  { id: "3", childName: "Olivia R.", parentName: "Michael Rodriguez", date: "2026-04-14", startTime: "07:30", endTime: "16:00", type: "full_day", status: "pending" },
  { id: "4", childName: "Liam K.", parentName: "Amanda Kim", date: "2026-04-14", startTime: "13:00", endTime: "17:00", type: "half_day", status: "confirmed" },
  { id: "5", childName: "Ava M.", parentName: "David Martinez", date: "2026-04-15", startTime: "09:00", endTime: "11:00", type: "hourly", status: "confirmed" },
  { id: "6", childName: "Sophia C.", parentName: "Lisa Chen", date: "2026-04-16", startTime: "07:00", endTime: "15:00", type: "full_day", status: "completed" },
  { id: "7", childName: "Ethan J.", parentName: "Mark Johnson", date: "2026-04-17", startTime: "08:00", endTime: "14:00", type: "full_day", status: "confirmed" },
  { id: "8", childName: "Mia W.", parentName: "Rachel Wilson", date: "2026-04-18", startTime: "10:00", endTime: "16:00", type: "full_day", status: "pending" },
  { id: "9", childName: "Lucas B.", parentName: "Tom Brown", date: "2026-04-15", startTime: "13:00", endTime: "16:30", type: "half_day", status: "confirmed" },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 6); // 6 AM to 5 PM

const typeColors: Record<BookingType, { bg: string; border: string; text: string }> = {
  full_day: { bg: "bg-accent/15", border: "border-accent/30", text: "text-accent" },
  half_day: { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
  hourly: { bg: "bg-[hsl(var(--sage))]/10", border: "border-[hsl(var(--sage))]/30", text: "text-[hsl(var(--sage))]" },
};

const typeLabels: Record<BookingType, string> = {
  full_day: "Full Day",
  half_day: "Half Day",
  hourly: "Hourly",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-accent text-accent-foreground",
  pending: "bg-secondary text-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

const timeToPosition = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return ((h - 6) + m / 60); // hours from 6 AM
};

const BookingSchedule = () => {
  const [view, setView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 13)); // April 13, 2026
  const [filter, setFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<ScheduleBooking | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigate = (dir: number) => {
    if (view === "week") setCurrentDate(dir > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, dir));
    else setCurrentDate(dir > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const filteredBookings = useMemo(() => {
    if (filter === "all") return mockBookings;
    return mockBookings.filter(b => b.type === filter);
  }, [filter]);

  const getBookingsForDay = (date: Date) =>
    filteredBookings.filter(b => isSameDay(new Date(b.date), date));

  const dateLabel = useMemo(() => {
    if (view === "day") return format(currentDate, "d MMMM, yyyy");
    if (view === "week") return `${format(weekStart, "d MMM")} - ${format(addDays(weekStart, 6), "d MMM, yyyy")}`;
    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view, weekStart]);

  // Now indicator
  const now = new Date();
  const nowHour = now.getHours();
  const nowMin = now.getMinutes();
  const nowPosition = ((nowHour - 6) + nowMin / 60);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <h2 className="font-heading text-lg font-semibold text-foreground min-w-[220px] text-center">{dateLabel}</h2>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-secondary rounded-lg p-1">
            {(["day", "week", "month"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                  view === v ? "bg-popover text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "day" ? "Day View" : v === "week" ? "Week View" : "Month View"}
              </button>
            ))}
          </div>

          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Show All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Show All</SelectItem>
              <SelectItem value="full_day">Full Day only</SelectItem>
              <SelectItem value="half_day">Half Day only</SelectItem>
              <SelectItem value="hourly">Hourly only</SelectItem>
            </SelectContent>
          </Select>

          <Button className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Add Booking
          </Button>
        </div>
      </div>

      {/* Calendar Views */}
      {view === "week" && (
        <div className="bg-popover rounded-xl border border-border overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border">
            <div className="p-2" />
            {weekDays.map(day => (
              <div key={day.toISOString()} className={`p-3 text-center border-l border-border ${isToday(day) ? "bg-primary/5" : ""}`}>
                <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                <div className={`text-lg font-semibold ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative grid grid-cols-[80px_repeat(7,1fr)]" style={{ height: `${HOURS.length * 64}px` }}>
            {/* Time labels */}
            <div className="relative">
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute w-full text-right pr-3 text-xs text-muted-foreground"
                  style={{ top: `${(h - 6) * 64}px`, transform: "translateY(-6px)" }}
                >
                  {h === 12 ? "12 pm" : h < 12 ? `${h} am` : `${h - 12} pm`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIdx) => (
              <div key={day.toISOString()} className="relative border-l border-border">
                {/* Hour lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/50"
                    style={{ top: `${(h - 6) * 64}px` }}
                  />
                ))}

                {/* Now indicator */}
                {isToday(day) && nowHour >= 6 && nowHour < 18 && (
                  <div
                    className="absolute w-full z-20 flex items-center"
                    style={{ top: `${nowPosition * 64}px` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary -ml-1" />
                    <div className="flex-1 h-px bg-primary" />
                  </div>
                )}

                {/* Booking cards */}
                {getBookingsForDay(day).map(booking => {
                  const top = timeToPosition(booking.startTime) * 64;
                  const height = (timeToPosition(booking.endTime) - timeToPosition(booking.startTime)) * 64;
                  const colors = typeColors[booking.type];

                  return (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`absolute left-1 right-1 rounded-lg border ${colors.bg} ${colors.border} p-2 overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10 text-left`}
                      style={{ top: `${top}px`, height: `${Math.max(height, 32)}px` }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px]">👶</div>
                        <span className="text-xs font-semibold text-foreground truncate">{booking.childName}</span>
                      </div>
                      {height > 40 && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      )}
                      {height > 56 && (
                        <Badge variant="outline" className={`text-[9px] mt-1 px-1 py-0 ${colors.text} border-current`}>
                          {typeLabels[booking.type]}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "day" && (
        <div className="bg-popover rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-heading font-semibold text-foreground">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>
            <p className="text-sm text-muted-foreground">{getBookingsForDay(currentDate).length} bookings</p>
          </div>

          <div className="relative" style={{ height: `${HOURS.length * 64}px` }}>
            {/* Hour lines */}
            {HOURS.map(h => (
              <div key={h} className="absolute w-full flex items-start" style={{ top: `${(h - 6) * 64}px` }}>
                <div className="w-20 text-right pr-3 text-xs text-muted-foreground -mt-1.5">
                  {h === 12 ? "12 pm" : h < 12 ? `${h} am` : `${h - 12} pm`}
                </div>
                <div className="flex-1 border-t border-border/50" />
              </div>
            ))}

            {/* Now indicator */}
            {isToday(currentDate) && nowHour >= 6 && nowHour < 18 && (
              <div className="absolute w-full z-20 flex items-center" style={{ top: `${nowPosition * 64}px` }}>
                <div className="w-20" />
                <div className="w-2 h-2 rounded-full bg-primary -ml-1" />
                <div className="flex-1 h-px bg-primary" />
              </div>
            )}

            {/* Booking cards */}
            {getBookingsForDay(currentDate).map((booking, i) => {
              const top = timeToPosition(booking.startTime) * 64;
              const height = (timeToPosition(booking.endTime) - timeToPosition(booking.startTime)) * 64;
              const colors = typeColors[booking.type];

              return (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`absolute rounded-lg border ${colors.bg} ${colors.border} p-3 overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10 text-left`}
                  style={{ top: `${top}px`, height: `${Math.max(height, 40)}px`, left: `calc(80px + ${i * 10}px)`, right: "16px" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-sm">👶</div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">{booking.childName}</span>
                      <span className="text-xs text-muted-foreground ml-2">{booking.parentName}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {booking.startTime} - {booking.endTime} &nbsp;·&nbsp;
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colors.text} border-current`}>
                      {typeLabels[booking.type]}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === "month" && (
        <div className="bg-popover rounded-xl border border-border overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {(() => {
              const monthStart = startOfMonth(currentDate);
              const monthEnd = endOfMonth(currentDate);
              const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
              const calEnd = addDays(startOfWeek(addDays(monthEnd, 6), { weekStartsOn: 1 }), -1);
              const days = eachDayOfInterval({ start: calStart, end: calEnd });

              return days.map(day => {
                const dayBookings = getBookingsForDay(day);
                const inMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => { setCurrentDate(day); setView("day"); }}
                    className={`min-h-[100px] p-2 border-b border-r border-border cursor-pointer hover:bg-secondary/50 transition-colors ${
                      !inMonth ? "opacity-40" : ""
                    } ${isToday(day) ? "bg-primary/5" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map(b => {
                        const colors = typeColors[b.type];
                        return (
                          <div
                            key={b.id}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} truncate`}
                            onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                          >
                            {b.childName} · {b.startTime}
                          </div>
                        );
                      })}
                      {dayBookings.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{dayBookings.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">👶</div>
              {selectedBooking?.childName}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 mt-2">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parent</span>
                  <span className="text-foreground font-medium">{selectedBooking.parentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-foreground font-medium">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground font-medium">{format(new Date(selectedBooking.date), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className={`${typeColors[selectedBooking.type].text} border-current`}>
                    {typeLabels[selectedBooking.type]}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={statusColors[selectedBooking.status]}>{selectedBooking.status}</Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">Message Parent</Button>
                <Button className="flex-1 bg-primary text-primary-foreground">View Details</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingSchedule;
