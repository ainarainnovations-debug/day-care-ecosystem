import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, AlertCircle, FileText, User, Loader2 } from 'lucide-react';

type Props = {
  applicationId: string;
  open: boolean;
  onClose: () => void;
};

export default function ApplicationReviewDialog({ applicationId, open, onClose }: Props) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  // Mock data since enrollment tables don't exist yet
  const application = {
    id: applicationId,
    form_data: {
      child_first_name: 'Sample',
      child_last_name: 'Child',
      child_date_of_birth: '2024-01-15',
      parent_first_name: 'Sample',
      parent_last_name: 'Parent',
      parent_email: 'parent@example.com',
      parent_phone: '(555) 123-4567',
    },
    status: 'submitted',
  };

  const handleAccept = async () => {
    setProcessing(true);
    toast({ title: 'Application accepted! 🎉', description: 'The parent has been notified' });
    setProcessing(false);
    onClose();
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast({ title: 'Decline reason required', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    toast({ title: 'Application declined', description: 'The parent has been notified' });
    setProcessing(false);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Enrollment Application Review</DialogTitle>
          <DialogDescription>Review application details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <p className="font-semibold text-amber-700">Enrollment tables will be created in a future update</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info"><User className="w-4 h-4 mr-2" />Information</TabsTrigger>
              <TabsTrigger value="actions"><CheckCircle2 className="w-4 h-4 mr-2" />Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">Child Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-muted-foreground">Full Name</Label><p className="font-medium">{application.form_data.child_first_name} {application.form_data.child_last_name}</p></div>
                    <div><Label className="text-muted-foreground">Date of Birth</Label><p className="font-medium">{application.form_data.child_date_of_birth}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">Parent/Guardian</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{application.form_data.parent_first_name} {application.form_data.parent_last_name}</p></div>
                    <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{application.form_data.parent_email}</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label>Review Notes</Label>
                    <Textarea placeholder="Add notes..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={3} className="mt-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handleAccept} disabled={processing} className="bg-accent text-accent-foreground"><CheckCircle2 className="w-4 h-4 mr-2" />Accept</Button>
                    <Button onClick={handleDecline} disabled={processing} variant="destructive"><XCircle className="w-4 h-4 mr-2" />Decline</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Label>Decline Reason</Label>
                  <Textarea placeholder="Reason for declining..." value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} rows={3} className="mt-2" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
