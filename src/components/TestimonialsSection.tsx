import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    quote: "There's a good match out there for everybody. Make sure you talk to a few people and find somebody you connect with.",
    name: "Virginia",
    detail: "OBGYN, mom, loves getting out for a run on the weekends",
  },
  {
    quote: "NeighborSchools made it so easy to find the perfect daycare. I felt confident in my choice from day one.",
    name: "Sarah",
    detail: "Software engineer, mom of two, Boston, MA",
  },
  {
    quote: "The personalized recommendations saved us weeks of searching. Our son loves his new daycare provider!",
    name: "Marcus",
    detail: "Teacher, dad, weekend gardener",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground mb-10 text-center">
            A word of advice from parents like you
          </h2>

          <div className="bg-popover rounded-xl p-8 md:p-12 border border-border relative">
            <Quote className="w-10 h-10 text-muted-foreground/30 mb-4" />
            <p className="text-lg md:text-xl text-foreground leading-relaxed font-heading italic">
              {testimonials[current].quote}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[current].detail}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrent((current + 1) % testimonials.length)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Dots */}
            <div className="flex gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-foreground" : "bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
