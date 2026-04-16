import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  child_date_of_birth: string;
  child_age_months: number;
  age_group: string;
  classroom_id: string | null;
  desired_start_date: string;
  schedule_type: string;
  status: string;
  position: number;
  added_at: string;
  spot_offered_at: string | null;
  spot_offer_expires_at: string | null;
  last_notified_at: string | null;
}

interface WaitlistManagerProps {
  classrooms: Array<{
    id: string;
    name: string;
    age_group: string;
  }>;
}

export default function WaitlistManager({ classrooms }: WaitlistManagerProps) {
  const { toast } = useToast();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClassroom, setFilterClassroom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    child_first_name: '',
    child_last_name: '',
    child_dob: '',
    age_group: 'infant',
    desired_start_date: '',
    schedule_type: 'full-time'
  });

  useEffect(() => {
    fetchWaitlist();
  }, [filterClassroom, filterStatus]);

  const fetchWaitlist = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('waitlist')
        .select('*')
        .order('position', { ascending: true })
        .order('added_at', { ascending: true });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (filterClassroom !== 'all') {
        query = query.eq('classroom_id', filterClassroom);
      }

      const { data, error } = await query;

      if (error) throw error;

      setWaitlist(data || []);

    } catch (error) {
      console.error('Error fetching waitlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load waitlist',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWaitlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase.rpc('add_to_waitlist', {
        p_provider_id: profile.id,
        p_parent_name: newEntry.parent_name,
        p_parent_email: newEntry.parent_email,
        p_child_first_name: newEntry.child_first_name,
        p_child_last_name: newEntry.child_last_name,
        p_child_dob: newEntry.child_dob,
        p_age_group: newEntry.age_group,
        p_desired_start_date: newEntry.desired_start_date,
        p_schedule_type: newEntry.schedule_type
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${newEntry.child_first_name} ${newEntry.child_last_name} added to waitlist`
      });

      setIsAddDialogOpen(false);
      setNewEntry({
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        child_first_name: '',
        child_last_name: '',
        child_dob: '',
        age_group: 'infant',
        desired_start_date: '',
        schedule_type: 'full-time'
      });
      
      fetchWaitlist();

    } catch (error: any) {
      console.error('Error adding to waitlist:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to waitlist',
        variant: 'destructive'
      });
    }
  };

  const handleOfferSpot = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('waitlist')
        .update({
          status: 'spot-offered',
          spot_offered_at: new Date().toISOString(),
          spot_offer_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
          last_notified_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Spot Offered',
        description: 'Family has been notified and has 48 hours to respond'
      });

      fetchWaitlist();

    } catch (error: any) {
      console.error('Error offering spot:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to offer spot',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveFromWaitlist = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('waitlist')
        .update({ status: 'withdrew' })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Removed',
        description: 'Family removed from waitlist'
      });

      fetchWaitlist();

    } catch (error: any) {
      console.error('Error removing from waitlist:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from waitlist',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500">Active</Badge>;
      case 'spot-offered':
        return <Badge className="bg-yellow-500">Spot Offered</Badge>;
      case 'enrolled':
        return <Badge className="bg-green-500">Enrolled</Badge>;
      case 'withdrew':
        return <Badge variant="outline">Withdrew</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAgeGroupBadge = (ageGroup: string) => {
    const colors: Record<string, string> = {
      'infant': 'bg-purple-100 text-purple-800',
      'toddler': 'bg-blue-100 text-blue-800',
      'preschool': 'bg-green-100 text-green-800',
      'pre-k': 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge variant="outline" className={colors[ageGroup] || ''}>
        {ageGroup.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading waitlist...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <Select value={filterClassroom} onValueChange={setFilterClassroom}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Classrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classrooms</SelectItem>
              {classrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="spot-offered">Spot Offered</SelectItem>
              <SelectItem value="enrolled">Enrolled</SelectItem>
              <SelectItem value="withdrew">Withdrew</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add to Waitlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Family to Waitlist</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Name</Label>
                <Input
                  value={newEntry.parent_name}
                  onChange={(e) => setNewEntry({ ...newEntry, parent_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Email</Label>
                <Input
                  type="email"
                  value={newEntry.parent_email}
                  onChange={(e) => setNewEntry({ ...newEntry, parent_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Phone</Label>
                <Input
                  value={newEntry.parent_phone}
                  onChange={(e) => setNewEntry({ ...newEntry, parent_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Child First Name</Label>
                <Input
                  value={newEntry.child_first_name}
                  onChange={(e) => setNewEntry({ ...newEntry, child_first_name: e.target.value })}
                  placeholder="Emma"
                />
              </div>
              <div className="space-y-2">
                <Label>Child Last Name</Label>
                <Input
                  value={newEntry.child_last_name}
                  onChange={(e) => setNewEntry({ ...newEntry, child_last_name: e.target.value })}
                  placeholder="Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Child Date of Birth</Label>
                <Input
                  type="date"
                  value={newEntry.child_dob}
                  onChange={(e) => setNewEntry({ ...newEntry, child_dob: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Age Group</Label>
                <Select value={newEntry.age_group} onValueChange={(value) => setNewEntry({ ...newEntry, age_group: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infant">Infant (0-12 mo)</SelectItem>
                    <SelectItem value="toddler">Toddler (12-30 mo)</SelectItem>
                    <SelectItem value="preschool">Preschool (30-48 mo)</SelectItem>
                    <SelectItem value="pre-k">Pre-K (48+ mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Desired Start Date</Label>
                <Input
                  type="date"
                  value={newEntry.desired_start_date}
                  onChange={(e) => setNewEntry({ ...newEntry, desired_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Schedule Type</Label>
                <Select value={newEntry.schedule_type} onValueChange={(value) => setNewEntry({ ...newEntry, schedule_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="drop-in">Drop-In</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddToWaitlist}>
                Add to Waitlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Waitlist Table */}
      {waitlist.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No families on waitlist matching your filters
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Child Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waitlist.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      #{entry.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.child_first_name} {entry.child_last_name}
                  </TableCell>
                  <TableCell>
                    {entry.child_age_months} months
                  </TableCell>
                  <TableCell>
                    {getAgeGroupBadge(entry.age_group)}
                  </TableCell>
                  <TableCell>{entry.parent_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {entry.parent_email}
                      </div>
                      {entry.parent_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {entry.parent_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.desired_start_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="capitalize">
                    {entry.schedule_type.replace('-', ' ')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(entry.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {format(new Date(entry.added_at), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {entry.status === 'active' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleOfferSpot(entry.id)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Offer Spot
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRemoveFromWaitlist(entry.id)}
                      >
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
