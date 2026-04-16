import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Eye, GripVertical, Trash2, FileText, Languages, CheckCircle2 } from 'lucide-react';
import FormFieldLibrary from '@/components/enrollment/FormFieldLibrary';
import StateComplianceSelector from '@/components/enrollment/StateComplianceSelector';
import DocumentRequirementsEditor from '@/components/enrollment/DocumentRequirementsEditor';
import Navbar from '@/components/Navbar';

type FormField = {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  display_order: number;
  validation_rules?: any;
  help_text?: string;
  options?: string[];
};

type DocumentRequirement = {
  id: string;
  document_name: string;
  description?: string;
  is_required: boolean;
  allowed_file_types: string[];
  max_file_size_mb: number;
};

export default function FormBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [stateTemplate, setStateTemplate] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>(['en']);
  const [fields, setFields] = useState<FormField[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(false);

  const addFieldFromTemplate = (templateField: any) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      field_name: templateField.field_name,
      field_label: templateField.field_label,
      field_type: templateField.field_type,
      is_required: templateField.is_required || false,
      display_order: fields.length,
      validation_rules: templateField.validation_rules,
      help_text: templateField.help_text,
      options: templateField.options,
    };
    setFields([...fields, newField]);
    toast({ title: 'Field added', description: `${templateField.field_label} added to form` });
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((field, idx) => { field.display_order = idx; });
    setFields(newFields);
  };

  const applyStateTemplate = (state: string, requiredFields: any[]) => {
    const newFields = requiredFields.map((field, index) => ({
      id: crypto.randomUUID(),
      ...field,
      display_order: fields.length + index,
    }));
    setFields([...fields, ...newFields]);
    setStateTemplate(state);
    toast({ title: 'State template applied', description: `Added ${requiredFields.length} fields` });
  };

  const toggleLanguage = (lang: string) => {
    setEnabledLanguages(enabledLanguages.includes(lang) ? enabledLanguages.filter(l => l !== lang) : [...enabledLanguages, lang]);
  };

  const saveForm = () => {
    if (!formName.trim()) { toast({ title: 'Form name required', variant: 'destructive' }); return; }
    if (fields.length === 0) { toast({ title: 'Add fields', description: 'Add at least one field', variant: 'destructive' }); return; }
    toast({ title: 'Form saved! 🎉', description: `${formName} is ready. (Enrollment tables coming soon)` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Enrollment Form Builder</h1>
            <p className="text-muted-foreground mt-1">Create custom enrollment forms</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/provider/applications')}>
              <Eye className="w-4 h-4 mr-2" />View Applications
            </Button>
            <Button onClick={saveForm} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />{loading ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Field Library</CardTitle></CardHeader>
              <CardContent><FormFieldLibrary onAddField={addFieldFromTemplate} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">State Compliance</CardTitle></CardHeader>
              <CardContent><StateComplianceSelector onApplyTemplate={applyStateTemplate} /></CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle>Form Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Form Name *</Label><Input placeholder="e.g., New Student Enrollment 2026" value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
                <div><Label>Description</Label><Textarea placeholder="Describe this form..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} /></div>
                <div className="flex items-center justify-between">
                  <div><Label>Form Status</Label><p className="text-sm text-muted-foreground">{isActive ? 'Active' : 'Inactive'}</p></div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div>
                  <Label className="mb-2 block">Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {[{ code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }].map(lang => (
                      <Badge key={lang.code} variant={enabledLanguages.includes(lang.code) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleLanguage(lang.code)}>
                        <Languages className="w-3 h-3 mr-1" />{lang.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="fields">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fields"><FileText className="w-4 h-4 mr-2" />Fields ({fields.length})</TabsTrigger>
                <TabsTrigger value="documents"><FileText className="w-4 h-4 mr-2" />Documents</TabsTrigger>
              </TabsList>
              <TabsContent value="fields">
                <Card>
                  <CardContent className="p-4">
                    {fields.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No fields yet. Click fields from the library to add them.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {fields.map((field) => (
                          <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{field.field_label}</p>
                              <p className="text-xs text-muted-foreground">{field.field_type} {field.is_required && '• Required'}</p>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => removeField(field.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-4">
                    <DocumentRequirementsEditor requirements={documentRequirements} onUpdate={setDocumentRequirements} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
