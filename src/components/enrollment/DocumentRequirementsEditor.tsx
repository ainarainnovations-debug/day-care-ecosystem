import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText } from 'lucide-react';

type DocumentRequirement = {
  id: string;
  document_name: string;
  description?: string;
  is_required: boolean;
  allowed_file_types: string[];
  max_file_size_mb: number;
};

type Props = {
  requirements: DocumentRequirement[];
  onChange: (requirements: DocumentRequirement[]) => void;
};

const COMMON_DOCUMENTS = [
  {
    name: 'Birth Certificate',
    description: 'Official birth certificate or hospital record',
    file_types: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  {
    name: 'Immunization Records',
    description: 'Up-to-date immunization records from physician',
    file_types: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  {
    name: 'Proof of Address',
    description: 'Utility bill, lease, or mortgage statement (within last 60 days)',
    file_types: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  {
    name: 'Income Verification',
    description: 'For subsidy eligibility - pay stubs, tax returns, or benefits letter',
    file_types: ['application/pdf'],
  },
  {
    name: 'Custody Agreement',
    description: 'Court-ordered custody documents (if applicable)',
    file_types: ['application/pdf'],
  },
  {
    name: 'Medical Consent Form',
    description: 'Signed medical treatment authorization',
    file_types: ['application/pdf'],
  },
  {
    name: 'Photo Release Consent',
    description: 'Permission to photograph child for documentation',
    file_types: ['application/pdf'],
  },
];

const FILE_TYPE_OPTIONS = [
  { label: 'PDF', value: 'application/pdf' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'HEIC (iPhone)', value: 'image/heic' },
];

export default function DocumentRequirementsEditor({ requirements, onChange }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoc, setNewDoc] = useState({
    document_name: '',
    description: '',
    is_required: true,
    allowed_file_types: ['application/pdf', 'image/jpeg', 'image/png'],
    max_file_size_mb: 10,
  });

  const addRequirement = () => {
    if (!newDoc.document_name.trim()) return;

    const requirement: DocumentRequirement = {
      id: crypto.randomUUID(),
      ...newDoc,
    };

    onChange([...requirements, requirement]);
    
    // Reset form
    setNewDoc({
      document_name: '',
      description: '',
      is_required: true,
      allowed_file_types: ['application/pdf', 'image/jpeg', 'image/png'],
      max_file_size_mb: 10,
    });
    setShowAddForm(false);
  };

  const addCommonDocument = (doc: typeof COMMON_DOCUMENTS[0]) => {
    const requirement: DocumentRequirement = {
      id: crypto.randomUUID(),
      document_name: doc.name,
      description: doc.description,
      is_required: true,
      allowed_file_types: doc.file_types,
      max_file_size_mb: 10,
    };

    onChange([...requirements, requirement]);
  };

  const removeRequirement = (id: string) => {
    onChange(requirements.filter(r => r.id !== id));
  };

  const toggleRequired = (id: string) => {
    onChange(
      requirements.map(r =>
        r.id === id ? { ...r, is_required: !r.is_required } : r
      )
    );
  };

  const toggleFileType = (id: string, fileType: string) => {
    onChange(
      requirements.map(r => {
        if (r.id !== id) return r;
        
        const types = r.allowed_file_types.includes(fileType)
          ? r.allowed_file_types.filter(t => t !== fileType)
          : [...r.allowed_file_types, fileType];
        
        return { ...r, allowed_file_types: types };
      })
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Requirements</CardTitle>
        <CardDescription>
          Specify which documents parents must upload during enrollment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Add Common Documents */}
        <div>
          <Label className="mb-2 block">Quick Add Common Documents</Label>
          <div className="grid grid-cols-2 gap-2">
            {COMMON_DOCUMENTS.map((doc) => (
              <Button
                key={doc.name}
                variant="outline"
                size="sm"
                className="justify-start text-xs"
                onClick={() => addCommonDocument(doc)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {doc.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Requirements */}
        {requirements.length > 0 && (
          <div className="space-y-3">
            <Label>Current Requirements ({requirements.length})</Label>
            {requirements.map((req) => (
              <Card key={req.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">{req.document_name}</span>
                      {req.is_required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {req.description && (
                      <p className="text-sm text-gray-600 mt-1 ml-6">{req.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2 ml-6">
                      {req.allowed_file_types.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.split('/')[1].toUpperCase()}
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="text-xs">
                        Max {req.max_file_size_mb} MB
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleRequired(req.id)}
                    >
                      {req.is_required ? 'Make Optional' : 'Make Required'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRequirement(req.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Custom Document */}
        {!showAddForm ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Document Requirement
          </Button>
        ) : (
          <Card className="p-4 bg-gray-50">
            <div className="space-y-3">
              <div>
                <Label htmlFor="docName">Document Name *</Label>
                <Input
                  id="docName"
                  placeholder="e.g., Medical Consent Form"
                  value={newDoc.document_name}
                  onChange={(e) => setNewDoc({ ...newDoc, document_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="docDesc">Description</Label>
                <Textarea
                  id="docDesc"
                  placeholder="What should parents know about this document?"
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label>Allowed File Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {FILE_TYPE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Switch
                        checked={newDoc.allowed_file_types.includes(option.value)}
                        onCheckedChange={() => {
                          const types = newDoc.allowed_file_types.includes(option.value)
                            ? newDoc.allowed_file_types.filter(t => t !== option.value)
                            : [...newDoc.allowed_file_types, option.value];
                          setNewDoc({ ...newDoc, allowed_file_types: types });
                        }}
                      />
                      <Label className="cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="maxSize">Max File Size (MB)</Label>
                <Select
                  value={newDoc.max_file_size_mb.toString()}
                  onValueChange={(value) => setNewDoc({ ...newDoc, max_file_size_mb: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 MB</SelectItem>
                    <SelectItem value="10">10 MB</SelectItem>
                    <SelectItem value="20">20 MB</SelectItem>
                    <SelectItem value="50">50 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newDoc.is_required}
                    onCheckedChange={(checked) => setNewDoc({ ...newDoc, is_required: checked })}
                  />
                  <Label>Required Document</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addRequirement} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirement
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {requirements.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No document requirements yet.</p>
            <p className="text-sm mt-1">Add common documents or create custom requirements.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
