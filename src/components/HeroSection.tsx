import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";

const HeroSection = () => {
  return (
    <section className="relative bg-secondary overflow-hidden">
      {/* Decorative sage hills */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-light-sage rounded-t-[50%] scale-x-150" />
      
      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] leading-tight text-foreground">
              Let's find a really{" "}
              <br className="hidden md:block" />
              good daycare for you
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
              Take our 5-minute quiz to get daycare recommendations that match your preferences, daily routines, and what matters most to you.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/quiz" className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity">
                See 3 Recommendations
              </Link>
              <span className="text-sm text-muted-foreground italic font-body">
                ← 100% free btw
              </span>
            </div>

            {/* Press logos */}
            <div className="flex items-center gap-6 pt-4 opacity-40">
              {["TIME", "Working Mother", "Bloomberg", "Business Insider", "TechCrunch"].map((name) => (
                <span key={name} className="text-xs font-semibold text-foreground tracking-wide uppercase">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Right illustration */}
          <div className="flex justify-center md:justify-end">
            <img
              src={heroIllustration}
              alt="Parents and children illustration"
              width={1024}
              height={768}
              className="w-full max-w-lg object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
