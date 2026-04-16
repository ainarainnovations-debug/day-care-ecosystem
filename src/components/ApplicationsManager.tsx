import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock } from "lucide-react";

const ApplicationsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerProfile, setProviderProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: pp } = await supabase
      .from("provider_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    setProviderProfile(pp);

    if (pp) {
      const { data } = await supabase
        .from("enrollment_applications")
        .select("*")
        .eq("provider_id", pp.id)
        .order("created_at", { ascending: false });
      setApplications(data || []);
    }
    setLoading(false);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += "-";
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleApprove = async (app: any) => {
    if (!user || !providerProfile) return;

    // Generate enrollment code for the parent
    const code = generateCode();
    const { error: codeError } = await supabase.from("invite_codes").insert({
      code,
      type: "parent_enrollment" as any,
      provider_id: providerProfile.id,
      created_by: user.id,
      metadata: { application_id: app.id, parent_id: app.parent_id },
    });

    if (codeError) {
      toast({ title: "Failed to generate enrollment code", variant: "destructive" });
      return;
    }

    // Update application status
    await supabase
      .from("enrollment_applications")
      .update({ status: "approved" as any, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq("id", app.id);

    // Send notification to parent
    await supabase.from("notifications").insert({
      user_id: app.parent_id,
      title: "Enrollment Approved! 🎉",
      body: `Your application has been approved! Use code ${code} to unlock full access.`,
      type: "enrollment_approved",
      link: "/enter-code",
    });

    toast({ title: "Application approved!", description: `Enrollment code ${code} has been generated and the parent has been notified.` });
    fetchData();
  };

  const handleReject = async (app: any) => {
    if (!user) return;

    await supabase
      .from("enrollment_applications")
      .update({ status: "rejected" as any, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq("id", app.id);

    await supabase.from("notifications").insert({
      user_id: app.parent_id,
      title: "Application Update",
      body: "Unfortunately, your enrollment application was not approved at this time.",
      type: "enrollment_rejected",
    });

    toast({ title: "Application rejected" });
    fetchData();
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  const pending = applications.filter(a => a.status === "pending");
  const reviewed = applications.filter(a => a.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      {pending.length > 0 && (
        <div className="bg-light-coral/20 rounded-xl border border-primary/20 p-5">
          <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Pending Applications ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((app) => (
              <div key={app.id} className="bg-popover rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">Parent ID: {app.parent_id.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                    {app.message && (
                      <p className="text-sm text-muted-foreground mt-2 bg-secondary p-2 rounded">"{app.message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-accent text-accent-foreground h-8" onClick={() => handleApprove(app)}>
                      <Check className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => handleReject(app)}>
                      <X className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Applications */}
      <div className="bg-popover rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-semibold text-foreground">All Applications ({applications.length})</h3>
        </div>
        {applications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No enrollment applications yet. Parents can apply from your provider profile page.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {applications.map((app) => (
              <div key={app.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Parent: {app.parent_id.slice(0, 8)}...</p>
                  <p className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <Badge className={
                  app.status === "pending" ? "bg-secondary text-foreground" :
                  app.status === "approved" ? "bg-accent text-accent-foreground" :
                  "bg-destructive text-destructive-foreground"
                }>
                  {app.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsManager;
