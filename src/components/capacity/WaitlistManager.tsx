import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Clock, Mail, Phone, Send, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WaitlistEntry {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  child_first_name: string;
  child_last_name: string;
  child_age_months: number;
  age_group: string;
  desired_start_date: string;
  schedule_type: string;
  status: string;
  position: number;
  added_at: string;
}

interface WaitlistManagerProps {
  classrooms: Array<{
    id: string;
    name: string;
    age_group: string;
  }>;
}

// Mock data - will be connected to real tables in future
const mockWaitlist: WaitlistEntry[] = [
  {
    id: '1', parent_name: 'Sarah Johnson', parent_email: 'sarah@example.com', parent_phone: '(555) 123-4567',
    child_first_name: 'Emma', child_last_name: 'Johnson', child_age_months: 18,
    age_group: 'toddler', desired_start_date: '2026-05-01', schedule_type: 'full-time',
    status: 'active', position: 1, added_at: '2026-03-15T10:00:00Z'
  },
  {
    id: '2', parent_name: 'Mike Chen', parent_email: 'mike@example.com', parent_phone: '(555) 987-6543',
    child_first_name: 'Liam', child_last_name: 'Chen', child_age_months: 8,
    age_group: 'infant', desired_start_date: '2026-06-01', schedule_type: 'full-time',
    status: 'active', position: 2, added_at: '2026-03-20T14:00:00Z'
  },
];

export default function WaitlistManager({ classrooms }: WaitlistManagerProps) {
  const { toast } = useToast();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(mockWaitlist);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newEntry, setNewEntry] = useState({
    parent_name: '', parent_email: '', parent_phone: '',
    child_first_name: '', child_last_name: '', child_dob: '',
    age_group: 'infant', desired_start_date: '', schedule_type: 'full-time'
  });

  const handleAddToWaitlist = () => {
    const entry: WaitlistEntry = {
      id: Date.now().toString(),
      parent_name: newEntry.parent_name,
      parent_email: newEntry.parent_email,
      parent_phone: newEntry.parent_phone || null,
      child_first_name: newEntry.child_first_name,
      child_last_name: newEntry.child_last_name,
      child_age_months: 0,
      age_group: newEntry.age_group,
      desired_start_date: newEntry.desired_start_date,
      schedule_type: newEntry.schedule_type,
      status: 'active',
      position: waitlist.length + 1,
      added_at: new Date().toISOString(),
    };
    setWaitlist([...waitlist, entry]);
    toast({ title: 'Success', description: `${newEntry.child_first_name} added to waitlist` });
    setIsAddDialogOpen(false);
    setNewEntry({ parent_name: '', parent_email: '', parent_phone: '', child_first_name: '', child_last_name: '', child_dob: '', age_group: 'infant', desired_start_date: '', schedule_type: 'full-time' });
  };

  const handleOfferSpot = (entryId: string) => {
    setWaitlist(waitlist.map(e => e.id === entryId ? { ...e, status: 'spot-offered' } : e));
    toast({ title: 'Spot Offered', description: 'Family has been notified' });
  };

  const handleRemove = (entryId: string) => {
    setWaitlist(waitlist.filter(e => e.id !== entryId));
    toast({ title: 'Removed', description: 'Family removed from waitlist' });
  };

  const filtered = filterStatus === 'all' ? waitlist : waitlist.filter(e => e.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-accent text-accent-foreground">Active</Badge>;
      case 'spot-offered': return <Badge className="bg-secondary text-foreground">Spot Offered</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAgeGroupBadge = (ageGroup: string) => (
    <Badge variant="outline" className="capitalize">{ageGroup.replace('-', ' ')}</Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="spot-offered">Spot Offered</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="mr-2 h-4 w-4" />Add to Waitlist</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Family to Waitlist</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Parent Name</Label><Input value={newEntry.parent_name} onChange={(e) => setNewEntry({ ...newEntry, parent_name: e.target.value })} placeholder="John Smith" /></div>
              <div className="space-y-2"><Label>Parent Email</Label><Input type="email" value={newEntry.parent_email} onChange={(e) => setNewEntry({ ...newEntry, parent_email: e.target.value })} placeholder="john@example.com" /></div>
              <div className="space-y-2"><Label>Child First Name</Label><Input value={newEntry.child_first_name} onChange={(e) => setNewEntry({ ...newEntry, child_first_name: e.target.value })} placeholder="Emma" /></div>
              <div className="space-y-2"><Label>Child Last Name</Label><Input value={newEntry.child_last_name} onChange={(e) => setNewEntry({ ...newEntry, child_last_name: e.target.value })} placeholder="Smith" /></div>
              <div className="space-y-2"><Label>Age Group</Label>
                <Select value={newEntry.age_group} onValueChange={(v) => setNewEntry({ ...newEntry, age_group: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infant">Infant (0-12 mo)</SelectItem>
                    <SelectItem value="toddler">Toddler (12-30 mo)</SelectItem>
                    <SelectItem value="preschool">Preschool (30-48 mo)</SelectItem>
                    <SelectItem value="pre-k">Pre-K (48+ mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Desired Start Date</Label><Input type="date" value={newEntry.desired_start_date} onChange={(e) => setNewEntry({ ...newEntry, desired_start_date: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddToWaitlist}>Add to Waitlist</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No families on waitlist</Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Child</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell><Badge variant="outline" className="font-mono">#{entry.position}</Badge></TableCell>
                  <TableCell className="font-medium">{entry.child_first_name} {entry.child_last_name}</TableCell>
                  <TableCell>{getAgeGroupBadge(entry.age_group)}</TableCell>
                  <TableCell>{entry.parent_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{entry.parent_email}</div>
                      {entry.parent_phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{entry.parent_phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(entry.desired_start_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{format(new Date(entry.added_at), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {entry.status === 'active' && (
                        <Button size="sm" onClick={() => handleOfferSpot(entry.id)}>
                          <Send className="h-3 w-3 mr-1" />Offer
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleRemove(entry.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
