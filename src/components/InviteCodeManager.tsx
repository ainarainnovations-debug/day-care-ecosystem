import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Check, Users, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const InviteCodeManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeType, setCodeType] = useState<string>("teacher_invite");
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [providerProfile, setProviderProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Get provider profile
    const { data: pp } = await supabase
      .from("provider_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    setProviderProfile(pp);

    // Get codes
    const { data } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    setCodes(data || []);
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!user || !providerProfile) return;
    setGenerating(true);

    const code = generateCode();
    const { error } = await supabase.from("invite_codes").insert({
      code,
      type: codeType as any,
      provider_id: providerProfile.id,
      created_by: user.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    if (error) {
      toast({ title: "Failed to generate code", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code generated!", description: `Share ${code} with your ${codeType === "teacher_invite" ? "teacher" : "parent"}.` });
      fetchData();
    }
    setGenerating(false);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Generate new code */}
      <div className="bg-light-coral/20 rounded-xl border border-primary/20 p-5">
        <h3 className="font-heading font-semibold text-foreground mb-3">Generate Invite Code</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Code Type</label>
            <Select value={codeType} onValueChange={setCodeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher_invite">
                  <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Teacher Invite</span>
                </SelectItem>
                <SelectItem value="parent_enrollment">
                  <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Parent Enrollment</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      {/* Codes list */}
      <div className="bg-popover rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-semibold text-foreground">Your Codes ({codes.length})</h3>
        </div>
        {codes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No codes generated yet. Create one above to invite teachers or confirm parent enrollments.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {codes.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <code className="text-lg font-mono font-bold text-foreground bg-secondary px-3 py-1 rounded">{c.code}</code>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {c.type === "teacher_invite" ? "👩‍🏫 Teacher" : "👨‍👩‍👧 Parent"}
                    </Badge>
                    {c.used_by && <Badge className="ml-1 bg-accent text-accent-foreground text-xs">Used</Badge>}
                    {!c.used_by && c.is_active && <Badge className="ml-1 bg-secondary text-foreground text-xs">Active</Badge>}
                    {!c.is_active && !c.used_by && <Badge variant="outline" className="ml-1 text-xs text-muted-foreground">Expired</Badge>}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCode(c.code, c.id)}
                  disabled={!!c.used_by}
                >
                  {copiedId === c.id ? <><Check className="w-3 h-3 mr-1" /> Copied</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteCodeManager;
