import { ClipboardList, Home, CalendarCheck } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Tell us what matters to you",
    icon: ClipboardList,
  },
  {
    number: 2,
    title: "Get your recommendations",
    icon: Home,
  },
  {
    number: 3,
    title: "Arrange a tour, review options",
    icon: CalendarCheck,
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-secondary py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-popover rounded-xl p-8 relative shadow-sm border border-border"
            >
              <div className="absolute -top-3 left-6 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {step.number}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex gap-1 text-sage">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  {step.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
