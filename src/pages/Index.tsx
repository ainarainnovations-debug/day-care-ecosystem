import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import CTABanner from "@/components/CTABanner";
import MatchesSection from "@/components/MatchesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ScheduleSection from "@/components/ScheduleSection";
import FAQSection from "@/components/FAQSection";
import FounderNote from "@/components/FounderNote";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <CTABanner />
      <MatchesSection />
      <TestimonialsSection />
      <ScheduleSection />
      <FounderNote />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
