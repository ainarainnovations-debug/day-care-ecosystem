import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MapPin, Mail, Phone, Building, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ParentProfileProps {
  onBack?: () => void;
}

const ParentProfile = ({ onBack }: ParentProfileProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [preAuthConsent, setPreAuthConsent] = useState(false);
  const [subsidyProgram, setSubsidyProgram] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => setProfile(data));
  }, [user]);

  return (
    <div className="px-4 pt-4">

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-full bg-light-sage flex items-center justify-center text-3xl">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full rounded-full object-cover" />
          ) : "👤"}
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">{profile?.display_name || "Parent"}</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="w-3 h-3" />{profile?.phone || "(123)456-7890"}
          </div>
        </div>
      </div>

      {/* Address & Postal Code */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">Address</span>
            </div>
            <span className="text-sm text-foreground">{profile?.address || "123 Main Street, Rich, On"}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">Postal Code</span>
            </div>
            <span className="text-sm text-foreground">L7E 5D8</span>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground">Email</span>
        </div>
        <span className="text-sm text-foreground">{user?.email || "JaneDoe@gmail.com"}</span>
      </div>

      {/* Banking Information */}
      <div className="mb-4">
        <h3 className="font-heading font-semibold text-foreground mb-3">Banking information</h3>
        <div className="bg-popover rounded-xl border border-border overflow-hidden">
          {/* Pre-Auth Consent */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <span className="text-sm font-semibold text-foreground">Pre-Authorization Consent</span>
            <Switch checked={preAuthConsent} onCheckedChange={setPreAuthConsent} />
          </div>
          <div className="bg-primary/5">
            {[
              { label: "Account Number", value: "(123) 456-7890" },
              { label: "Transit No", value: "12345" },
              { label: "Institution Number", value: "123" },
            ].map((item) => (
              <div key={item.label} className="px-4 py-3 flex items-center justify-between border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subsidy or Benefit Program */}
      <div className="bg-popover rounded-xl border border-border p-4 mb-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Subsidy or Benefit Program</span>
        <Switch checked={subsidyProgram} onCheckedChange={setSubsidyProgram} />
      </div>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full rounded-xl h-11 text-destructive border-destructive/30 hover:bg-destructive/10 mb-6"
        onClick={async () => {
          await signOut();
          navigate("/");
        }}
      >
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
};

export default ParentProfile;
