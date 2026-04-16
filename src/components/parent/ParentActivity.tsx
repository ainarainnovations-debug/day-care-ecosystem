import { useState } from "react";
import { ArrowLeft, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { getChildPhoto } from "@/assets/childPhotos";

interface ParentActivityProps {
  onBack?: () => void;
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const moodEmojis = ["😊", "🤩", "🤩", "❤️", "😐", "😐", "😐"];

const activityFeed = [
  {
    type: "teacher",
    name: "Sara",
    role: "Teacher",
    time: "10:31 AM",
    text: "Sophia's enjoyed painting today. Look at her masterpiece",
  },
  {
    type: "daily_report",
    label: "daily report",
    time: "11:31 AM",
    text: "Nap Sophia is currently napping peacefully.",
  },
  {
    type: "daily_report",
    label: "daily report",
    time: "11:31 AM",
    text: "Meal Breakfast ( Oatmeal & Fruit ) Ate well",
  },
  {
    type: "announcement",
    label: "Center Announcement",
    time: "11:31 AM",
    text: "Reminder Daycare will be closed on July 4th for the holiday.",
  },
  {
    type: "system",
    label: "System Notification",
    time: "11:31 AM",
    text: "Sophia Johnson has been successfully checked in.",
  },
];

const ParentActivity = ({ onBack }: ParentActivityProps) => {
  const [selectedDay, setSelectedDay] = useState(3); // Thursday

  return (
    <div className="px-4 pt-4">

      {/* Child Info */}
      <div className="flex items-center gap-3 mb-5">
        <img src={getChildPhoto("Sophia")} alt="Sophia" className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h2 className="font-heading font-semibold text-foreground">Sophia Johnson</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>📅</span> Date of Birth · July 16, 2025
          </div>
        </div>
      </div>

      {/* Day Navigator */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <ChevronLeft className="w-4 h-4 text-primary cursor-pointer" />
        <span className="font-heading font-semibold text-primary">Thursday</span>
        <span className="text-sm text-muted-foreground">July 16</span>
        <ChevronRight className="w-4 h-4 text-primary cursor-pointer" />
      </div>

      {/* Mood Day Selector */}
      <div className="flex gap-2 justify-between mb-5 px-1">
        {daysOfWeek.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(i)}
            className={`flex flex-col items-center min-w-[42px] py-2.5 px-1.5 rounded-xl transition-all ${
              selectedDay === i
                ? "bg-primary/10 ring-2 ring-primary"
                : "bg-card"
            }`}
          >
            <span className="text-xl mb-0.5">{moodEmojis[i]}</span>
            <span className="text-xs font-semibold text-foreground">{12 + i}</span>
            <span className="text-[10px] text-muted-foreground">{day.toLowerCase()}</span>
          </button>
        ))}
      </div>

      {/* Check-in / Check-out Card */}
      <div className="bg-popover rounded-2xl border border-border p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          {/* Check In */}
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-accent" />
            <div>
              <span className="text-xs text-muted-foreground block">Check_In</span>
              <span className="text-xl font-bold text-foreground leading-tight">8:00<br/><span className="text-lg">AM</span></span>
            </div>
          </div>
          {/* Check Out */}
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Check_Out</span>
              <span className="text-xl font-bold text-foreground leading-tight">12:00<br/><span className="text-lg">AM</span></span>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">👤</span>
            <span className="text-sm text-muted-foreground">Authorized</span>
          </div>
          <span className="font-heading font-semibold text-foreground">Jane Doe</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-secondary/50 rounded-xl p-3 mb-6">
        <h3 className="font-heading font-semibold text-foreground mb-3 px-1">Activity</h3>
        <div className="space-y-3">
          {activityFeed.map((item, i) => (
            <div key={i} className="bg-popover rounded-xl p-4">
              {item.type === "teacher" ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-light-sage flex items-center justify-center text-sm">👩‍🏫</div>
                    <span className="font-semibold text-sm text-foreground">{item.name}</span>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{item.role}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{item.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </>
              ) : (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">📋</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${
                        item.type === "announcement" ? "text-accent" :
                        item.type === "system" ? "text-destructive" :
                        "text-primary"
                      }`}>{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentActivity;
