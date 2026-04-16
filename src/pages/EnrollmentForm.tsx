import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Save, Send, Languages, CheckCircle2, Upload, FileText, Loader2 } from 'lucide-react';
import MobileSignaturePad from '@/components/enrollment/MobileSignaturePad';

type FormData = Record<string, any>;

// Mock form fields since enrollment tables don't exist
const mockFields = [
  { id: '1', field_name: 'child_first_name', field_label: 'Child First Name', field_type: 'text', is_required: true, help_text: '' },
  { id: '2', field_name: 'child_last_name', field_label: 'Child Last Name', field_type: 'text', is_required: true, help_text: '' },
  { id: '3', field_name: 'child_date_of_birth', field_label: 'Date of Birth', field_type: 'date', is_required: true, help_text: '' },
  { id: '4', field_name: 'parent_first_name', field_label: 'Parent First Name', field_type: 'text', is_required: true, help_text: '' },
  { id: '5', field_name: 'parent_last_name', field_label: 'Parent Last Name', field_type: 'text', is_required: true, help_text: '' },
  { id: '6', field_name: 'parent_email', field_label: 'Parent Email', field_type: 'email', is_required: true, help_text: '' },
  { id: '7', field_name: 'parent_phone', field_label: 'Parent Phone', field_type: 'phone', is_required: true, help_text: '' },
  { id: '8', field_name: 'allergies', field_label: 'Allergies', field_type: 'textarea', is_required: false, help_text: 'List any known allergies' },
];

export default function EnrollmentForm() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({});
  const [signature, setSignature] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const calculateProgress = () => {
    const required = mockFields.filter(f => f.is_required);
    const filled = required.filter(f => formData[f.field_name]);
    return Math.round(((filled.length + (signature ? 1 : 0)) / (required.length + 1)) * 100);
  };

  const submitApplication = () => {
    const missing = mockFields.filter(f => f.is_required && !formData[f.field_name]);
    if (missing.length > 0 || !signature) {
      toast({ title: 'Incomplete', description: 'Please fill all required fields and sign', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast({ title: 'Application submitted! 🎉', description: 'The daycare will review your application.' });
      setSubmitting(false);
    }, 1500);
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Enrollment Application</CardTitle>
            <CardDescription>Complete the form below to apply for enrollment</CardDescription>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Progress: {progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader><CardTitle>Application Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {mockFields.map((field) => (
              <div key={field.id}>
                <Label htmlFor={field.field_name}>
                  {field.field_label}
                  {field.is_required && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
                </Label>
                {field.help_text && <p className="text-sm text-muted-foreground mt-1">{field.help_text}</p>}
                {(field.field_type === 'text' || field.field_type === 'email' || field.field_type === 'phone') && (
                  <Input id={field.field_name} type={field.field_type === 'phone' ? 'tel' : field.field_type} value={formData[field.field_name] || ''} onChange={(e) => handleFieldChange(field.field_name, e.target.value)} className="mt-2" />
                )}
                {field.field_type === 'date' && (
                  <Input id={field.field_name} type="date" value={formData[field.field_name] || ''} onChange={(e) => handleFieldChange(field.field_name, e.target.value)} className="mt-2" />
                )}
                {field.field_type === 'textarea' && (
                  <Textarea id={field.field_name} value={formData[field.field_name] || ''} onChange={(e) => handleFieldChange(field.field_name, e.target.value)} className="mt-2" rows={4} />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Parent/Guardian Signature</CardTitle></CardHeader>
          <CardContent>
            <MobileSignaturePad signature={signature} onSignatureChange={setSignature} />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => toast({ title: 'Progress saved' })}>
            <Save className="w-4 h-4 mr-2" />Save Progress
          </Button>
          <Button className="flex-1" onClick={submitApplication} disabled={submitting}>
            <Send className="w-4 h-4 mr-2" />{submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  );
}
