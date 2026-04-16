import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import ApplicationReviewDialog from '@/components/enrollment/ApplicationReviewDialog';

type Application = {
  id: string;
  form_id: string;
  status: string;
  submitted_at: string;
  form_data: any;
  form_name: string;
  is_complete: boolean;
  missing_fields: number;
  missing_documents: number;
  needs_signature: boolean;
};

export default function ApplicationInbox() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('enrollment_submissions')
        .select(`
          *,
          enrollment_forms!inner(name)
        `)
        .eq('provider_id', user.id)
        .in('status', ['submitted', 'under_review', 'on_hold'])
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Process applications with completeness check
      const processedApps = await Promise.all(
        (data || []).map(async (app: any) => {
          // Check completeness
          const { data: completeness } = await supabase
            .rpc('check_enrollment_completeness', { p_submission_id: app.id });

          const completenessData = completeness as any;

          return {
            id: app.id,
            form_id: app.form_id,
            status: app.status,
            submitted_at: app.submitted_at,
            form_data: app.form_data,
            form_name: app.enrollment_forms?.name || 'Unknown Form',
            is_complete: completenessData?.is_complete || false,
            missing_fields: completenessData?.missing_fields?.length || 0,
            missing_documents: completenessData?.missing_documents?.length || 0,
            needs_signature: completenessData?.needs_signature || false,
          };
        })
      );

      setApplications(processedApps);

    } catch (error: any) {
      console.error('Error loading applications:', error);
      toast({
        title: 'Error loading applications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const childName = `${app.form_data?.child_first_name || ''} ${app.form_data?.child_last_name || ''}`.toLowerCase();
      const parentName = `${app.form_data?.parent_first_name || ''} ${app.form_data?.parent_last_name || ''}`.toLowerCase();
      const query = searchQuery.toLowerCase();

      return childName.includes(query) || parentName.includes(query);
    }

    return true;
  });

  const getStatusBadge = (app: Application) => {
    if (!app.is_complete) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Incomplete</Badge>;
    }
    if (app.status === 'submitted') {
      return <Badge variant="default" className="bg-green-50 text-green-700 border-green-300">New</Badge>;
    }
    if (app.status === 'under_review') {
      return <Badge variant="secondary">In Review</Badge>;
    }
    if (app.status === 'on_hold') {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">On Hold</Badge>;
    }
    return <Badge variant="outline">{app.status}</Badge>;
  };

  const getCompletenessIndicator = (app: Application) => {
    if (app.is_complete) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm">Complete</span>
        </div>
      );
    }

    const issues = [];
    if (app.missing_fields > 0) issues.push(`${app.missing_fields} field${app.missing_fields > 1 ? 's' : ''}`);
    if (app.missing_documents > 0) issues.push(`${app.missing_documents} doc${app.missing_documents > 1 ? 's' : ''}`);
    if (app.needs_signature) issues.push('signature');

    return (
      <div className="flex items-center gap-1 text-amber-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Missing: {issues.join(', ')}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'submitted').length,
    incomplete: applications.filter(a => !a.is_complete).length,
    complete: applications.filter(a => a.is_complete).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enrollment Applications</h1>
            <p className="text-gray-600 mt-1">
              Review and process new student enrollments
            </p>
          </div>
          <Button onClick={() => navigate('/provider/form-builder')}>
            <Plus className="w-4 h-4 mr-2" />
            New Enrollment Form
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Submissions</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{stats.new}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">{stats.new}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Incomplete</p>
                  <p className="text-2xl font-bold mt-1 text-amber-600">{stats.incomplete}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Complete</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{stats.complete}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by child or parent name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">New</SelectItem>
                  <SelectItem value="under_review">In Review</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50 animate-spin" />
                <p>Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No applications found</p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Parent/Guardian</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completeness</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedApplication(app.id)}
                    >
                      <TableCell className="font-medium">
                        {app.form_data?.child_first_name} {app.form_data?.child_last_name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.form_data?.parent_first_name} {app.form_data?.parent_last_name}</p>
                          <p className="text-sm text-gray-600">{app.form_data?.parent_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{app.form_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{formatDate(app.submitted_at)}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(app)}
                      </TableCell>
                      <TableCell>
                        {getCompletenessIndicator(app)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      {selectedApplication && (
        <ApplicationReviewDialog
          applicationId={selectedApplication}
          open={!!selectedApplication}
          onClose={() => {
            setSelectedApplication(null);
            loadApplications();
          }}
        />
      )}
    </div>
  );
}
