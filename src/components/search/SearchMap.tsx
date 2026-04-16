import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Provider {
  id: string;
  business_name: string;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  full_day_rate: number | null;
  provider_type: string | null;
}

interface SearchMapProps {
  providers: Provider[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const SearchMap = ({ providers, selectedId, onSelect }: SearchMapProps) => {
  const providersWithCoords = providers.filter((p) => p.lat && p.lng);

  // Calculate center from providers or default to Boston
  const center = providersWithCoords.length > 0
    ? {
        lat: providersWithCoords.reduce((s, p) => s + (p.lat || 0), 0) / providersWithCoords.length,
        lng: providersWithCoords.reduce((s, p) => s + (p.lng || 0), 0) / providersWithCoords.length,
      }
    : { lat: 42.36, lng: -71.06 };

  return (
    <div className="w-full h-full bg-secondary rounded-xl border border-border relative overflow-hidden">
      {/* Simple CSS-based map visualization */}
      <div className="absolute inset-0 bg-accent/10">
        {/* Grid lines for map feel */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {providersWithCoords.length > 0 ? (
          providersWithCoords.map((p) => {
            // Normalize positions relative to center
            const x = 50 + (p.lng! - center.lng) * 80;
            const y = 50 - (p.lat! - center.lat) * 80;
            const isSelected = selectedId === p.id;

            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-full transition-all z-10 ${
                  isSelected ? "scale-125 z-20" : "hover:scale-110"
                }`}
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(10, Math.min(90, y))}%`,
                }}
                title={p.business_name}
              >
                <div className={`flex flex-col items-center`}>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold shadow-md whitespace-nowrap ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-popover text-foreground border border-border"
                  }`}>
                    {p.full_day_rate ? `$${Number(p.full_day_rate)}` : p.business_name.slice(0, 12)}
                  </div>
                  <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent ${
                    isSelected ? "border-t-primary" : "border-t-popover"
                  }`} />
                </div>
              </button>
            );
          })
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No locations to show</p>
              <p className="text-sm">Providers need GPS coordinates to appear on the map</p>
            </div>
          </div>
        )}
      </div>

      {/* Map legend */}
      <div className="absolute bottom-3 left-3 bg-popover/90 backdrop-blur-sm rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium">{providersWithCoords.length}</span> of {providers.length} providers shown
      </div>
    </div>
  );
};

export default SearchMap;
