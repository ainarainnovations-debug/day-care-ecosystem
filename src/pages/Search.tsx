import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Search as SearchIcon, MapPin, Star, SlidersHorizontal, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SearchMap from "@/components/search/SearchMap";

interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  capacity: number;
  hourly_rate: number | null;
  half_day_rate: number | null;
  full_day_rate: number | null;
  age_range_min: number | null;
  age_range_max: number | null;
  amenities: string[] | null;
  photos: string[] | null;
  is_verified: boolean;
  provider_type: string | null;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const urlCity = searchParams.get("city") || "";
  const urlState = searchParams.get("state") || "";
  const initialQuery = urlCity ? (urlState ? `${urlCity}, ${urlState}` : urlCity) : "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("recommended");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerType, setProviderType] = useState("all");
  const [ageGroup, setAgeGroup] = useState("all");
  const [reviewCounts, setReviewCounts] = useState<Record<string, { avg: number; count: number }>>({}); 

  const fetchProviders = async () => {
    setLoading(true);
    let query = supabase
      .from("provider_profiles")
      .select("*")
      .eq("is_active", true);

    if (providerType !== "all") {
      query = query.eq("provider_type", providerType);
    }

    if (priceRange[0] > 0 || priceRange[1] < 200) {
      query = query.gte("full_day_rate", priceRange[0]).lte("full_day_rate", priceRange[1]);
    }

    const { data, error } = await query;

    if (!error && data) {
      let filtered = data;

      // Client-side age filtering
      if (ageGroup !== "all") {
        const ageMap: Record<string, [number, number]> = {
          infant: [0, 1], toddler: [1, 3], preschool: [3, 5], school: [5, 12],
        };
        const [min, max] = ageMap[ageGroup] || [0, 12];
        filtered = filtered.filter(
          (p) => (p.age_range_min ?? 0) <= max && (p.age_range_max ?? 12) >= min
        );
      }

      // Client-side search filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.business_name.toLowerCase().includes(q) ||
            p.city?.toLowerCase().includes(q) ||
            p.address?.toLowerCase().includes(q) ||
            p.state?.toLowerCase().includes(q)
        );
      }

      setProviders(filtered);

      // Fetch review averages
      const userIds = filtered.map((p) => p.user_id);
      if (userIds.length > 0) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("provider_id, rating")
          .in("provider_id", userIds);

        if (reviews) {
          const counts: Record<string, { total: number; count: number }> = {};
          reviews.forEach((r) => {
            if (!counts[r.provider_id]) counts[r.provider_id] = { total: 0, count: 0 };
            counts[r.provider_id].total += r.rating;
            counts[r.provider_id].count += 1;
          });
          const result: Record<string, { avg: number; count: number }> = {};
          Object.entries(counts).forEach(([id, { total, count }]) => {
            result[id] = { avg: Math.round((total / count) * 10) / 10, count };
          });
          setReviewCounts(result);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, [providerType, ageGroup, priceRange]);

  const sortedProviders = [...providers].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return (a.full_day_rate ?? 0) - (b.full_day_rate ?? 0);
      case "price-high": return (b.full_day_rate ?? 0) - (a.full_day_rate ?? 0);
      case "rating": {
        const ra = reviewCounts[a.user_id]?.avg ?? 0;
        const rb = reviewCounts[b.user_id]?.avg ?? 0;
        return rb - ra;
      }
      default: return 0;
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-popover border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">Find Daycare Near You</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or address"
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12 px-6 bg-primary text-primary-foreground" onClick={fetchProviders}>
              <SearchIcon className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters
            </Button>
            <Badge variant="secondary" className="text-sm">
              {loading ? "Loading..." : `${sortedProviders.length} providers found`}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
                <SelectItem value="price-low">Price: Low to high</SelectItem>
                <SelectItem value="price-high">Price: High to low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border border-border rounded-md overflow-hidden">
              <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 text-sm ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-popover text-foreground"}`}>List</button>
              <button onClick={() => setViewMode("map")} className={`px-3 py-1.5 text-sm ${viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-popover text-foreground"}`}>Map</button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-popover rounded-lg border border-border p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Provider Type</label>
              <Select value={providerType} onValueChange={setProviderType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="home">Home Daycare</SelectItem>
                  <SelectItem value="center">Daycare Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Age Group</label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ages</SelectItem>
                  <SelectItem value="infant">Infant (0-1)</SelectItem>
                  <SelectItem value="toddler">Toddler (1-3)</SelectItem>
                  <SelectItem value="preschool">Preschool (3-5)</SelectItem>
                  <SelectItem value="school">School age (5+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Price Range ($/day)</label>
              <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={200} step={5} className="mt-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>${priceRange[0]}</span><span>${priceRange[1]}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Rating</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Any rating" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any rating</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          <div className={viewMode === "map" ? "w-1/2" : "w-full"}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-popover rounded-xl border border-border h-80 animate-pulse" />
                ))}
              </div>
            ) : sortedProviders.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🔍</span>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No providers found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedProviders.map((p) => {
                  const review = reviewCounts[p.user_id];
                  const spotsOpen = p.capacity - 0; // TODO: calculate enrolled from bookings
                  return (
                    <div key={p.id} id={`provider-${p.id}`} className="bg-popover rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative bg-light-sage h-36 flex items-center justify-center">
                        <span className="text-5xl">{p.provider_type === "center" ? "🏫" : "🏡"}</span>
                        <button onClick={() => toggleFavorite(p.id)} className="absolute top-3 right-3 w-8 h-8 bg-popover/80 rounded-full flex items-center justify-center">
                          <Heart className={`w-4 h-4 ${favorites.includes(p.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        </button>
                        {p.is_verified && (
                          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs">✓ Verified</Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <Link to={`/provider/${p.id}`} className="font-heading font-semibold text-foreground hover:text-primary transition-colors block mb-1">
                          {p.business_name}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded capitalize">{p.provider_type || "home"}</span>
                          {p.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}, {p.state}</span>}
                        </div>
                        {review && (
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="text-sm font-medium text-foreground">{review.avg}</span>
                            <span className="text-sm text-muted-foreground">({review.count})</span>
                          </div>
                        )}
                        {p.amenities && p.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {p.amenities.slice(0, 2).map((t) => (
                              <span key={t} className="text-xs bg-light-coral text-foreground px-2 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div>
                            {p.full_day_rate && (
                              <>
                                <span className="text-lg font-bold text-foreground">${Number(p.full_day_rate)}</span>
                                <span className="text-sm text-muted-foreground">/day</span>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Ages {p.age_range_min ?? 0}-{p.age_range_max ?? 12}</div>
                            <div className="text-xs font-medium text-accent">{p.capacity} capacity</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Link to={`/book/${p.id}`} className="flex-1">
                            <Button className="w-full bg-primary text-primary-foreground" size="sm">Book a Visit</Button>
                          </Link>
                          <Link to={`/claim/${p.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">Claim</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {viewMode === "map" && (
            <div className="w-1/2 sticky top-24 h-[calc(100vh-120px)]">
              <SearchMap
                providers={sortedProviders}
                onSelect={(id) => {
                  const el = document.getElementById(`provider-${id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
