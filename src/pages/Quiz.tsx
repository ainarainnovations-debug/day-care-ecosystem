import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ChevronLeft, ChevronRight, MapPin, Baby, Clock, BookOpen, Languages, Heart, BadgeCheck, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizStep {
  id: string;
  question: string;
  subtitle?: string;
  type: "single" | "multi" | "text";
  options?: { label: string; icon?: any; description?: string }[];
}

const quizSteps: QuizStep[] = [
  {
    id: "location",
    question: "Where are you looking for child care?",
    subtitle: "We'll find daycares near you",
    type: "text",
  },
  {
    id: "child_age",
    question: "How old is your child?",
    subtitle: "This helps us find the right fit",
    type: "single",
    options: [
      { label: "Infant (0-14 months)", icon: Baby, description: "Newborn to early walkers" },
      { label: "Toddler (15-23 months)", icon: Baby, description: "Walking and exploring" },
      { label: "Preschool (2-4 years)", icon: BookOpen, description: "Getting ready to learn" },
      { label: "School age (5+)", icon: BookOpen, description: "Before & after school" },
    ],
  },
  {
    id: "schedule",
    question: "What schedule works best for you?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { label: "Full-time (5 days)", icon: Clock },
      { label: "Part-time", icon: Clock },
      { label: "Early drop off", icon: Clock },
      { label: "Late pick-up", icon: Clock },
      { label: "Weekends", icon: Clock },
    ],
  },
  {
    id: "priorities",
    question: "What matters most to you?",
    subtitle: "Select up to 3",
    type: "multi",
    options: [
      { label: "Play-based learning", icon: Heart },
      { label: "Montessori curriculum", icon: BookOpen },
      { label: "Bilingual program", icon: Languages },
      { label: "Small group sizes", icon: Baby },
      { label: "Outdoor activities", icon: Heart },
      { label: "Close to home", icon: MapPin },
    ],
  },
  {
    id: "start_date",
    question: "When do you need care to start?",
    type: "single",
    options: [
      { label: "As soon as possible" },
      { label: "Within 1 month" },
      { label: "Within 3 months" },
      { label: "Just exploring" },
    ],
  },
];

