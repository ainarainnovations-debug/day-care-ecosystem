import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Plus, Utensils, Moon, Baby, Pencil, Pill, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const activityTypes = [
  { value: "meal", label: "Meal", icon: Utensils, emoji: "🍽️" },
  { value: "nap", label: "Nap", icon: Moon, emoji: "😴" },
  { value: "diaper", label: "Diaper", icon: Baby, emoji: "👶" },
  { value: "activity", label: "Activity", icon: Pencil, emoji: "🎨" },
  { value: "medicine", label: "Medicine", icon: Pill, emoji: "💊" },
  { value: "incident", label: "Incident", icon: AlertTriangle, emoji: "⚠️" },
  { value: "note", label: "Note", icon: Pencil, emoji: "📝" },
];

const mockChildren = [
  { id: "1", name: "Emma Wilson" },
  { id: "2", name: "Liam Johnson" },
  { id: "3", name: "Sofia Garcia" },
];

const recentActivities = [
  { id: "1", child: "Emma Wilson", type: "meal", title: "Lunch", time: "12:30 PM", desc: "Ate all her vegetables!" },
  { id: "2", child: "Liam Johnson", type: "nap", title: "Afternoon nap", time: "1:00 PM", desc: "Slept for 1.5 hours" },
  { id: "3", child: "Sofia Garcia", type: "activity", title: "Art time", time: "2:00 PM", desc: "Painted a sunflower" },
];

const TeacherActivities = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({ title: "Activity logged!", description: `${title} for ${mockChildren.find(c => c.id === selectedChild)?.name}` });
    setShowForm(false);
    setSelectedType("");
    setSelectedChild("");
    setTitle("");
    setDescription("");
  };

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-end mb-4">
        <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Log Activity
        </Button>
      </div>

      {/* New activity form */}
      {showForm && (
        <div className="bg-popover rounded-2xl border border-border p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select child" /></SelectTrigger>
              <SelectContent>
                {mockChildren.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {activityTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Title (e.g. Lunch, Art time)" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
          <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl resize-none" rows={2} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5"><Camera className="w-4 h-4" /> Photo</Button>
            <Button size="sm" className="rounded-xl ml-auto" onClick={handleSubmit} disabled={!selectedChild || !selectedType || !title}>
              Save Activity
            </Button>
          </div>
        </div>
      )}

      {/* Activity type quick buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {activityTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => { setShowForm(true); setSelectedType(t.value); }}
            className="flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-xl bg-secondary hover:bg-primary/10 transition-all"
          >
            <span className="text-xl">{t.emoji}</span>
            <span className="text-[10px] text-muted-foreground">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Recent activities */}
      <h2 className="font-heading font-semibold text-foreground mb-3">Recent</h2>
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const typeInfo = activityTypes.find((t) => t.value === activity.type);
          return (
            <div key={activity.id} className="bg-popover rounded-2xl p-4 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
                    {typeInfo?.emoji}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.child} • {activity.time}</p>
                  </div>
                </div>
              </div>
              {activity.desc && (
                <p className="text-xs text-muted-foreground mt-2 ml-[52px]">{activity.desc}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherActivities;
