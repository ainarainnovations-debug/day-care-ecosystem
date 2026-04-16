import { Heart, MapPin, Star, BadgeCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MatchesSection = () => {
  const { data: providers, isLoading } = useQuery({
    queryKey: ["landing-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_profiles")
        .select("id, business_name, provider_type, city, state, amenities, capacity, hourly_rate, full_day_rate, photos, is_verified")
        .eq("is_active", true)
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      const [bookings, providers, children] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("provider_profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("children").select("id", { count: "exact", head: true }),
      ]);
      return {
        bookings: bookings.count ?? 0,
        providers: providers.count ?? 0,
        children: children.count ?? 0,
      };
    },
  });

  const formatType = (type: string | null) => {
    if (!type) return "Daycare";
    return type === "home" ? "Licensed home daycare" : type === "center" ? "Daycare center" : type.charAt(0).toUpperCase() + type.slice(1);
  };

  const buildTraits = (p: NonNullable<typeof providers>[number]) => {
    const traits: string[] = [];
    if (p.city && p.state) traits.push(`${p.city}, ${p.state}`);
    else if (p.city) traits.push(p.city);
    if (p.amenities && p.amenities.length > 0) traits.push(p.amenities[0]);
    if (p.capacity) traits.push(`Up to ${p.capacity} children`);
    return traits.slice(0, 2);
  };

  const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-foreground mb-4">
            Daycare matches customized for you
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Each daycare has its own specialties and every program is led by an experienced and dedicated child care provider. They develop the curriculum, they create the environment.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : providers && providers.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {providers.map((provider, idx) => (
              <div
                key={provider.id}
                className="bg-card rounded-xl border border-border p-6 space-y-4 hover:shadow-md transition-shadow"
              >
                {idx < 2 && (
                  <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    It's a match
                  </span>
                )}
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {provider.photos && provider.photos.length > 0 ? (
                    <img src={provider.photos[0]} alt={provider.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <Heart className="w-6 h-6 text-sage" />
                  )}
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground">{provider.business_name}</h3>
                <p className="text-sm text-sage flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4" />
                  {formatType(provider.provider_type)}
                </p>
                <ul className="space-y-2">
                  {buildTraits(provider).map((trait) => (
                    <li key={trait} className="text-sm text-muted-foreground flex items-center gap-2">
                      {trait.includes(",") ? <MapPin className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                      {trait}
                    </li>
                  ))}
                </ul>
                <Link to={`/provider/${provider.id}`} className="mt-2 inline-block border border-foreground text-foreground text-sm px-5 py-2 rounded-full hover:bg-foreground hover:text-background transition-colors">
                  Check Availability
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No providers available yet. Check back soon!</p>
        )}

        {/* Stats bar */}
        <div className="mt-16 bg-navy text-popover rounded-xl p-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-3xl md:text-4xl font-heading font-bold">{stats?.bookings?.toLocaleString() ?? "—"}</span>
            <p className="text-sm mt-1 opacity-80">Bookings Made</p>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-heading font-bold">{stats?.providers?.toLocaleString() ?? "—"}</span>
            <p className="text-sm mt-1 opacity-80">Active Providers</p>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-heading font-bold">{stats?.children?.toLocaleString() ?? "—"}</span>
            <p className="text-sm mt-1 opacity-80">Children Enrolled</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MatchesSection;
