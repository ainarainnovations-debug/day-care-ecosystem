import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, FileText, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Claim {
  id: string;
  claimant_user_id: string;
  provider_id: string;
  business_ein: string | null;
  verification_notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  provider_name?: string;
  claimant_name?: string;
}

const AdminClaims = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const fetchClaims = async () => {
    setLoading(true);
    let query = supabase
      .from("provider_claims")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      // Fetch provider names and claimant names
      const providerIds = [...new Set(data.map((c) => c.provider_id))];
      const userIds = [...new Set(data.map((c) => c.claimant_user_id))];

      const [providersRes, profilesRes] = await Promise.all([
        supabase.from("provider_profiles").select("id, business_name").in("id", providerIds),
        supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
      ]);

      const providerMap = Object.fromEntries(
        (providersRes.data || []).map((p) => [p.id, p.business_name])
      );
      const profileMap = Object.fromEntries(
        (profilesRes.data || []).map((p) => [p.user_id, p.display_name])
      );

      setClaims(
        data.map((c) => ({
          ...c,
          provider_name: providerMap[c.provider_id] || "Unknown",
          claimant_name: profileMap[c.claimant_user_id] || "Unknown",
        }))
      );
    } else {
      setClaims([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const handleAction = async (claimId: string, action: "approved" | "rejected") => {
    const { error } = await supabase
      .from("provider_claims")
      .update({
        status: action,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id || null,
      })
      .eq("id", claimId);

    if (!error) {
      toast({ title: `Claim ${action}` });
      fetchClaims();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "approved": return "bg-accent text-accent-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-popover rounded-xl border border-border h-24 animate-pulse" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No {filter === "all" ? "" : filter} claims</p>
          <p className="text-sm">Ownership claims from daycare owners will appear here</p>
        </div>
      ) : (
        claims.map((claim) => (
          <div key={claim.id} className="bg-popover rounded-xl border border-border p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-heading font-semibold text-foreground">{claim.provider_name}</h3>
                  <Badge className={statusColor(claim.status)}>{claim.status}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Claimant:</span>{" "}
                    <span className="text-foreground font-medium">{claim.claimant_name}</span>
                  </div>
                  {claim.business_ein && (
                    <div>
                      <span className="text-muted-foreground">EIN:</span>{" "}
                      <span className="text-foreground font-mono">{claim.business_ein}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>{" "}
                    <span className="text-foreground">{new Date(claim.created_at).toLocaleDateString()}</span>
                  </div>
                  {claim.reviewed_at && (
                    <div>
                      <span className="text-muted-foreground">Reviewed:</span>{" "}
                      <span className="text-foreground">{new Date(claim.reviewed_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {claim.verification_notes && (
                  <div className="mt-2 bg-secondary/50 rounded-lg p-3 text-sm">
                    <FileText className="w-3 h-3 inline mr-1 text-muted-foreground" />
                    <span className="text-foreground">{claim.verification_notes}</span>
                  </div>
                )}
              </div>
              {claim.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground"
                    onClick={() => handleAction(claim.id, "approved")}
                  >
                    <Check className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => handleAction(claim.id, "rejected")}
                  >
                    <X className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminClaims;
