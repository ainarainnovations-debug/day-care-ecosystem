import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle2, AlertCircle, Clock, Search, Filter, Plus } from 'lucide-react';
import ApplicationReviewDialog from '@/components/enrollment/ApplicationReviewDialog';
import Navbar from '@/components/Navbar';

type Application = {
  id: string;
  status: string;
  submitted_at: string;
  form_data: any;
  form_name: string;
  is_complete: boolean;
};

// Mock data since enrollment tables don't exist yet
const mockApplications: Application[] = [
  {
    id: '1', status: 'submitted', submitted_at: '2026-04-10T10:00:00Z',
    form_data: { child_first_name: 'Emma', child_last_name: 'Johnson', parent_first_name: 'Sarah', parent_last_name: 'Johnson', parent_email: 'sarah@example.com' },
    form_name: 'New Student 2026', is_complete: true,
  },
  {
    id: '2', status: 'under_review', submitted_at: '2026-04-08T14:00:00Z',
    form_data: { child_first_name: 'Liam', child_last_name: 'Chen', parent_first_name: 'Mike', parent_last_name: 'Chen', parent_email: 'mike@example.com' },
    form_name: 'New Student 2026', is_complete: false,
  },
];

export default function ApplicationInbox() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  const filteredApplications = mockApplications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (searchQuery) {
      const name = `${app.form_data?.child_first_name} ${app.form_data?.child_last_name}`.toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Enrollment Applications</h1>
            <p className="text-muted-foreground mt-1">Review and process new enrollments</p>
          </div>
          <Button onClick={() => navigate('/provider/form-builder')}>
            <Plus className="w-4 h-4 mr-2" />New Form
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">New</SelectItem>
                  <SelectItem value="under_review">In Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Applications ({filteredApplications.length})</CardTitle></CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No applications found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className="cursor-pointer" onClick={() => setSelectedApplication(app.id)}>
                      <TableCell className="font-medium">{app.form_data?.child_first_name} {app.form_data?.child_last_name}</TableCell>
                      <TableCell>{app.form_data?.parent_first_name} {app.form_data?.parent_last_name}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'submitted' ? 'default' : 'secondary'}>
                          {app.status === 'submitted' ? 'New' : 'In Review'}
                        </Badge>
                      </TableCell>
                      <TableCell><Button size="sm" variant="outline">Review</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedApplication && (
        <ApplicationReviewDialog
          applicationId={selectedApplication}
          open={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
}
