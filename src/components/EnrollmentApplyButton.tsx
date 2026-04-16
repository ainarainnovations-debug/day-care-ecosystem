import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send } from "lucide-react";

interface EnrollmentApplyButtonProps {
  providerId: string;
  providerName: string;
}

const EnrollmentApplyButton = ({ providerId, providerName }: EnrollmentApplyButtonProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleApply = async () => {
    if (!user) {
      toast({ title: "Please sign up first", description: "Create an account to apply for enrollment." });
      navigate("/signup");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("enrollment_applications").insert({
      parent_id: user.id,
      provider_id: providerId,
      message: message.trim() || null,
    });

    if (error) {
      toast({ title: "Application failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application sent!", description: `Your enrollment application to ${providerName} has been submitted. You'll receive a code once approved.` });
      setOpen(false);
      setMessage("");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity">
          Apply for Enrollment
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Apply to {providerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Submit your enrollment application. Once the provider approves, you'll receive an enrollment code to unlock full access (dashboard, messaging, activity feed).
          </p>
          <Textarea
            placeholder="Tell the provider about your child and any questions you have... (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <Button onClick={handleApply} disabled={loading} className="w-full bg-primary text-primary-foreground">
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentApplyButton;
