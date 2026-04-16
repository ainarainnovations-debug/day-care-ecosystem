import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const EnterCode = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      navigate("/login");
      return;
    }

    setLoading(true);
    const trimmed = code.trim().toUpperCase();

    // Look up the code
    const { data: invite, error } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", trimmed)
      .eq("is_active", true)
      .is("used_by", null)
      .single();

    if (error || !invite) {
      toast({ title: "Invalid code", description: "This code is invalid, expired, or already used.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check expiration
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      toast({ title: "Code expired", description: "This invite code has expired.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Mark as used
    await supabase
      .from("invite_codes")
      .update({ used_by: user.id, used_at: new Date().toISOString(), is_active: false })
      .eq("id", invite.id);

    if (invite.type === "teacher_invite") {
      // Update profile role to teacher
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "teacher" as const })
        .eq("user_id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Create teacher profile linked to the provider
      const { error: teacherProfileError } = await supabase
        .from("teacher_profiles")
        .insert({
          user_id: user.id,
          provider_id: invite.provider_id,
          employment_start_date: new Date().toISOString().split('T')[0],
          employment_status: 'active',
        });

      if (teacherProfileError) {
        console.error("Error creating teacher profile:", teacherProfileError);
      }

      // Create default permissions for the teacher
      const { error: permissionsError } = await supabase
        .from("teacher_permissions")
        .insert({
          teacher_id: user.id,
          provider_id: invite.provider_id,
          can_check_in_children: true,
          can_check_out_children: true,
          can_log_activities: true,
          can_upload_photos: true,
          can_message_parents: false,
          can_view_billing: false,
          can_manage_bookings: false,
        });

      if (permissionsError) {
        console.error("Error creating permissions:", permissionsError);
      }

      toast({ title: "Welcome, Teacher!", description: "Your account has been activated." });
      navigate("/teacher/dashboard");
    } else if (invite.type === "parent_enrollment") {
      toast({ title: "Enrollment confirmed!", description: "You now have full access to your parent dashboard, messaging, and activity feed." });
      navigate("/parent/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-popover rounded-2xl border border-border p-8">
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-light-coral rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Enter Your Code</h1>
            <p className="text-muted-foreground mt-2">
              Enter the invite or enrollment code you received from your daycare provider.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="e.g. ABCD-1234"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="h-14 text-center text-xl tracking-widest font-mono"
              maxLength={20}
            />
            <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground" disabled={loading || !code.trim()}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-secondary rounded-xl">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Teachers:</strong> Your daycare provider will give you an invite code to access the platform.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong className="text-foreground">Parents:</strong> After your enrollment application is approved, you'll receive a code to unlock full access.
            </p>
          </div>

          {!user && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              You need to <Link to="/login" className="text-primary font-medium hover:underline">sign in</Link> first before entering a code.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterCode;
