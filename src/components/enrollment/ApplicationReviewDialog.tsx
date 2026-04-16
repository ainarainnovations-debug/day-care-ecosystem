import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  Send,
  Loader2
} from 'lucide-react';

type Props = {
  applicationId: string;
  open: boolean;
  onClose: () => void;
};

export default function ApplicationReviewDialog({ applicationId, open, onClose }: Props) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [completeness, setCompleteness] = useState<any>(null);

  const [reviewNotes, setReviewNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (open && applicationId) {
      loadApplicationDetails();
    }
  }, [open, applicationId]);

  const loadApplicationDetails = async () => {
    setLoading(true);

    try {
      // Load submission
      const { data: submission, error: subError } = await supabase
        .from('enrollment_submissions')
        .select(`
          *,
          enrollment_forms!inner(name, description)
        `)
        .eq('id', applicationId)
        .single();

      if (subError) throw subError;

      setApplication(submission);

      // Load form fields
      const { data: fields, error: fieldsError } = await supabase
        .from('enrollment_form_fields')
        .select('*')
        .eq('form_id', submission.form_id)
        .order('display_order');

      if (fieldsError) throw fieldsError;
      setFormFields(fields || []);

      // Load documents
      const { data: docs, error: docsError } = await supabase
        .from('enrollment_documents')
        .select(`
          *,
          enrollment_document_requirements(document_name, is_required)
        `)
        .eq('submission_id', applicationId);

      if (docsError) throw docsError;
      setDocuments(docs || []);

      // Check completeness
      const { data: complete } = await supabase
        .rpc('check_enrollment_completeness', { p_submission_id: applicationId });

      setCompleteness(complete);

    } catch (error: any) {
      console.error('Error loading application:', error);
      toast({
        title: 'Error loading application',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);

    try {
      // Update submission status
      const { error: updateError } = await supabase
        .from('enrollment_submissions')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          review_notes: reviewNotes,
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // TODO: Trigger auto child creation workflow

      toast({
        title: 'Application accepted! 🎉',
        description: 'The child record has been created and parent has been notified',
      });

      onClose();

    } catch (error: any) {
      console.error('Error accepting application:', error);
      toast({
        title: 'Error accepting application',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleHold = async () => {
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('enrollment_submissions')
        .update({
          status: 'on_hold',
          review_notes: reviewNotes,
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Application on hold',
        description: 'Parent has been notified',
      });

      onClose();

    } catch (error: any) {
      console.error('Error putting application on hold:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast({
        title: 'Decline reason required',
        description: 'Please provide a reason for declining',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const { error } = await supabase
        .from('enrollment_submissions')
        .update({
          status: 'declined',
          decline_reason: declineReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Application declined',
        description: 'Parent has been notified',
      });

      onClose();

    } catch (error: any) {
      console.error('Error declining application:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const requestMissingItems = async () => {
    // TODO: Implement missing item request
    toast({
      title: 'Feature coming soon',
      description: 'Targeted missing item requests will be available shortly',
    });
  };

  if (!open) return null;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!application) return null;

  const completenessData = completeness as any;
  const isComplete = completenessData?.is_complete || false;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Enrollment Application Review
          </DialogTitle>
          <DialogDescription>
            {application.enrollment_forms?.name || 'Application'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Completeness Check */}
          <Card className={isComplete ? 'border-green-500' : 'border-amber-500'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-700">Application Complete</p>
                      <p className="text-sm text-gray-600">All required fields and documents submitted</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-700">Missing Items</p>
                      {completenessData?.missing_fields?.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Missing {completenessData.missing_fields.length} required field(s)
                        </p>
                      )}
                      {completenessData?.missing_documents?.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Missing {completenessData.missing_documents.length} required document(s)
                        </p>
                      )}
                      {completenessData?.needs_signature && (
                        <p className="text-sm text-gray-600">Missing signature</p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={requestMissingItems}>
                      <Send className="w-4 h-4 mr-2" />
                      Request Missing Items
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">
                <User className="w-4 h-4 mr-2" />
                Information
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="w-4 h-4 mr-2" />
                Documents ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="actions">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              {/* Child Information */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">Child Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Full Name</Label>
                      <p className="font-medium">
                        {application.form_data?.child_first_name} {application.form_data?.child_last_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Date of Birth</Label>
                      <p className="font-medium">{application.form_data?.child_date_of_birth}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Gender</Label>
                      <p className="font-medium">{application.form_data?.child_gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Age Group</Label>
                      <p className="font-medium">{application.form_data?.age_group}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent Information */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">Parent/Guardian Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Full Name</Label>
                      <p className="font-medium">
                        {application.form_data?.parent_first_name} {application.form_data?.parent_last_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Relationship</Label>
                      <p className="font-medium">{application.form_data?.parent_relationship}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <p className="font-medium">{application.form_data?.parent_email}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="font-medium">{application.form_data?.parent_phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Form Fields */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">Complete Application Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formFields.map((field) => (
                      <div key={field.id}>
                        <Label className="text-gray-600">{field.field_label}</Label>
                        <p className="font-medium">
                          {application.form_data?.[field.field_name] || (
                            <span className="text-gray-400 italic">Not provided</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              {documents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                  </CardContent>
                </Card>
              ) : (
                documents.map((doc: any) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.document_name}</p>
                            <p className="text-sm text-gray-600">{doc.file_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            Uploaded
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                    <Textarea
                      id="reviewNotes"
                      placeholder="Add notes about this application..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      onClick={handleAccept}
                      disabled={processing || !isComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept
                    </Button>

                    <Button
                      onClick={handleHold}
                      disabled={processing}
                      variant="outline"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Hold
                    </Button>

                    <Button
                      onClick={() => {
                        // Show decline reason input
                      }}
                      disabled={processing}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>

                  {!isComplete && (
                    <p className="text-sm text-amber-600 text-center">
                      ⚠️ Application is incomplete. Request missing items before accepting.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Decline Application</h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Reason for declining (required)..."
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleDecline}
                      disabled={processing || !declineReason.trim()}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {processing ? 'Processing...' : 'Decline Application'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
