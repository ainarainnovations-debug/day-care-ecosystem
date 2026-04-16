import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BadgeCheck, Building2, ChevronRight, Loader2, ShieldCheck } from "lucide-react";

const ClaimDaycare = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businessEin, setBusinessEin] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");

  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ["claim-provider", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_profiles")
        .select("id, business_name, city, state, provider_type")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: existingClaim } = useQuery({
    queryKey: ["existing-claim", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("provider_claims")
        .select("id, status")
        .eq("provider_id", id!)
        .eq("claimant_user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!id && !!user,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("provider_claims").insert({
        claimant_user_id: user!.id,
        provider_id: id!,
        business_ein: businessEin || null,
        verification_notes: verificationNotes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Claim submitted! Our team will review your verification and get back to you.");
      navigate("/search");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit claim");
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Sign in to Claim Your Daycare</h1>
          <p className="text-muted-foreground mb-6">You need an account to verify ownership.</p>
          <Link to="/signup">
            <Button className="bg-primary text-primary-foreground">Create an Account</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/search" className="hover:text-foreground transition-colors">Search</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Claim Daycare</span>
        </div>

        {providerLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !provider ? (
          <p className="text-center text-muted-foreground py-12">Provider not found.</p>
        ) : existingClaim ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center space-y-4">
            <BadgeCheck className="w-12 h-12 text-primary mx-auto" />
            <h2 className="font-heading text-xl font-semibold text-foreground">Claim Already Submitted</h2>
            <p className="text-muted-foreground">
              Your claim for <strong>{provider.business_name}</strong> is currently{" "}
              <span className={`font-semibold ${existingClaim.status === "approved" ? "text-accent" : existingClaim.status === "rejected" ? "text-destructive" : "text-primary"}`}>
                {existingClaim.status}
              </span>.
            </p>
            {existingClaim.status === "approved" && (
              <Link to="/provider/dashboard">
                <Button className="bg-primary text-primary-foreground mt-2">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-10 h-10 text-sage" />
              <div>
                <h1 className="font-heading text-xl font-semibold text-foreground">{provider.business_name}</h1>
                <p className="text-sm text-muted-foreground">
                  {provider.city}, {provider.state} · {provider.provider_type === "home" ? "Home Daycare" : "Daycare Center"}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">Verify Your Ownership</h2>
              <p className="text-sm text-muted-foreground">
                Submit your business EIN or registration details. Our admin team will review and approve your claim within 1–2 business days.
              </p>

              <div className="space-y-2">
                <Label htmlFor="ein" className="text-sm">Business EIN / Registration Number</Label>
                <Input
                  id="ein"
                  placeholder="XX-XXXXXXX"
                  value={businessEin}
                  onChange={(e) => setBusinessEin(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Additional Verification Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information to verify your ownership (e.g., license number, business registration details)"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending || (!businessEin && !verificationNotes)}
              >
                {claimMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Submit Claim
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ClaimDaycare;
