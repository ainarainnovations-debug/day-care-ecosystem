import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Phone, ChevronUp, ChevronDown, AlertTriangle, ShieldAlert, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getChildPhoto } from "@/assets/childPhotos";

interface ParentChildProfileProps {
  onBack?: () => void;
}

const ParentChildProfile = ({ onBack }: ParentChildProfileProps) => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showEmergency, setShowEmergency] = useState(true);
  const [showAllergies, setShowAllergies] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [childRes, profRes] = await Promise.all([
        supabase.from("children").select("*").eq("parent_id", user.id),
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      ]);
      setChildren(childRes.data || []);
      setProfile(profRes.data);
      if (childRes.data?.length) setSelectedChild(childRes.data[0]);
    };
    fetch();
  }, [user]);

  const childAge = selectedChild?.date_of_birth
    ? Math.floor((Date.now() - new Date(selectedChild.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const allergies = selectedChild?.allergies
    ? selectedChild.allergies.split(",").map((a: string) => a.trim()).filter(Boolean)
    : [];

  return (
    <div className="px-4 pt-4">

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-4">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedChild?.id === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <>
          {/* Child Info */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-full bg-light-coral flex items-center justify-center text-3xl overflow-hidden">
              {selectedChild.photo_url ? (
                <img src={selectedChild.photo_url} alt={selectedChild.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <img src={getChildPhoto(selectedChild.name)} alt={selectedChild.name} className="w-full h-full rounded-full object-cover" />
              )}
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">{selectedChild.name}</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                📅 Date of Birth · {selectedChild.date_of_birth || "Not set"}
              </div>
            </div>
          </div>

          {/* Parents Card */}
          <div className="bg-popover rounded-xl border border-border p-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-light-sage flex items-center justify-center text-lg">👩</div>
                <div>
                  <span className="text-sm font-semibold text-foreground">{profile?.display_name || "Mother"}</span>
                  <div className="text-[10px] text-muted-foreground">Mother</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Phone className="w-3 h-3" />{profile?.phone || "(123)456-7890"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-light-coral flex items-center justify-center text-lg">👨</div>
                <div>
                  <span className="text-sm font-semibold text-foreground">Father</span>
                  <div className="text-[10px] text-muted-foreground">Father</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Phone className="w-3 h-3" />(987)654-3210
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-popover rounded-xl border border-border mb-4">
            <button
              onClick={() => setShowEmergency(!showEmergency)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Emergency Contacts</span>
              </div>
              {showEmergency ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showEmergency && (
              <div className="px-4 pb-4 space-y-2">
                {[
                  { name: selectedChild.emergency_contact_name || "Emergency Contact", phone: selectedChild.emergency_contact_phone || "(123)234-1785" },
                  { name: "Lawrence", phone: "(123)876-5781" },
                  { name: "Roman Lori", phone: "(123)456-7890" },
                ].map((contact) => (
                  <div key={contact.name} className="bg-light-sage/50 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{contact.name}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />{contact.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Authorized Pick-up */}
          <div className="bg-popover rounded-xl border border-border p-4 mb-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Authorized Pick-up</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "Jae", relation: "Mother" },
                { name: "Jack", relation: "Father" },
                { name: "Katy", relation: "Nanny" },
              ].map((p) => (
                <div key={p.name} className="text-center">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <div className="text-xs text-muted-foreground">{p.relation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-popover rounded-xl border border-border mb-4">
            <button
              onClick={() => setShowAllergies(!showAllergies)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-semibold text-sm text-foreground">Allergy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary font-medium"># {allergies.length || 3} Items</span>
                {showAllergies ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {showAllergies && (
              <div className="px-4 pb-4 space-y-2">
                {(allergies.length > 0 ? allergies : ["Peanut", "Soybean", "Egg"]).map((a: string) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-foreground">
                    <AlertTriangle className="w-3 h-3 text-destructive" /> {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div className="bg-popover rounded-xl border border-border p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Dietary Restrictions</span>
              </div>
              <span className="text-xs text-primary font-medium"># 2 Items</span>
            </div>
          </div>

          {/* Medication */}
          <div className="bg-popover rounded-xl border border-border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-accent" />
                <span className="font-semibold text-sm text-foreground">Medication</span>
              </div>
              <span className="text-xs text-muted-foreground"># {selectedChild.medical_notes ? "1" : "No"} Items</span>
            </div>
          </div>
        </>
      )}

      {!selectedChild && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No children added yet.</p>
        </div>
      )}
    </div>
  );
};

export default ParentChildProfile;
