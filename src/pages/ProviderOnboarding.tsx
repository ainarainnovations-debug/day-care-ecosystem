import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, MapPin, DollarSign, Camera, Send } from "lucide-react";
import Navbar from "@/components/Navbar";

const STEPS = [
  { label: "Business Info", icon: "🏡" },
  { label: "Location", icon: "📍" },
  { label: "Rates & Capacity", icon: "💰" },
  { label: "Amenities & Photos", icon: "📸" },
  { label: "Review & Submit", icon: "✅" },
];

const AMENITY_OPTIONS = [
  "Outdoor play area", "Organic meals", "Bilingual (Spanish)", "Bilingual (French)",
  "STEM curriculum", "Montessori-inspired", "Music & art", "Security cameras",
  "Extended hours", "Weekend care", "Drop-in available", "First aid certified",
  "Infant specialist", "Pre-K program", "Nature-based", "Vegetarian meals",
  "Pet-friendly", "Swimming pool", "Transportation", "Homework help",
];

const ProviderOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [providerType, setProviderType] = useState("home");
  const [licenseNumber, setLicenseNumber] = useState("");

  // Step 2: Location
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Step 3: Rates & Capacity
  const [capacity, setCapacity] = useState("8");
  const [hourlyRate, setHourlyRate] = useState("");
  const [halfDayRate, setHalfDayRate] = useState("");
  const [fullDayRate, setFullDayRate] = useState("");
  const [ageRangeMin, setAgeRangeMin] = useState("0");
  const [ageRangeMax, setAgeRangeMax] = useState("5");

  // Step 4: Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return businessName.trim().length > 0 && description.trim().length > 0;
      case 1: return address.trim().length > 0 && city.trim().length > 0 && state.trim().length > 0;
      case 2: return fullDayRate.trim().length > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      navigate("/login");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("provider_profiles").insert({
      user_id: user.id,
      business_name: businessName,
      description,
      provider_type: providerType,
      license_number: licenseNumber || null,
      address,
      city,
      state,
      zip_code: zipCode,
      capacity: parseInt(capacity) || 8,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      half_day_rate: halfDayRate ? parseFloat(halfDayRate) : null,
      full_day_rate: parseFloat(fullDayRate),
      age_range_min: parseInt(ageRangeMin) || 0,
      age_range_max: parseInt(ageRangeMax) || 12,
      amenities: selectedAmenities,
      is_verified: false,
      is_active: true,
    });

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      // Update profile role to provider
      await supabase.from("profiles").update({ role: "provider" }).eq("user_id", user.id);
      toast({ title: "🎉 Profile submitted!", description: "Your daycare listing is pending verification. We'll notify you once approved." });
      navigate("/provider/dashboard");
    }
    setLoading(false);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-sm ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  i < step ? "bg-accent text-accent-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : s.icon}
                </span>
                <span className="hidden md:inline">{s.label}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="bg-popover rounded-2xl border border-border p-8">
          {/* Step 0: Business Info */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <span className="text-4xl block mb-2">🏡</span>
                <h2 className="font-heading text-xl font-bold text-foreground">Tell us about your daycare</h2>
                <p className="text-muted-foreground text-sm mt-1">Basic information about your business</p>
              </div>
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input id="businessName" placeholder="e.g. Sunshine Home Daycare" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-11" />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder="Tell parents about your daycare — your philosophy, environment, what makes you special..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider Type</Label>
                  <Select value={providerType} onValueChange={setProviderType}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Daycare</SelectItem>
                      <SelectItem value="center">Daycare Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="license">License Number</Label>
                  <Input id="license" placeholder="Optional" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="h-11" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <span className="text-4xl block mb-2">📍</span>
                <h2 className="font-heading text-xl font-bold text-foreground">Where is your daycare?</h2>
                <p className="text-muted-foreground text-sm mt-1">Parents will find you based on this location</p>
              </div>
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input id="address" placeholder="123 Main Street" value={address} onChange={(e) => setAddress(e.target.value)} className="h-11" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="Oakland" value={city} onChange={(e) => setCity(e.target.value)} className="h-11" />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" placeholder="CA" value={state} onChange={(e) => setState(e.target.value)} className="h-11" />
                </div>
                <div>
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input id="zip" placeholder="94601" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="h-11" />
                </div>
              </div>
              <div className="bg-light-sage/30 rounded-xl p-4 flex items-center gap-3 text-sm text-foreground">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <span>Your exact address is only shared with parents who have a confirmed booking. Search results show your general area only.</span>
              </div>
            </div>
          )}

          {/* Step 2: Rates & Capacity */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <span className="text-4xl block mb-2">💰</span>
                <h2 className="font-heading text-xl font-bold text-foreground">Set your rates</h2>
                <p className="text-muted-foreground text-sm mt-1">You can always update these later</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hourly">Hourly Rate</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="hourly" type="number" placeholder="15" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="h-11 pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="halfday">Half-Day Rate</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="halfday" type="number" placeholder="40" value={halfDayRate} onChange={(e) => setHalfDayRate(e.target.value)} className="h-11 pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fullday">Full-Day Rate *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="fullday" type="number" placeholder="65" value={fullDayRate} onChange={(e) => setFullDayRate(e.target.value)} className="h-11 pl-8" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="capacity">Max Capacity</Label>
                  <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="h-11" />
                </div>
                <div>
                  <Label htmlFor="agemin">Min Age</Label>
                  <Select value={ageRangeMin} onValueChange={setAgeRangeMin}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((a) => (
                        <SelectItem key={a} value={String(a)}>{a} years</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="agemax">Max Age</Label>
                  <Select value={ageRangeMax} onValueChange={setAgeRangeMax}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 8, 10, 12].map((a) => (
                        <SelectItem key={a} value={String(a)}>{a} years</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <span className="text-4xl block mb-2">📸</span>
                <h2 className="font-heading text-xl font-bold text-foreground">What do you offer?</h2>
                <p className="text-muted-foreground text-sm mt-1">Select all amenities that apply</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((a) => (
                  <Badge
                    key={a}
                    variant="outline"
                    className={`cursor-pointer px-3 py-2 text-sm transition-all ${
                      selectedAmenities.includes(a)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:border-primary"
                    }`}
                    onClick={() => toggleAmenity(a)}
                  >
                    {selectedAmenities.includes(a) && <Check className="w-3 h-3 mr-1" />}
                    {a}
                  </Badge>
                ))}
              </div>
              <div className="bg-light-coral/30 rounded-xl p-4 text-sm text-foreground">
                <Camera className="w-4 h-4 inline mr-2 text-primary" />
                You can add photos after your profile is approved from the Provider Dashboard.
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <span className="text-4xl block mb-2">✅</span>
                <h2 className="font-heading text-xl font-bold text-foreground">Review your listing</h2>
                <p className="text-muted-foreground text-sm mt-1">Make sure everything looks good before submitting</p>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary rounded-xl p-4">
                  <h3 className="font-medium text-foreground text-sm mb-2">Business Info</h3>
                  <p className="text-foreground font-semibold">{businessName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{providerType} daycare</p>
                  <p className="text-sm text-muted-foreground mt-1">{description.slice(0, 150)}{description.length > 150 ? "..." : ""}</p>
                  {licenseNumber && <p className="text-xs text-accent mt-1">License: {licenseNumber}</p>}
                </div>

                <div className="bg-secondary rounded-xl p-4">
                  <h3 className="font-medium text-foreground text-sm mb-2">Location</h3>
                  <p className="text-foreground">{address}</p>
                  <p className="text-sm text-muted-foreground">{city}, {state} {zipCode}</p>
                </div>

                <div className="bg-secondary rounded-xl p-4">
                  <h3 className="font-medium text-foreground text-sm mb-2">Rates & Capacity</h3>
                  <div className="flex gap-4 text-sm">
                    {hourlyRate && <span className="text-foreground"><strong>${hourlyRate}</strong>/hr</span>}
                    {halfDayRate && <span className="text-foreground"><strong>${halfDayRate}</strong>/half day</span>}
                    <span className="text-foreground"><strong>${fullDayRate}</strong>/day</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Ages {ageRangeMin}-{ageRangeMax} • Capacity: {capacity} children</p>
                </div>

                {selectedAmenities.length > 0 && (
                  <div className="bg-secondary rounded-xl p-4">
                    <h3 className="font-medium text-foreground text-sm mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedAmenities.map((a) => (
                        <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-light-sage/30 rounded-xl p-4 text-sm text-foreground">
                <Send className="w-4 h-4 inline mr-2 text-accent" />
                After submitting, our team will review your listing within 1-2 business days. You'll receive a notification once approved.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-accent text-accent-foreground"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : <><Send className="w-4 h-4 mr-1" /> Submit for Verification</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
