import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Send, 
  Languages, 
  CheckCircle2, 
  Upload,
  FileText,
  Loader2
} from 'lucide-react';
import MobileSignaturePad from '@/components/enrollment/MobileSignaturePad';

type FormData = Record<string, any>;

export default function EnrollmentForm() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [enrollmentForm, setEnrollmentForm] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
  const [signature, setSignature] = useState<string>('');

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentStep, setCurrentStep] = useState(0);

  const TRANSLATIONS: Record<string, any> = {
    en: {
      title: 'Enrollment Application',
      save: 'Save Progress',
      next: 'Next',
      back: 'Back',
      submit: 'Submit Application',
      required: 'Required',
      optional: 'Optional',
      uploadDoc: 'Upload Document',
      sign: 'Sign Here',
    },
    es: {
      title: 'Solicitud de Inscripción',
      save: 'Guardar Progreso',
      next: 'Siguiente',
      back: 'Atrás',
      submit: 'Enviar Solicitud',
      required: 'Requerido',
      optional: 'Opcional',
      uploadDoc: 'Cargar Documento',
      sign: 'Firmar Aquí',
    },
  };

  const t = (key: string) => TRANSLATIONS[currentLanguage]?.[key] || TRANSLATIONS.en[key] || key;

  useEffect(() => {
    if (token) {
      loadEnrollmentData();
    }
  }, [token]);

  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const loadEnrollmentData = async () => {
    if (!token) return;

    setLoading(true);

    try {
      // Load submission by token
      const { data: submissionData, error: submissionError } = await supabase
        .from('enrollment_submissions')
        .select('*')
        .eq('unique_link_token', token)
        .single();

      if (submissionError) {
        toast({
          title: 'Invalid enrollment link',
          description: 'This enrollment link is invalid or has expired',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      // Check if expired
      if (submissionData.expires_at && new Date(submissionData.expires_at) < new Date()) {
        toast({
          title: 'Link expired',
          description: 'This enrollment link has expired. Please contact the daycare for a new link.',
          variant: 'destructive',
        });
        return;
      }

      setSubmission(submissionData);

      // Load form
      const { data: formData, error: formError } = await supabase
        .from('enrollment_forms')
        .select('*')
        .eq('id', submissionData.form_id)
        .single();

      if (formError) throw formError;

      setEnrollmentForm(formData);
      setCurrentLanguage(formData.enabled_languages?.[0] || 'en');

      // Load fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('enrollment_form_fields')
        .select('*')
        .eq('form_id', submissionData.form_id)
        .order('display_order');

      if (fieldsError) throw fieldsError;
      setFormFields(fieldsData || []);

      // Load document requirements
      const { data: docsData, error: docsError } = await supabase
        .from('enrollment_document_requirements')
        .select('*')
        .eq('form_id', submissionData.form_id);

      if (docsError) throw docsError;
      setDocumentRequirements(docsData || []);

      // Load existing form data if resuming
      if (submissionData.form_data && typeof submissionData.form_data === 'object') {
        setFormData(submissionData.form_data as FormData);
      }

      if (submissionData.parent_signature_data) {
        setSignature(submissionData.parent_signature_data);
      }

    } catch (error: any) {
      console.error('Error loading enrollment:', error);
      toast({
        title: 'Error loading form',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!submission?.id || saving) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('enrollment_submissions')
        .update({
          form_data: formData,
          last_saved_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast({
        title: 'Progress saved',
        description: 'Your progress has been saved',
      });

    } catch (error: any) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleDocumentUpload = async (requirementId: string, file: File) => {
    if (!submission?.id) return;

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${submission.id}/${requirementId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('enrollment-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('enrollment-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { error: docError } = await supabase
        .from('enrollment_documents')
        .insert({
          submission_id: submission.id,
          requirement_id: requirementId,
          file_url: urlData.publicUrl,
          file_name: file.name,
          document_name: file.name,
          file_size_bytes: file.size,
          file_type: file.type,
          status: 'uploaded',
        });

      if (docError) throw docError;

      setUploadedDocs({
        ...uploadedDocs,
        [requirementId]: urlData.publicUrl,
      });

      toast({
        title: 'Document uploaded',
        description: `${file.name} uploaded successfully`,
      });

    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const submitApplication = async () => {
    if (!submission?.id) return;

    // Validation
    const missingRequired = formFields
      .filter(f => f.is_required && !formData[f.field_name])
      .map(f => f.field_label);

    const missingDocs = documentRequirements
      .filter(d => d.is_required && !uploadedDocs[d.id])
      .map(d => d.document_name);

    if (missingRequired.length > 0 || missingDocs.length > 0 || !signature) {
      toast({
        title: 'Incomplete application',
        description: 'Please fill all required fields, upload required documents, and sign the form',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('enrollment_submissions')
        .update({
          form_data: formData,
          parent_signature_data: signature,
          parent_signature_at: new Date().toISOString(),
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast({
        title: 'Application submitted! 🎉',
        description: 'Thank you! The daycare will review your application and contact you soon.',
      });

      // Show success page
      navigate(`/enrollment-success/${token}`);

    } catch (error: any) {
      console.error('Error submitting:', error);
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProgress = () => {
    const totalFields = formFields.filter(f => f.is_required).length;
    const filledFields = formFields.filter(f => f.is_required && formData[f.field_name]).length;
    
    const totalDocs = documentRequirements.filter(d => d.is_required).length;
    const uploadedRequiredDocs = documentRequirements.filter(d => d.is_required && uploadedDocs[d.id]).length;

    const hasSignature = signature ? 1 : 0;

    const total = totalFields + totalDocs + 1; // +1 for signature
    const completed = filledFields + uploadedRequiredDocs + hasSignature;

    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!enrollmentForm || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Enrollment form not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{enrollmentForm.name}</CardTitle>
                <CardDescription>{enrollmentForm.description}</CardDescription>
              </div>
              {enrollmentForm.enabled_languages && enrollmentForm.enabled_languages.length > 1 && (
                <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                  <SelectTrigger className="w-32">
                    <Languages className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollmentForm.enabled_languages.map((lang: string) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {progress}% Complete</span>
                <Button variant="ghost" size="sm" onClick={saveProgress} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : t('save')}
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formFields.map((field) => (
              <div key={field.id}>
                <Label htmlFor={field.field_name}>
                  {field.field_label}
                  {field.is_required && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {t('required')}
                    </Badge>
                  )}
                </Label>
                {field.help_text && (
                  <p className="text-sm text-gray-600 mt-1">{field.help_text}</p>
                )}

                {field.field_type === 'text' && (
                  <Input
                    id={field.field_name}
                    value={formData[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="mt-2"
                  />
                )}

                {field.field_type === 'email' && (
                  <Input
                    id={field.field_name}
                    type="email"
                    value={formData[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="mt-2"
                  />
                )}

                {field.field_type === 'phone' && (
                  <Input
                    id={field.field_name}
                    type="tel"
                    value={formData[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="mt-2"
                  />
                )}

                {field.field_type === 'date' && (
                  <Input
                    id={field.field_name}
                    type="date"
                    value={formData[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="mt-2"
                  />
                )}

                {field.field_type === 'textarea' && (
                  <Textarea
                    id={field.field_name}
                    value={formData[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                )}

                {field.field_type === 'select' && field.options && (
                  <Select
                    value={formData[field.field_name] || ''}
                    onValueChange={(value) => handleFieldChange(field.field_name, value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.field_type === 'checkbox' && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id={field.field_name}
                      checked={formData[field.field_name] || false}
                      onCheckedChange={(checked) => handleFieldChange(field.field_name, checked)}
                    />
                    <Label htmlFor={field.field_name} className="cursor-pointer">
                      {field.help_text}
                    </Label>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Document Uploads */}
        {documentRequirements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>
                Please upload the following documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentRequirements.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{doc.document_name}</span>
                        {doc.is_required && (
                          <Badge variant="destructive" className="text-xs">{t('required')}</Badge>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1 ml-7">{doc.description}</p>
                      )}
                      <div className="flex gap-1 mt-2 ml-7">
                        {doc.allowed_file_types.map((type: string) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.split('/')[1]?.toUpperCase()}
                          </Badge>
                        ))}
                        <Badge variant="secondary" className="text-xs">
                          Max {doc.max_file_size_mb} MB
                        </Badge>
                      </div>
                    </div>

                    <div>
                      {uploadedDocs[doc.id] ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Uploaded</span>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" asChild>
                          <label className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            {t('uploadDoc')}
                            <input
                              type="file"
                              className="hidden"
                              accept={doc.allowed_file_types.join(',')}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleDocumentUpload(doc.id, file);
                                }
                              }}
                            />
                          </label>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Signature</CardTitle>
            <CardDescription>
              By signing, you certify that all information provided is accurate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MobileSignaturePad
              signature={signature}
              onSignatureChange={setSignature}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Card>
          <CardContent className="p-6">
            <Button
              size="lg"
              className="w-full"
              onClick={submitApplication}
              disabled={submitting || progress < 100}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t('submit')}
                </>
              )}
            </Button>
            {progress < 100 && (
              <p className="text-sm text-center text-gray-600 mt-2">
                Complete all required fields to submit
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
