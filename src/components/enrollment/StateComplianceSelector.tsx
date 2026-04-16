import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type StateTemplate = {
  state: string;
  name: string;
  fields: any[];
  documents: string[];
};

const STATE_TEMPLATES: StateTemplate[] = [
  {
    state: 'CA',
    name: 'California',
    fields: [
      {
        field_name: 'immunization_records_ca',
        field_label: 'California Immunization Records',
        field_type: 'file_upload',
        is_required: true,
        help_text: 'Required by California law',
      },
      {
        field_name: 'tb_test_clearance',
        field_label: 'Tuberculosis Test Clearance',
        field_type: 'file_upload',
        is_required: true,
        help_text: 'TB test required for all children in California childcare',
      },
      {
        field_name: 'licensed_exempt_provider',
        field_label: 'Licensed Exempt Provider Enrollment (if applicable)',
        field_type: 'checkbox',
        is_required: false,
      },
    ],
    documents: [
      'Immunization records (California)',
      'TB test clearance',
      'California Child Care Food Program forms',
    ],
  },
  {
    state: 'NY',
    name: 'New York',
    fields: [
      {
        field_name: 'child_health_exam_ny',
        field_label: 'Child Health Examination (DOH-3433)',
        field_type: 'file_upload',
        is_required: true,
        help_text: 'Required New York form DOH-3433',
      },
      {
        field_name: 'immunization_certificate_ny',
        field_label: 'Immunization Certificate (DOH-3434)',
        field_type: 'file_upload',
        is_required: true,
        help_text: 'Required New York form DOH-3434',
      },
      {
        field_name: 'lead_poisoning_risk',
        field_label: 'Lead Poisoning Risk Assessment',
        field_type: 'select',
        is_required: true,
        options: ['Low Risk', 'At Risk', 'Not Assessed'],
        help_text: 'Required for children under 6 years',
      },
      {
        field_name: 'dietary_needs_medical',
        field_label: 'Medical Statement for Dietary Needs',
        field_type: 'file_upload',
        is_required: false,
        help_text: 'If child has special dietary requirements',
      },
    ],
    documents: [
      'Child Health Examination (DOH-3433)',
      'Immunization Certificate (DOH-3434)',
      'Lead poisoning risk assessment',
    ],
  },
  {
    state: 'TX',
    name: 'Texas',
    fields: [
      {
        field_name: 'vision_hearing_screening_tx',
        field_label: 'Vision and Hearing Screening',
        field_type: 'file_upload',
        is_required: true,
        help_text: 'Required for children 4 years and older',
      },
      {
        field_name: 'tb_risk_assessment_tx',
        field_label: 'TB Risk Assessment',
        field_type: 'file_upload',
        is_required: true,
        help_text: 'Required Texas TB risk assessment',
      },
      {
        field_name: 'immunization_records_tx',
        field_label: 'Texas Immunization Records',
        field_type: 'file_upload',
        is_required: true,
        help_text: 'Must meet Texas immunization requirements',
      },
      {
        field_name: 'subsidy_eligibility_ccms',
        field_label: 'CCMS Subsidy Eligibility',
        field_type: 'checkbox',
        is_required: false,
        help_text: 'Check if receiving Texas Child Care Management Services subsidy',
      },
    ],
    documents: [
      'Vision/Hearing screening',
      'TB risk assessment',
      'Immunization records (Texas)',
      'CCMS subsidy forms (if applicable)',
    ],
  },
];

type Props = {
  onApplyTemplate: (state: string, fields: any[]) => void;
};

export default function StateComplianceSelector({ onApplyTemplate }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Automatically add state-required fields based on your location
      </p>

      {STATE_TEMPLATES.map((template) => (
        <Card
          key={template.state}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onApplyTemplate(template.state, template.fields)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{template.name}</h3>
                <Badge variant="outline">{template.state}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>{template.fields.length} required fields</strong>
              </p>
              <ul className="mt-2 space-y-1">
                {template.fields.map((field, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{field.field_label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-600 mb-1">Required Documents:</p>
            <div className="flex flex-wrap gap-1">
              {template.documents.map((doc, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {doc}
                </Badge>
              ))}
            </div>
          </div>

          <Button className="w-full mt-3" size="sm">
            Apply {template.state} Template
          </Button>
        </Card>
      ))}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-900">State Compliance</p>
            <p className="text-xs text-amber-700 mt-1">
              These templates include fields required by state licensing. Always verify current regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
