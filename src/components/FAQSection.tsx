import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is NeighborSchools?",
    a: "We're a free service that helps new parents find child care — especially for first-time parents. We help you find some great options, understand the process, and choose a program you'll love.",
  },
  {
    q: "How does it work?",
    a: "Take our 5-minute quiz and we'll match you with 3 personalized daycare recommendations based on your preferences, schedule, and location.",
  },
  {
    q: "How do I know if I'm ready to take the quiz?",
    a: "If you're expecting or have a child and need child care, you're ready! Many parents start looking 3-6 months before they need care.",
  },
  {
    q: "How do I know if a program has openings?",
    a: "Each recommendation includes availability information. You can also check availability directly with the provider through our platform.",
  },
  {
    q: "Is there a cost?",
    a: "NeighborSchools is 100% free for parents. We're here to help you find the best child care without any cost to you.",
  },
];

const FAQSection = () => {
  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl">
        <h2 className="text-3xl md:text-4xl text-foreground mb-3 text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Your family's unique to you, but there are some pretty common questions that parents ask.
        </p>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-popover border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-10">
          <p className="text-muted-foreground text-sm">
            Still got questions? Send us a{" "}
            <a href="#" className="underline text-foreground">text</a>,{" "}
            <a href="#" className="underline text-foreground">email</a> or{" "}
            <a href="#" className="underline text-foreground">chat</a> and we're happy to help.
          </p>
          <p className="text-xs text-muted-foreground mt-1">We're online Monday-Friday, 9am to 4pm Eastern.</p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
