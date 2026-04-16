import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle, AlertTriangle, Heart, Utensils, Apple, Drumstick, ArrowRight, Calendar, DollarSign } from "lucide-react";
import { getChildPhoto } from "@/assets/childPhotos";
import type { ParentTab } from "@/pages/ParentDashboard";

interface ParentHomeProps {
  onNavigate: (tab: ParentTab) => void;
}

const ParentHome = ({ onNavigate }: ParentHomeProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, childrenRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("children").select("*").eq("parent_id", user.id),
      ]);
      setProfile(profileRes.data);
      setChildren(childrenRes.data || []);
      if (childrenRes.data && childrenRes.data.length > 0) {
        setSelectedChild(childrenRes.data[0]);
      }
    };
    fetchData();
  }, [user]);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Parent";
  const childAge = selectedChild?.date_of_birth
    ? Math.floor((Date.now() - new Date(selectedChild.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="px-4 pt-4">

      {/* Child Avatar */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-24 h-24 rounded-full bg-light-coral flex items-center justify-center text-4xl mb-2 ring-4 ring-primary/20 overflow-hidden">
          {selectedChild?.photo_url ? (
            <img src={selectedChild.photo_url} alt={selectedChild?.name} className="w-full h-full rounded-full object-cover" />
          ) : selectedChild?.name ? (
            <img src={getChildPhoto(selectedChild.name)} alt={selectedChild?.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            "👶"
          )}
        </div>
        {children.length > 1 && (
          <div className="flex gap-1 mt-1">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c)}
                className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all ${
                  selectedChild?.id === c.id
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {c.name?.[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Child Info Card */}
      {selectedChild && (
        <div className="bg-popover rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-bold text-foreground">{selectedChild.name}</span>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary text-xs">
                {childAge !== null && childAge < 2 ? "Infant" : childAge !== null && childAge < 4 ? "Toddler" : "Pre-K"}
              </Badge>
              {childAge !== null && (
                <span className="text-xs text-muted-foreground">Age {childAge}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Check-in Status */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Check_In at</span>
          </div>
          <span className="font-semibold text-foreground">8:00 AM Today</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-heading font-semibold text-foreground">AI Summary</span>
          <button className="text-sm text-primary flex items-center gap-1">More <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-light-coral flex items-center justify-center text-2xl mb-1">😊</div>
            <span className="text-xs text-muted-foreground">cheerful!</span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            {[
              { icon: "🎨", text: "Great painting", color: "text-primary" },
              { icon: "💪", text: "Active & healthy", color: "text-accent" },
              { icon: "⚠️", text: "Had a small snack", color: "text-destructive" },
              { icon: "✅", text: "Used potty well", color: "text-accent" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-xs">{item.icon}</span>
                <span className="text-xs text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* This Week's Program Plan */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-4">
        <h3 className="font-heading font-semibold text-foreground mb-3">This Week's Program Plan</h3>
        <div className="bg-secondary rounded-lg p-6 flex flex-col items-center text-center">
          <span className="text-3xl mb-2">📋</span>
          <span className="text-sm text-muted-foreground">This week's plan will appear here soon</span>
        </div>
      </div>

      {/* Today's Meal */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-4">
        <h3 className="font-heading font-semibold text-foreground mb-3">Today's Meal</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "🍳", name: "Omlet", type: "Breakfast" },
            { emoji: "🍌", name: "Banana", type: "Snack" },
            { emoji: "🍗", name: "Chicken", type: "Lunch" },
          ].map((meal) => (
            <div key={meal.name} className="bg-secondary rounded-xl p-3 flex flex-col items-center text-center">
              <span className="text-3xl mb-1">{meal.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{meal.name}</span>
              <span className="text-xs text-muted-foreground">{meal.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-foreground">Upcoming Events</h3>
          <button onClick={() => onNavigate("events")} className="text-sm text-primary flex items-center gap-1">More <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center bg-light-sage rounded-lg px-2 py-1">
            <span className="text-xs font-bold text-accent">28 Dec</span>
            <span className="text-[10px] text-muted-foreground">16 Dec</span>
          </div>
          <div className="flex-1 bg-secondary rounded-lg p-3">
            <span className="font-semibold text-sm text-foreground">Field Trip To Zoo</span>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Monday · July 16 · 12:00 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Snapshot */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-foreground">Billing</h3>
          <button onClick={() => onNavigate("billing")} className="text-sm text-primary flex items-center gap-1">More <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Nice work!</span>
          <span className="text-xs text-muted-foreground">Your account is looking healthy.</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Amount Due</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-destructive">Due Sep 12, 2025</span>
            <span className="font-bold text-foreground">$75.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentHome;
