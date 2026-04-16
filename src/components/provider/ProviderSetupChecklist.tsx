import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SetupStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  action?: string;
}

const steps: SetupStep[] = [
  { id: "profile", label: "Complete business profile", description: "Add your business name, description, and provider type", completed: true },
  { id: "photos", label: "Upload at least 3 photos", description: "Show parents what your daycare looks like", completed: true },
  { id: "hours", label: "Set operating hours", description: "Define your weekly schedule and availability", completed: true },
  { id: "rates", label: "Set pricing & rates", description: "Add hourly, half-day, and full-day rates", completed: false, action: "Edit Profile" },
  { id: "license", label: "Add license number", description: "Verify your childcare license for parent trust", completed: false, action: "Edit Profile" },
  { id: "teacher", label: "Invite your first teacher", description: "Send a teacher invite code to your staff", completed: false, action: "Invites" },
  { id: "parent", label: "Create a parent invite code", description: "Generate enrollment codes for parents", completed: false, action: "Invites" },
];

const ProviderSetupChecklist = () => {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-popover rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-lg font-semibold text-foreground">Setup Progress</h3>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3 mb-3" />
        <p className="text-sm text-muted-foreground">
          {completedCount} of {steps.length} steps completed.{" "}
          {progress === 100
            ? "🎉 You're all set!"
            : "Complete the remaining steps to go live."}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${
              step.completed
                ? "bg-light-sage/20 border-accent/20"
                : "bg-popover border-border hover:border-primary/30"
            }`}
          >
            {/* Status icon */}
            <div className="flex-shrink-0">
              {step.completed ? (
                <CheckCircle2 className="w-6 h-6 text-accent" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-semibold">{i + 1}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className={`text-sm font-medium ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>

            {/* Action */}
            {!step.completed && step.action && (
              <button className="text-xs text-primary font-medium flex items-center gap-0.5 flex-shrink-0">
                {step.action} <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderSetupChecklist;
