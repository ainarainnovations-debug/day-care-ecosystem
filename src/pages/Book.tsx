import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Clock, User, CreditCard, CalendarIcon } from "lucide-react";

const timeSlots = [
  { id: "full", label: "Full Day", time: "7:00 AM – 6:00 PM", price: 65 },
  { id: "morning", label: "Half Day (AM)", time: "7:00 AM – 12:00 PM", price: 40 },
  { id: "afternoon", label: "Half Day (PM)", time: "12:00 PM – 6:00 PM", price: 40 },
  { id: "hourly", label: "Hourly", time: "Select hours", price: 12 },
];

const children = [
  { id: 1, name: "Emma", age: "2 years" },
  { id: 2, name: "Liam", age: "4 years" },
];

const Book = () => {
  const { slug } = useParams();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);

  const toggleChild = (id: number) => {
    setSelectedChildren(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const steps = [
    { num: 1, label: "Date & Time" },
    { num: 2, label: "Child" },
    { num: 3, label: "Confirm" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/search" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to search
        </Link>

        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Book a Visit</h1>
        <p className="text-muted-foreground mb-8">Sunshine Home Daycare</p>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.num ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`ml-2 text-sm ${step >= s.num ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-12 h-px bg-border mx-3" />}
            </div>
          ))}
        </div>

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-popover rounded-xl border border-border p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" /> Select a Date
              </h2>
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border mx-auto pointer-events-auto" />
            </div>

            <div className="bg-popover rounded-xl border border-border p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Select Time
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${selectedSlot === slot.id ? "border-primary bg-light-coral" : "border-border hover:border-primary/50"}`}
                  >
                    <div className="font-medium text-foreground">{slot.label}</div>
                    <div className="text-sm text-muted-foreground">{slot.time}</div>
                    <div className="text-sm font-semibold text-primary mt-1">${slot.price}{slot.id === "hourly" ? "/hr" : ""}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => setStep(2)} disabled={!selectedDate || !selectedSlot} className="w-full h-12 bg-primary text-primary-foreground">
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Select Child */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-popover rounded-xl border border-border p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Select Child
              </h2>
              <div className="space-y-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => toggleChild(child.id)}
                    className={`w-full p-4 rounded-lg border text-left flex items-center gap-4 transition-all ${selectedChildren.includes(child.id) ? "border-primary bg-light-coral" : "border-border hover:border-primary/50"}`}
                  >
                    <div className="w-12 h-12 bg-light-sage rounded-full flex items-center justify-center text-lg">👶</div>
                    <div>
                      <div className="font-medium text-foreground">{child.name}</div>
                      <div className="text-sm text-muted-foreground">{child.age}</div>
                    </div>
                    {selectedChildren.includes(child.id) && <Check className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-dashed">
                + Add a new child
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">Back</Button>
              <Button onClick={() => setStep(3)} disabled={selectedChildren.length === 0} className="flex-1 h-12 bg-primary text-primary-foreground">Continue</Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-popover rounded-xl border border-border p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Booking Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium text-foreground">Sunshine Home Daycare</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{selectedDate?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">{timeSlots.find(s => s.id === selectedSlot)?.label}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Children</span>
                  <span className="font-medium text-foreground">{selectedChildren.map(id => children.find(c => c.id === id)?.name).join(", ")}</span>
                </div>
                <div className="flex justify-between py-2 text-lg">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary">${(timeSlots.find(s => s.id === selectedSlot)?.price || 0) * selectedChildren.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-popover rounded-xl border border-border p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payment
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Payment will be processed after provider confirms the booking.</p>
              <div className="bg-light-sage/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                Connect Stripe to enable payments
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">Back</Button>
              <Button className="flex-1 h-12 bg-primary text-primary-foreground">Confirm Booking</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
