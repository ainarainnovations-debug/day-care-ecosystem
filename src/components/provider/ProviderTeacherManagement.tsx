import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  MapPin,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TeacherProfile, TimeEntry } from "@/types/teacher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeacherWithProfile extends TeacherProfile {
  profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

const ProviderTeacherManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<TeacherWithProfile[]>([]);
  const [pendingTimeEntries, setPendingTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    // Load teachers
    const { data: teacherData, error: teacherError } = await supabase
      .from("teacher_profiles")
      .select("*")
      .eq("provider_id", user.id);

    if (teacherError) {
      console.error("Error loading teachers:", teacherError);
    } else {
      // Fetch profile info separately for each teacher
      const teachersWithProfiles: TeacherWithProfile[] = [];
      for (const teacher of (teacherData || [])) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", teacher.user_id)
          .single();
        teachersWithProfiles.push({
          ...(teacher as unknown as TeacherProfile),
          profile: profileData || undefined,
        });
      }
      setTeachers(teachersWithProfiles);
    }

    // Load pending time entries
    const { data: entriesData, error: entriesError } = await supabase
      .from("time_entries")
      .select("*")
      .eq("provider_id", user.id)
      .eq("is_approved", false)
      .not("clock_out_time", "is", null)
      .order("clock_out_time", { ascending: false });

    if (entriesError) {
      console.error("Error loading time entries:", entriesError);
    } else {
      setPendingTimeEntries((entriesData as unknown as TimeEntry[]) || []);
    }

    setLoading(false);
  };

  const approveTimeEntry = async (entryId: string) => {
    const { error } = await supabase
      .from("time_entries")
      .update({ 
        is_approved: true, 
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      } as any)
      .eq("id", entryId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve time entry",
        variant: "destructive",
      });
    } else {
      toast({ title: "Approved! ✅", description: "Time entry has been approved" });
      loadData();
      setSelectedEntry(null);
    }
  };

  const rejectTimeEntry = async (entryId: string) => {
    const { error } = await (supabase
      .from("time_entries") as any)
      .delete()
      .eq("id", entryId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject time entry",
        variant: "destructive",
      });
    } else {
      toast({ title: "Rejected", description: "Time entry has been removed" });
      loadData();
      setSelectedEntry(null);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return "—";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">
          Teacher Management
        </h2>
        <p className="text-muted-foreground">
          Manage your teaching staff and approve time entries
        </p>
      </div>

      <Tabs defaultValue="teachers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teachers">
            <Users className="w-4 h-4 mr-2" />
            Teachers ({teachers.length})
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <Clock className="w-4 h-4 mr-2" />
            Pending Approvals ({pendingTimeEntries.length})
          </TabsTrigger>
        </TabsList>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-4">
          {teachers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No teachers yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate an invite code to add teachers
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={teacher.photo_url || teacher.profile?.avatar_url} />
                          <AvatarFallback>
                            {teacher.profile?.display_name?.[0]?.toUpperCase() || "T"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {teacher.profile?.display_name || "Teacher"}
                          </CardTitle>
                          <CardDescription>
                            {teacher.years_experience
                              ? `${teacher.years_experience} years experience`
                              : "New teacher"}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          teacher.employment_status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {teacher.employment_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {teacher.bio && (
                      <p className="text-sm text-muted-foreground">{teacher.bio}</p>
                    )}
                    
                    {teacher.certifications && teacher.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {teacher.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {teacher.hourly_rate && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">${teacher.hourly_rate}/hr</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Permissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          {pendingTimeEntries.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending approvals</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Time entries will appear here for your approval
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTimeEntries.map((entry: any) => (
                <Card key={entry.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarImage src={entry.teacher?.avatar_url} />
                          <AvatarFallback>
                            {entry.teacher?.display_name?.[0]?.toUpperCase() || "T"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">
                            {entry.teacher?.display_name || "Teacher"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{formatTime(entry.clock_in_time)}</span>
                            <span>→</span>
                            <span>{formatTime(entry.clock_out_time)}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary">
                              {formatDuration(entry.total_hours)}
                            </Badge>
                            {entry.gross_pay && (
                              <span className="text-sm font-medium text-accent">
                                ${entry.gross_pay.toFixed(2)}
                              </span>
                            )}
                            {entry.clock_in_lat && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                GPS Tracked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveTimeEntry(entry.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectTimeEntry(entry.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Time Entry Details Dialog */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Time Entry Details</DialogTitle>
              <DialogDescription>
                Review the details before approving
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Clock In</label>
                <p className="text-sm text-muted-foreground">
                  {formatTime(selectedEntry.clock_in_time)}
                </p>
                {selectedEntry.clock_in_lat && (
                  <p className="text-xs text-muted-foreground">
                    📍 {selectedEntry.clock_in_lat.toFixed(4)}, {selectedEntry.clock_in_lng?.toFixed(4)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Clock Out</label>
                <p className="text-sm text-muted-foreground">
                  {selectedEntry.clock_out_time && formatTime(selectedEntry.clock_out_time)}
                </p>
                {selectedEntry.clock_out_lat && (
                  <p className="text-xs text-muted-foreground">
                    📍 {selectedEntry.clock_out_lat.toFixed(4)}, {selectedEntry.clock_out_lng?.toFixed(4)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Total Hours</label>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(selectedEntry.total_hours)}
                </p>
              </div>
              {selectedEntry.break_duration_minutes && selectedEntry.break_duration_minutes > 0 && (
                <div>
                  <label className="text-sm font-medium">Break Time</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEntry.break_duration_minutes} minutes
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Gross Pay</label>
                <p className="text-lg font-bold text-accent">
                  ${selectedEntry.gross_pay?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-muted-foreground">
                  @ ${selectedEntry.hourly_rate_snapshot}/hr
                </p>
              </div>
              {selectedEntry.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectTimeEntry(selectedEntry.id)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => approveTimeEntry(selectedEntry.id)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProviderTeacherManagement;
