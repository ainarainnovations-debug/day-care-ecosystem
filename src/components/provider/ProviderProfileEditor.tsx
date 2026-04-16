import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Upload, X, Image as ImageIcon, MapPin } from "lucide-react";

const amenitiesList = [
  "Outdoor Play Area", "Indoor Gym", "Garden", "Kitchen", "Nap Room",
  "Art Studio", "Library", "Music Room", "CCTV", "AC/Heating",
  "Meals Included", "Organic Food", "Parking", "Wheelchair Accessible",
];

const ProviderProfileEditor = () => {
  const [businessName, setBusinessName] = useState("Sunshine Home Daycare");
  const [description, setDescription] = useState("A warm, nurturing home daycare providing personalized care in a safe, stimulating environment. We focus on learning through play, creativity, and social development.");
  const [providerType, setProviderType] = useState("home");
  const [hourlyRate, setHourlyRate] = useState("15");
  const [halfDayRate, setHalfDayRate] = useState("40");
  const [fullDayRate, setFullDayRate] = useState("65");
  const [capacity, setCapacity] = useState("8");
  const [ageMin, setAgeMin] = useState("0");
  const [ageMax, setAgeMax] = useState("5");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [address, setAddress] = useState("123 Sunshine Lane");
  const [city, setCity] = useState("Portland");
  const [state, setState] = useState("OR");
  const [zipCode, setZipCode] = useState("97201");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["Outdoor Play Area", "Kitchen", "Nap Room", "Meals Included"]);

  const mockPhotos = [
    "https://images.unsplash.com/photo-1587654780014-81008f3b6987?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1567448400372-d4f5e6a9f8c6?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop",
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="space-y-8">
      {/* Business Info */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Business Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Business Name</label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/500 characters</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Provider Type</label>
            <div className="flex gap-2">
              {["home", "center", "montessori", "preschool"].map((type) => (
                <button
                  key={type}
                  onClick={() => setProviderType(type)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                    providerType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">License Number</label>
            <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. DCC-12345" />
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Photos</h3>
        <p className="text-sm text-muted-foreground mb-4">Upload at least 3 photos. First photo will be your cover image.</p>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {mockPhotos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button className="absolute top-1 right-1 w-6 h-6 bg-destructive/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
              {i === 0 && (
                <Badge className="absolute bottom-1 left-1 bg-primary/80 text-primary-foreground text-[9px]">Cover</Badge>
              )}
            </div>
          ))}
          <button className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Add Photo</span>
          </button>
        </div>
      </section>

      {/* Rates */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Pricing & Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Hourly Rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="pl-7" type="number" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Half-Day Rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input value={halfDayRate} onChange={(e) => setHalfDayRate(e.target.value)} className="pl-7" type="number" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Full-Day Rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input value={fullDayRate} onChange={(e) => setFullDayRate(e.target.value)} className="pl-7" type="number" />
            </div>
          </div>
        </div>
      </section>

      {/* Capacity & Age Range */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Capacity & Age Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Max Capacity</label>
            <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Min Age (years)</label>
            <Input value={ageMin} onChange={(e) => setAgeMin(e.target.value)} type="number" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Max Age (years)</label>
            <Input value={ageMax} onChange={(e) => setAgeMax(e.target.value)} type="number" />
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {amenitiesList.map((amenity) => (
            <label
              key={amenity}
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                selectedAmenities.includes(amenity)
                  ? "bg-light-sage/30 border border-accent/20"
                  : "bg-secondary/50 border border-transparent"
              }`}
            >
              <Checkbox
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <span className="text-sm text-foreground">{amenity}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Location</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-foreground mb-1 block">Street Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">City</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">State</label>
              <Input value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Zip</label>
              <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProviderProfileEditor;
