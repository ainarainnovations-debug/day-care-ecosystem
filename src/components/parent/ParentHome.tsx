import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle, AlertTriangle, Heart, Utensils, Apple, Drumstick, ArrowRight, Calendar, DollarSign } from "lucide-react";
import { getChildPhoto } from "@/assets/childPhotos";
import type { ParentTab } from "@/pages/ParentDashboard";
import { parentDashboardService } from "@/services/parentDashboardService";

interface ParentHomeProps {
  onNavigate: (tab: ParentTab) => void;
}

const ParentHome = ({ onNavigate }: ParentHomeProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  // Fetch real data using parent dashboard service
  const { data: children = [] } = useQuery({
    queryKey: ['my-children', user?.id],
    queryFn: () => parentDashboardService.getMyChildren(user!.id),
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['parent-stats', user?.id],
    queryFn: () => parentDashboardService.getDashboardStats(user!.id),
    enabled: !!user?.id,
  });

  const { data: todaysAttendance = [] } = useQuery({
    queryKey: ['todays-attendance-parent', user?.id],
    queryFn: () => parentDashboardService.getTodaysAttendance(user!.id),
    enabled: !!user?.id,
  });

  const { data: upcomingBookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: () => parentDashboardService.getMyBookings(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const profileRes = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(profileRes.data);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, [children, selectedChild]);

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
      {todaysAttendance.length > 0 ? (
        todaysAttendance.map((attendance: any) => {
          const checkInTime = attendance.check_in_time 
            ? new Date(attendance.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : null;
          const checkOutTime = attendance.check_out_time
            ? new Date(attendance.check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : null;
          
          return (
            <div key={attendance.id} className="bg-popover rounded-xl border border-border p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">
                    {checkOutTime ? 'Checked out at' : 'Checked in at'}
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  {checkOutTime || checkInTime || 'Not checked in'}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-popover rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Not checked in today</span>
            </div>
          </div>
        </div>
      )}

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
        {stats && stats.overdueInvoices > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">{stats.overdueInvoices} overdue invoice{stats.overdueInvoices > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Amount Due</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-destructive">Pay now</span>
                <span className="font-bold text-foreground">${stats.pendingPayments?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </>
        ) : stats && stats.pendingPayments > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Payment upcoming</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Amount Due</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">${stats.pendingPayments?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Nice work!</span>
            <span className="text-xs text-muted-foreground">Your account is looking healthy.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentHome;
