import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnrollmentApplyButton from "@/components/EnrollmentApplyButton";
import { Heart, MapPin, BadgeCheck, Share2, Star, ChevronRight, Baby, BookOpen, Palette, Music, TreePine, Cookie } from "lucide-react";

const providerData: Record<string, any> = {
  "ms-coren": {
    name: "Ms. Coren",
    type: "Licensed home daycare",
    location: "Mattapan, MA",
    tagline: "A bi-lingual english-spanish program focused on developing the whole child.",
    license: "#2039824",
    priorExperience: [
      "Assistant Teacher @ Little Sprouts Preschool — 2 years experience with infants & toddlers",
      "Daycare Assistant @ Home Daycare — 3 years",
    ],
    greatFor: [
      { icon: BookOpen, title: "Montessori Curriculum", desc: "This approach is about creating the right environment and being there to support child-led discovery." },
      { icon: Palette, title: "Play-Based Learning", desc: "It's all fun and games as children develop a love of learning through play at this daycare." },
      { icon: Baby, title: "Infant Care", desc: "Infant spots can be the hardest to find because each daycare usually just takes two at a time." },
    ],
    activities: [
      { icon: Cookie, name: "Snack time" },
      { icon: TreePine, name: "Playing outside" },
      { icon: Music, name: "Trampoline" },
      { icon: Palette, name: "Art class" },
      { icon: BookOpen, name: "Story time" },
      { icon: Baby, name: "Sensory play" },
    ],
    qAndA: [
      {
        question: "What inspires you to care for young children?",
        answer: "Every child is 100% unique. They're fascinating so much every single day, and I love supporting their forward's curiosity as they transform the world around them. That's what initially drew me to working with children when my first daughter was born. Through countless small moments of discovery, and from observing and socializing with the children around them, it's amazing to see them start to figure things out and connect the dots — whether it's toddler permanence, how to fasten a fork, or how to fashion toys. It's just a never ending. Through countless small…",
      },
      {
        question: "What's a typical day like at your daycare?",
        answer: "Every child is 100% unique. They're fascinating so much every single day, and I love supporting their forward's curiosity as they transform the world around them. That's what initially drew me to working with children when my first daughter was born. Through countless small moments of discovery, and from observing and socializing with the children around them, it's amazing to see them start to figure things out and connect the dots.",
      },
      {
        question: "What's one thing parents should know about your program?",
        answer: "Every child is 100% unique. They're fascinating so much every single day, and I love supporting their forward's curiosity as they transform the world around them. That's what initially drew me to working with children when my first daughter was born. Through countless small moments of discovery and from observing the children around them.",
      },
    ],
    reviews: [
      { name: "Maria", role: "Mother of two", rating: 5, text: "Lorem ipsum dolor sit amet, consectetur adipiscing eiit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
      { name: "Alice", role: "Mother of two", rating: 5, text: "Lorem ipsum dolor sit amet, consectetur adipiscing tempo incididunt ut labore et dolore magna aliqua." },
      { name: "Danica", role: "Mother of two", rating: 5, text: "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    ],
    rates: {
      description: "Child care rates depend on how old your child is and what your schedule looks like. Part-time is often a higher hourly rate than full time, and infants usually are more than toddlers. Getting a spot also depends on age and schedule because each daycare has a limited number of openings for each age range.",
      ageGroups: [
        { label: "Infant", range: "3 - 14 months" },
        { label: "Toddler", range: "15 - 23 months" },
        { label: "Big kid", range: "24+ months" },
      ],
    },
    address: "119 Lorna Road, Mattapan, MA 02126",
    quote: "Teaching is not about answering questions but about raising questions — opening doors for them in places that they could not imagine.",
  },
  "ms-mahmuda": {
    name: "Ms. Mahmuda",
    type: "Licensed home daycare",
    location: "Dorchester, MA",
    tagline: "A bi-lingual english-spanish program with small group sizes.",
    license: "#2041567",
    priorExperience: [
      "Lead Teacher @ Bright Horizons — 4 years",
      "Home Daycare Provider — 5 years",
    ],
    greatFor: [
      { icon: BookOpen, title: "Montessori Curriculum", desc: "This approach is about creating the right environment and being there to support child-led discovery." },
      { icon: Palette, title: "Play-Based Learning", desc: "Children develop through creative play and hands-on exploration." },
      { icon: Baby, title: "Infant Care", desc: "Specialized care for the youngest learners in a nurturing environment." },
    ],
    activities: [
      { icon: Cookie, name: "Snack time" },
      { icon: TreePine, name: "Playing outside" },
      { icon: Music, name: "Music & dance" },
      { icon: Palette, name: "Art class" },
      { icon: BookOpen, name: "Story time" },
      { icon: Baby, name: "Sensory play" },
    ],
    qAndA: [
      { question: "What inspires you to care for young children?", answer: "I've always been passionate about early childhood education. Watching children discover the world around them and being part of their growth journey is incredibly rewarding." },
      { question: "What's a typical day like at your daycare?", answer: "We start with free play, then move to structured activities including art, music, and outdoor time. We have snack breaks and quiet reading time in the afternoon." },
      { question: "What's one thing parents should know about your program?", answer: "We emphasize bilingual learning from day one. Children are naturally immersed in both English and Spanish throughout their daily activities." },
    ],
    reviews: [
      { name: "Sarah", role: "Mother of one", rating: 5, text: "Ms. Mahmuda is amazing with our daughter. She truly cares about each child's development." },
      { name: "James", role: "Father of two", rating: 5, text: "Best daycare experience we've had. Both our kids love going every day." },
      { name: "Lisa", role: "Mother of three", rating: 5, text: "Highly recommend! The bilingual aspect has been wonderful for our family." },
    ],
    rates: {
      description: "Child care rates depend on how old your child is and what your schedule looks like.",
      ageGroups: [
        { label: "Infant", range: "3 - 14 months" },
        { label: "Toddler", range: "15 - 23 months" },
        { label: "Big kid", range: "24+ months" },
      ],
    },
    address: "45 Blue Hill Ave, Dorchester, MA 02121",
    quote: "Every child is a different kind of flower, and all together, make this world a beautiful garden.",
  },
};

const ProviderDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const provider = providerData[slug || ""] || providerData["ms-coren"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-secondary py-8">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{provider.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Provider photo placeholder */}
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3]">
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-16 h-16 text-sage opacity-30" />
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-popover/90 p-2 rounded-full"><Share2 className="w-4 h-4" /></button>
                <button className="bg-popover/90 p-2 rounded-full"><Heart className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Provider info */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl text-foreground">{provider.name}</h1>
              <p className="text-sm text-sage flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4" /> {provider.type}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {provider.location}
              </p>
              <p className="text-muted-foreground leading-relaxed">{provider.tagline}</p>

              <div className="flex gap-3 pt-2 flex-wrap">
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity">
                  Arrange a Tour
                </button>
                <EnrollmentApplyButton providerId={slug || "ms-coren"} providerName={provider.name} />
                <button className="border border-foreground text-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground hover:text-background transition-colors">
                  See More Details
                </button>
                <Link to={`/claim/${slug}`} className="border border-sage text-sage px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-sage hover:text-background transition-colors">
                  Claim This Daycare
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Great for parents who want... */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl text-foreground mb-8">Great for parents who want...</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {provider.greatFor.map((item: any) => (
              <div key={item.title} className="bg-card rounded-xl border border-border p-6 space-y-3">
                <item.icon className="w-8 h-8 text-sage" />
                <h3 className="text-lg font-heading font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-secondary rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              Each daycare has its own approach and specialties based on the provider's expertise. Take the survey to see daycares that match your preferences and work best for you.
            </p>
            <Link to="/quiz" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap">
              See 3 Recommendations
            </Link>
          </div>
        </div>
      </section>

      {/* Favorite Activities */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl text-foreground italic mb-4">A Few Favorite Activities</h2>
              <p className="text-muted-foreground leading-relaxed">
                Activities are designed to help children develop social, emotional and cognitive skills as they sing, dance, play, and learn in a small group setting.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {provider.activities.map((act: any) => (
                <div key={act.name} className="flex items-center gap-3">
                  <act.icon className="w-5 h-5 text-sage" />
                  <span className="text-sm text-foreground">{act.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Q&A */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl text-foreground mb-8">Q&A with {provider.name}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {provider.qAndA.map((qa: any, i: number) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-heading font-semibold text-foreground text-sm leading-snug">{qa.question}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-[12]">{qa.answer}</p>
                <button className="text-xs text-primary font-semibold uppercase tracking-wider">Read More</button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-card rounded-xl border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-heading font-semibold text-foreground">Think {provider.name} might be a good fit?</p>
              <p className="text-sm text-muted-foreground">Find out if she has a spot for you. It's 100% free and takes just 5 minutes.</p>
            </div>
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap">
              Check Availability
            </button>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-12 md:py-16 bg-navy">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <blockquote className="text-popover text-xl md:text-2xl font-heading italic max-w-2xl mx-auto leading-relaxed">
            "{provider.quote}"
          </blockquote>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl text-foreground mb-2">Reviews & References</h2>
          <p className="text-muted-foreground text-sm mb-8">Here's the inside scoop from other parents that have worked with {provider.name}.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {provider.reviews.map((review: any, i: number) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rates & Openings */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl text-foreground mb-8">Rates & Openings</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">{provider.rates.description}</p>
              <p className="text-sm text-muted-foreground mt-4">
                <Link to="/quiz" className="text-primary underline">Take the survey</Link> to see if {provider.name} has a spot for you.
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <p className="text-sm font-semibold text-foreground mb-4">Select an age range to get an estimate:</p>
              <div className="flex gap-4">
                {provider.rates.ageGroups.map((ag: any) => (
                  <button key={ag.label} className="flex-1 border border-border rounded-lg p-3 text-center hover:border-primary transition-colors">
                    <Baby className="w-6 h-6 text-sage mx-auto mb-1" />
                    <p className="text-sm font-semibold text-foreground">{ag.label}</p>
                    <p className="text-xs text-muted-foreground">{ag.range}</p>
                  </button>
                ))}
              </div>
              <button className="mt-4 text-sm text-primary font-semibold flex items-center gap-1">
                Continue <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl text-foreground mb-8">Location</h2>
          <div className="bg-muted rounded-xl aspect-[2/1] md:aspect-[3/1] flex items-center justify-center relative overflow-hidden">
            <div className="text-center space-y-2">
              <MapPin className="w-8 h-8 text-primary mx-auto" />
              <p className="text-sm font-semibold text-foreground">{provider.name}</p>
              <p className="text-xs text-muted-foreground">{provider.address}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            There are 43 licensed home daycares in Mattapan. Most parents don't know this, but home daycare is regulated by the Dept. of Early Education & Care, just like the big preschools.
          </p>
        </div>
      </section>

      {/* About the Provider */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-muted rounded-xl aspect-square flex items-center justify-center">
              <Heart className="w-16 h-16 text-sage opacity-30" />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl text-foreground">About the Provider</h2>
              <p className="text-sm text-muted-foreground">Licensed Family Child Care educator</p>
              <p className="text-sm text-muted-foreground">License {provider.license}</p>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-3">Prior Experience</h3>
                <ul className="space-y-2">
                  {provider.priorExperience.map((exp: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span> {exp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProviderDetail;
