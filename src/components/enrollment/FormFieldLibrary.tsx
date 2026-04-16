import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Users, 
  Phone, 
  MapPin, 
  Heart,
  FileText,
  Calendar,
  Mail,
  Hash,
  CheckSquare,
  List,
  Upload
} from 'lucide-react';

type FieldTemplate = {
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  help_text?: string;
  validation_rules?: any;
  options?: string[];
  icon: any;
};

const FIELD_TEMPLATES: Record<string, FieldTemplate[]> = {
  'Child Information': [
    {
      field_name: 'child_first_name',
      field_label: 'Child First Name',
      field_type: 'text',
      is_required: true,
      help_text: 'Legal first name',
      icon: User,
    },
    {
      field_name: 'child_last_name',
      field_label: 'Child Last Name',
      field_type: 'text',
      is_required: true,
      help_text: 'Legal last name',
      icon: User,
    },
    {
      field_name: 'child_date_of_birth',
      field_label: 'Date of Birth',
      field_type: 'date',
      is_required: true,
      icon: Calendar,
    },
    {
      field_name: 'child_gender',
      field_label: 'Gender',
      field_type: 'select',
      is_required: false,
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      icon: User,
    },
    {
      field_name: 'child_ssn',
      field_label: 'Social Security Number',
      field_type: 'text',
      is_required: false,
      help_text: 'Optional - for subsidy programs',
      validation_rules: { pattern: '^\\d{3}-\\d{2}-\\d{4}$' },
      icon: Hash,
    },
  ],
  'Parent/Guardian': [
    {
      field_name: 'parent_first_name',
      field_label: 'Parent/Guardian First Name',
      field_type: 'text',
      is_required: true,
      icon: Users,
    },
    {
      field_name: 'parent_last_name',
      field_label: 'Parent/Guardian Last Name',
      field_type: 'text',
      is_required: true,
      icon: Users,
    },
    {
      field_name: 'parent_email',
      field_label: 'Email Address',
      field_type: 'email',
      is_required: true,
      icon: Mail,
    },
    {
      field_name: 'parent_phone',
      field_label: 'Phone Number',
      field_type: 'phone',
      is_required: true,
      icon: Phone,
    },
    {
      field_name: 'parent_address',
      field_label: 'Home Address',
      field_type: 'address',
      is_required: true,
      icon: MapPin,
    },
    {
      field_name: 'parent_relationship',
      field_label: 'Relationship to Child',
      field_type: 'select',
      is_required: true,
      options: ['Mother', 'Father', 'Guardian', 'Foster Parent', 'Other'],
      icon: Users,
    },
    {
      field_name: 'parent_employer',
      field_label: 'Employer',
      field_type: 'text',
      is_required: false,
      icon: FileText,
    },
  ],
  'Emergency Contacts': [
    {
      field_name: 'emergency_contact_1_name',
      field_label: 'Emergency Contact 1 - Name',
      field_type: 'text',
      is_required: true,
      icon: Phone,
    },
    {
      field_name: 'emergency_contact_1_phone',
      field_label: 'Emergency Contact 1 - Phone',
      field_type: 'phone',
      is_required: true,
      icon: Phone,
    },
    {
      field_name: 'emergency_contact_1_relationship',
      field_label: 'Emergency Contact 1 - Relationship',
      field_type: 'text',
      is_required: true,
      help_text: 'e.g., Grandparent, Aunt, Family Friend',
      icon: Users,
    },
    {
      field_name: 'emergency_contact_2_name',
      field_label: 'Emergency Contact 2 - Name',
      field_type: 'text',
      is_required: false,
      icon: Phone,
    },
    {
      field_name: 'emergency_contact_2_phone',
      field_label: 'Emergency Contact 2 - Phone',
      field_type: 'phone',
      is_required: false,
      icon: Phone,
    },
  ],
  'Medical Information': [
    {
      field_name: 'allergies',
      field_label: 'Allergies',
      field_type: 'textarea',
      is_required: false,
      help_text: 'List all known allergies (food, environmental, medication)',
      icon: Heart,
    },
    {
      field_name: 'medications',
      field_label: 'Current Medications',
      field_type: 'textarea',
      is_required: false,
      help_text: 'List all medications with dosage',
      icon: Heart,
    },
    {
      field_name: 'physician_name',
      field_label: "Child's Physician Name",
      field_type: 'text',
      is_required: true,
      icon: User,
    },
    {
      field_name: 'physician_phone',
      field_label: "Physician Phone Number",
      field_type: 'phone',
      is_required: true,
      icon: Phone,
    },
    {
      field_name: 'insurance_provider',
      field_label: 'Insurance Provider',
      field_type: 'text',
      is_required: false,
      icon: FileText,
    },
    {
      field_name: 'insurance_policy_number',
      field_label: 'Insurance Policy Number',
      field_type: 'text',
      is_required: false,
      icon: Hash,
    },
  ],
  'Authorized Pickups': [
    {
      field_name: 'authorized_pickup_1_name',
      field_label: 'Authorized Pickup 1 - Name',
      field_type: 'text',
      is_required: true,
      help_text: 'Person allowed to pick up child',
      icon: Users,
    },
    {
      field_name: 'authorized_pickup_1_phone',
      field_label: 'Authorized Pickup 1 - Phone',
      field_type: 'phone',
      is_required: true,
      icon: Phone,
    },
    {
      field_name: 'authorized_pickup_1_relationship',
      field_label: 'Authorized Pickup 1 - Relationship',
      field_type: 'text',
      is_required: true,
      icon: Users,
    },
    {
      field_name: 'authorized_pickup_2_name',
      field_label: 'Authorized Pickup 2 - Name',
      field_type: 'text',
      is_required: false,
      icon: Users,
    },
  ],
  'Program Details': [
    {
      field_name: 'desired_start_date',
      field_label: 'Desired Start Date',
      field_type: 'date',
      is_required: true,
      icon: Calendar,
    },
    {
      field_name: 'age_group',
      field_label: 'Age Group',
      field_type: 'select',
      is_required: true,
      options: ['Infant (0-12 months)', 'Toddler (13-35 months)', 'Preschool (3-4 years)', 'Pre-K (4-5 years)'],
      icon: Users,
    },
    {
      field_name: 'schedule_preference',
      field_label: 'Schedule Preference',
      field_type: 'select',
      is_required: true,
      options: ['Full-time (5 days)', 'Part-time (3 days)', 'Drop-in'],
      icon: Calendar,
    },
    {
      field_name: 'is_subsidy_family',
      field_label: 'Receiving Child Care Subsidy?',
      field_type: 'checkbox',
      is_required: false,
      help_text: 'Check if you have CCAP or other subsidy eligibility',
      icon: CheckSquare,
    },
  ],
};

type Props = {
  onAddField: (field: any) => void;
};

export default function FormFieldLibrary({ onAddField }: Props) {
  return (
    <div className="space-y-4">
      {Object.entries(FIELD_TEMPLATES).map(([category, fields]) => (
        <div key={category}>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">{category}</h3>
          <div className="space-y-2">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <Card
                  key={field.field_name}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                  onClick={() => onAddField(field)}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{field.field_label}</span>
                        {field.is_required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {field.help_text && (
                        <p className="text-xs text-gray-600 mt-1">{field.help_text}</p>
                      )}
                      <Badge variant="outline" className="text-xs mt-1">{field.field_type}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
