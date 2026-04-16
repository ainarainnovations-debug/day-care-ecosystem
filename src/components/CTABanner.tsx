import { Link } from "react-router-dom";

const CTABanner = () => {
  return (
    <section className="bg-muted py-10">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-foreground text-lg md:text-xl font-heading text-center md:text-left">
          Finding really good child care can be hard. We make it a whole lot easier.
        </p>
        <Link to="/quiz" className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap">
          Get Started
        </Link>
      </div>
    </section>
  );
};

export default CTABanner;