const matchResults = [
  {
    name: "Ms. Valeria",
    slug: "ms-coren",
    type: "Licensed home daycare",
    tagline: "A bi-lingual english-spanish program focused on developing the whole child.",
    match: true,
    distance: "1.7 miles",
    hours: "8:00 - 5:00",
    rate: "$65",
    rateNote: "/day for part-time infants",
    spots: "1 infant spot",
    nextAvailable: "September 1st",
    reasons: [
      { title: "Play based approach", desc: "Great for parents who want children to learn through self exploration and games." },
      { title: "Bilingual English-Spanish", desc: "Young children have a magical way of learning languages — starting off in a dual language..." },
    ],
  },
  {
    name: "Ms. Martha",
    slug: "ms-mahmuda",
    type: "Licensed home daycare",
    tagline: "A nurturing environment with focus on creative arts and emotional development.",
    match: true,
    distance: "2.3 miles",
    hours: "7:30 - 5:30",
    rate: "$60",
    rateNote: "/day for part-time infants",
    spots: "2 infant spots",
    nextAvailable: "October 1st",
    reasons: [
      { title: "Creative arts focus", desc: "Children explore painting, music, and dramatic play daily." },
      { title: "Small group sizes", desc: "Maximum 6 children ensures personalized attention." },
    ],
  },
  {
    name: "Ms. Deb",
    slug: "ms-coren",
    type: "Licensed home daycare",
    tagline: "Structured learning with strong focus on school readiness and social skills.",
    match: false,
    distance: "3.1 miles",
    hours: "8:00 - 4:30",
    rate: "$55",
    rateNote: "/day for part-time toddlers",
    spots: "1 toddler spot",
    nextAvailable: "August 15th",
    reasons: [
      { title: "School readiness", desc: "Preparing children for kindergarten with structured activities." },
      { title: "Close to home", desc: "Convenient location for your daily commute." },
    ],
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);
  const [locationInput, setLocationInput] = useState("");

  const step = quizSteps[currentStep];
  const progress = ((currentStep + 1) / quizSteps.length) * 100;

  const handleSelect = (option: string) => {
    if (step.type === "multi") {
      const current = answers[step.id] || [];
      const updated = current.includes(option)
        ? current.filter((o: string) => o !== option)
        : [...current, option];
      setAnswers({ ...answers, [step.id]: updated });
    } else {
      setAnswers({ ...answers, [step.id]: option });
      // Auto advance on single select
      if (currentStep < quizSteps.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 300);
      } else {
        setTimeout(() => setShowResults(true), 300);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (showResults) {
    const result = matchResults[selectedResult];
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        {/* Personalized greeting */}
        <section className="bg-navy text-popover py-8">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-sage/30 flex items-center justify-center">
                <Heart className="w-8 h-8 text-popover" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading">Hey there 👋</h1>
                <p className="text-sm opacity-80 mt-1 max-w-xl">
                  Check out your recommendations below — looks like we have at least one good match for you. Any questions? Your child care coach is always available to help.
                </p>
              </div>
              <div className="hidden md:block ml-auto bg-popover/10 rounded-lg px-4 py-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider">Touring Phase</p>
                <p className="text-xs opacity-60">Start exploring</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs for results */}
        <section className="bg-secondary border-b border-border">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center gap-2 py-4 overflow-x-auto">
              {matchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedResult(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedResult === i
                      ? "bg-card border border-border text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.match ? (
                    <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <svg className="w-3 h-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-destructive" />
                    </span>
                  )}
                  {r.name}'s
                </button>
              ))}
              <button className="ml-auto border border-foreground text-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-foreground hover:text-background transition-colors whitespace-nowrap">
                Why these 3?
              </button>
            </div>
          </div>
        </section>

        {/* Selected result detail */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                {result.match && (
                  <span className="text-xs text-accent font-semibold">● Tour offered</span>
                )}
                <h2 className="text-3xl md:text-4xl font-heading text-foreground">{result.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{result.tagline}</p>
                <div className="flex gap-3">
                  <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider">
                    Arrange a Tour
                  </button>
                  <button
                    onClick={() => navigate(`/provider/${result.slug}`)}
                    className="border border-foreground text-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground hover:text-background transition-colors"
                  >
                    See More Details
                  </button>
                </div>
              </div>
              <div className="bg-muted rounded-xl aspect-[4/3] flex items-center justify-center">
                <Heart className="w-16 h-16 text-sage opacity-30" />
              </div>
            </div>
          </div>
        </section>

        {/* Recommended because */}
        <section className="py-8 md:py-12 bg-secondary">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl md:text-3xl font-heading text-foreground italic mb-6">
              Recommended for you because...
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {result.reasons.map((reason, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                      {reason.title}
                      {i === 0 && <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"><svg className="w-3 h-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{reason.desc}</p>
                  </div>
                  <Baby className="w-8 h-8 text-sage shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Availability bar */}
        <section className="bg-[hsl(var(--light-coral))] border-y border-border">
          <div className="container mx-auto px-4 md:px-8 py-6">
            <p className="font-heading font-semibold text-foreground text-lg mb-4">
              Next Spot Available - {result.nextAvailable}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <MapPin className="w-6 h-6 text-sage mx-auto mb-1" />
                <p className="font-semibold text-foreground">{result.distance}</p>
                <p className="text-xs text-muted-foreground">From 02139</p>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 text-sage mx-auto mb-1" />
                <p className="font-semibold text-foreground">{result.hours}</p>
                <p className="text-xs text-muted-foreground">Working hours</p>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 text-sage mx-auto mb-1" />
                <p className="font-semibold text-foreground">{result.rate}</p>
                <p className="text-xs text-muted-foreground">{result.rateNote}</p>
              </div>
              <div className="text-center">
                <Baby className="w-6 h-6 text-sage mx-auto mb-1" />
                <p className="font-semibold text-foreground">{result.spots}</p>
                <p className="text-xs text-muted-foreground">as of April 1st</p>
              </div>
            </div>
          </div>
        </section>

        {/* Back to home */}
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <button onClick={() => navigate("/")} className="text-sm text-primary font-semibold underline">
              ← Back to Home
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {quizSteps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-heading text-foreground mb-2">{step.question}</h1>
            {step.subtitle && (
              <p className="text-sm text-muted-foreground">{step.subtitle}</p>
            )}
          </div>

          {/* Input */}
          {step.type === "text" ? (
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter your zip code or city"
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    setAnswers({ ...answers, [step.id]: e.target.value });
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={handleNext}
                disabled={!locationInput.trim()}
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold text-sm uppercase tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Continue <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {step.options?.map((option) => {
                const isSelected = step.type === "multi"
                  ? (answers[step.id] || []).includes(option.label)
                  : answers[step.id] === option.label;

                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelect(option.label)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                      isSelected
                        ? "border-primary bg-light-coral shadow-sm"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    {option.icon && <option.icon className="w-5 h-5 text-sage shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{option.label}</p>
                      {option.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-primary bg-primary" : "border-border"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}

              {step.type === "multi" && (
                <button
                  onClick={handleNext}
                  disabled={!(answers[step.id]?.length > 0)}
                  className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-full font-semibold text-sm uppercase tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  Continue <ChevronRight className="w-4 h-4 inline ml-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
