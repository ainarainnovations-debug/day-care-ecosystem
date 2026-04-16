import { useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";

interface ParentEventsProps {
  onBack?: () => void;
}

const seasons = ["Spr 2025", "Sum 2025", "Fall 2025"];

const events = [
  {
    id: 1,
    title: "Field Trip To Zoo",
    month: "Jun",
    day: 12,
    dayOfWeek: "Monday",
    date: "July 16",
    time: "08:00 AM - 10:00 AM",
    description: "Snack Provided lunch at zoo. Bring hat water bottle, comfy shoes. apply sunscreen",
    accentColor: "bg-primary",
  },
  {
    id: 2,
    title: "Parent meeting",
    month: "Jul",
    day: 12,
    dayOfWeek: "Monday",
    date: "July 16",
    time: "18:00 - 22:00",
    description: "Snack Provided lunch at zoo. Bring hat water bottle, comfy shoes. apply sunscreen",
    accentColor: "bg-accent",
  },
  {
    id: 3,
    title: "Father's day crafting",
    month: "Aug",
    day: 12,
    dayOfWeek: "Monday",
    date: "July 16",
    time: "18:00 - 22:00",
    description: "Snack Provided lunch at zoo. Bring hat water bottle, comfy shoes. apply sunscreen",
    accentColor: "bg-primary",
  },
  {
    id: 4,
    title: "Baking Cookies",
    month: "Jun",
    day: 12,
    dayOfWeek: "Monday",
    date: "July 16",
    time: "18:00 - 22:00",
    description: "Snack Provided lunch at zoo. Bring hat water bottle, comfy shoes. apply sunscreen",
    accentColor: "bg-accent",
  },
];

const ParentEvents = ({ onBack }: ParentEventsProps) => {
  const [activeSeason, setActiveSeason] = useState(1); // Summer

  return (
    <div className="px-4 pt-4">

      {/* Season Tabs */}
      <div className="flex items-center justify-center gap-6 mb-6">
        {seasons.map((s, i) => (
          <button
            key={s}
            onClick={() => setActiveSeason(i)}
            className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
              activeSeason === i
                ? "bg-popover border border-border font-bold text-primary shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4 mb-6">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3">
            {/* Date Column */}
            <div className="flex flex-col items-center pt-3 min-w-[40px]">
              <div className={`w-2.5 h-2.5 rounded-full ${event.accentColor} mb-1.5`} />
              <span className="text-xs text-muted-foreground">{event.month}</span>
              <span className="text-lg font-bold text-foreground">{event.day}</span>
            </div>

            {/* Event Card */}
            <div className="flex-1 bg-card border border-border rounded-2xl p-4 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-heading font-semibold text-foreground mb-1">{event.title}</h3>
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {event.dayOfWeek} · {event.date} · {event.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentEvents;
