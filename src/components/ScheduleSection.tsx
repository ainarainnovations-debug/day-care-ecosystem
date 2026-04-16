import { Clock, Sun, Moon, CalendarDays, Briefcase, Home } from "lucide-react";

const options = [
  { icon: Clock, label: "Early drop off" },
  { icon: Clock, label: "Late pick-up" },
  { icon: Sun, label: "Mornings only" },
  { icon: Moon, label: "Afternoons only" },
  { icon: Briefcase, label: "Part-time" },
  { icon: CalendarDays, label: "Weekend care" },
];

const ScheduleSection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl text-foreground mb-3">
          Daycares & preschools options for every schedule
        </h2>
        <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
          Find child care that fits your schedule, and your budget, in your neighborhood
        </p>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 max-w-3xl mx-auto">
          {options.map((opt) => (
            <div key={opt.label} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-sage transition-colors">
                <opt.icon className="w-6 h-6 text-sage" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
