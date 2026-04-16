import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import { 
  Plus, 
  Save, 
  Eye, 
  GripVertical, 
  Trash2, 
  FileText,
  Upload,
  Languages,
  CheckCircle2
} from 'lucide-react';
import FormFieldLibrary from '@/components/enrollment/FormFieldLibrary';
import StateComplianceSelector from '@/components/enrollment/StateComplianceSelector';
import DocumentRequirementsEditor from '@/components/enrollment/DocumentRequirementsEditor';

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

  // Form metadata
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [stateTemplate, setStateTemplate] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>(['en']);

  // Form fields
  const [fields, setFields] = useState<FormField[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);

  // Policy attachments
  const [handbookUrl, setHandbookUrl] = useState('');
  const [tuitionAgreementUrl, setTuitionAgreementUrl] = useState('');
  const [photoReleaseUrl, setPhotoReleaseUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [existingForms, setExistingForms] = useState<any[]>([]);

  useEffect(() => {
    loadExistingForms();
  }, []);

  const loadExistingForms = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('enrollment_forms')
      .select('*')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading forms:', error);
      return;
    }

    setExistingForms(data || []);
  };

  const loadForm = async (formId: string) => {
    const { data: form, error: formError } = await supabase
      .from('enrollment_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      toast({
        title: 'Error loading form',
        description: formError?.message,
        variant: 'destructive',
      });
      return;
    }

    // Load form metadata
    setFormName(form.name);
    setFormDescription(form.description || '');
    setStateTemplate(form.state_template);
    setIsActive(form.is_active);
    setEnabledLanguages(form.enabled_languages || ['en']);
    setHandbookUrl(form.handbook_url || '');
    setTuitionAgreementUrl(form.tuition_agreement_url || '');
    setPhotoReleaseUrl(form.photo_release_url || '');

    // Load fields
    const { data: fieldsData, error: fieldsError } = await supabase
      .from('enrollment_form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('display_order');

      if (!fieldsError && fieldsData) {
        // Map database label field to field_label for component
        const mappedFields = fieldsData.map((f: any) => ({
          ...f,
          field_label: f.label, // Map database 'label' to component 'field_label'
        }));
        setFields(mappedFields);
      }    // Load document requirements
    const { data: docsData, error: docsError } = await supabase
      .from('enrollment_document_requirements')
      .select('*')
      .eq('form_id', formId)
      .order('created_at');

    if (!docsError && docsData) {
      setDocumentRequirements(docsData);
    }

    toast({
      title: 'Form loaded',
      description: `Editing: ${form.name}`,
    });
  };

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
    
    toast({
      title: 'Field added',
      description: `${templateField.field_label} added to form`,
    });
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
    
    // Update display order
    newFields.forEach((field, idx) => {
      field.display_order = idx;
    });

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

    toast({
      title: 'State template applied',
      description: `Added ${requiredFields.length} ${state}-required fields`,
    });
  };

  const toggleLanguage = (lang: string) => {
    if (enabledLanguages.includes(lang)) {
      setEnabledLanguages(enabledLanguages.filter(l => l !== lang));
    } else {
      setEnabledLanguages([...enabledLanguages, lang]);
    }
  };

  const saveForm = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save forms',
        variant: 'destructive',
      });
      return;
    }

    if (!formName.trim()) {
      toast({
        title: 'Form name required',
        description: 'Please enter a name for your enrollment form',
        variant: 'destructive',
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: 'Add fields',
        description: 'Please add at least one field to your form',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Save form
      const { data: formData, error: formError } = await supabase
        .from('enrollment_forms')
        .insert({
          provider_id: user.id,
          name: formName,
          description: formDescription,
          state_template: stateTemplate,
          is_active: isActive,
          enabled_languages: enabledLanguages,
          handbook_url: handbookUrl || null,
          tuition_agreement_url: tuitionAgreementUrl || null,
          photo_release_url: photoReleaseUrl || null,
        })
        .select()
        .single();

      if (formError) throw formError;

      // Save fields
      const fieldsToInsert = fields.map((field, index) => ({
        form_id: formData.id,
        field_name: field.field_name,
        label: field.field_label, // Database column is 'label' not 'field_label'
        field_type: field.field_type as any,
        is_required: field.is_required,
        display_order: field.display_order,
        validation_rules: field.validation_rules || null,
        help_text: field.help_text || null,
        options: field.options || null,
        state_required_for: stateTemplate ? [stateTemplate] : null,
      }));

      const { error: fieldsError } = await supabase
        .from('enrollment_form_fields')
        .insert(fieldsToInsert);

      if (fieldsError) throw fieldsError;

      // Save document requirements
      if (documentRequirements.length > 0) {
        const docsToInsert = documentRequirements.map((doc, index) => ({
          form_id: formData.id,
          document_name: doc.document_name,
          description: doc.description || null,
          is_required: doc.is_required,
          display_order: index, // Add required display_order field
          allowed_file_types: doc.allowed_file_types,
          max_file_size_mb: doc.max_file_size_mb,
          state_required_for: stateTemplate ? [stateTemplate] : null,
        }));

        const { error: docsError } = await supabase
          .from('enrollment_document_requirements')
          .insert(docsToInsert);

        if (docsError) throw docsError;
      }

      toast({
        title: 'Form saved successfully! 🎉',
        description: `${formName} is ready to use`,
      });

      // Refresh list
      loadExistingForms();

      // Reset form
      setFormName('');
      setFormDescription('');
      setFields([]);
      setDocumentRequirements([]);
      setStateTemplate(null);
      
    } catch (error: any) {
      console.error('Error saving form:', error);
      toast({
        title: 'Error saving form',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enrollment Form Builder</h1>
            <p className="text-gray-600 mt-1">
              Create custom enrollment forms with drag-and-drop fields
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/provider/applications')}>
              <Eye className="w-4 h-4 mr-2" />
              View Applications
            </Button>
            <Button onClick={saveForm} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </div>

        {/* Existing Forms */}
        {existingForms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Enrollment Forms</CardTitle>
              <CardDescription>Load an existing form to edit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {existingForms.map(form => (
                  <Card 
                    key={form.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => loadForm(form.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{form.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                        </div>
                        {form.is_active ? (
                          <Badge variant="default" className="ml-2">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="ml-2">Inactive</Badge>
                        )}
                      </div>
                      {form.state_template && (
                        <Badge variant="outline" className="mt-2">
                          {form.state_template} Compliant
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Field Library */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Field Library</CardTitle>
                <CardDescription>Drag fields or click to add</CardDescription>
              </CardHeader>
              <CardContent>
                <FormFieldLibrary onAddField={addFieldFromTemplate} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">State Compliance</CardTitle>
                <CardDescription>Auto-add required fields</CardDescription>
              </CardHeader>
              <CardContent>
                <StateComplianceSelector onApplyTemplate={applyStateTemplate} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Form Builder */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="formName">Form Name *</Label>
                  <Input
                    id="formName"
                    placeholder="e.g., New Student Enrollment 2026"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="formDescription">Description</Label>
                  <Textarea
                    id="formDescription"
                    placeholder="Describe this enrollment form..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Form Status</Label>
                    <p className="text-sm text-gray-600">
                      {isActive ? 'Active - accepting new enrollments' : 'Inactive - not visible to parents'}
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { code: 'en', name: 'English' },
                      { code: 'es', name: 'Spanish' },
                      { code: 'fr', name: 'French' },
                      { code: 'ht', name: 'Haitian Creole' },
                      { code: 'zh', name: 'Mandarin' },
                    ].map(lang => (
                      <Badge
                        key={lang.code}
                        variant={enabledLanguages.includes(lang.code) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleLanguage(lang.code)}
                      >
                        <Languages className="w-3 h-3 mr-1" />
                        {lang.name}
                        {enabledLanguages.includes(lang.code) && (
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="fields">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fields">
                  <FileText className="w-4 h-4 mr-2" />
                  Form Fields ({fields.length})
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <Upload className="w-4 h-4 mr-2" />
                  Documents ({documentRequirements.length})
                </TabsTrigger>
                <TabsTrigger value="policies">
                  <FileText className="w-4 h-4 mr-2" />
                  Policy Attachments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fields">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Fields</CardTitle>
                    <CardDescription>
                      Fields in the order they'll appear to parents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {fields.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No fields yet. Add fields from the library on the left.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <button
                              className="cursor-move text-gray-400 hover:text-gray-600"
                              onClick={() => {
                                if (index > 0) moveField(field.id, 'up');
                              }}
                            >
                              <GripVertical className="w-5 h-5" />
                            </button>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{field.field_label}</span>
                                {field.is_required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{field.field_type}</Badge>
                              </div>
                              {field.help_text && (
                                <p className="text-sm text-gray-600 mt-1">{field.help_text}</p>
                              )}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveField(field.id, 'up')}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveField(field.id, 'down')}
                                disabled={index === fields.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeField(field.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <DocumentRequirementsEditor
                  requirements={documentRequirements}
                  onChange={setDocumentRequirements}
                />
              </TabsContent>

              <TabsContent value="policies">
                <Card>
                  <CardHeader>
                    <CardTitle>Policy Attachments</CardTitle>
                    <CardDescription>
                      Upload policies for parents to review and e-sign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="handbook">Parent Handbook URL</Label>
                      <Input
                        id="handbook"
                        placeholder="https://..."
                        value={handbookUrl}
                        onChange={(e) => setHandbookUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tuition">Tuition Agreement URL</Label>
                      <Input
                        id="tuition"
                        placeholder="https://..."
                        value={tuitionAgreementUrl}
                        onChange={(e) => setTuitionAgreementUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="photo">Photo Release URL</Label>
                      <Input
                        id="photo"
                        placeholder="https://..."
                        value={photoReleaseUrl}
                        onChange={(e) => setPhotoReleaseUrl(e.target.value)}
                      />
                    </div>

                    <p className="text-sm text-gray-600">
                      💡 Tip: Upload PDFs to Supabase Storage and paste the public URLs here
                    </p>
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
