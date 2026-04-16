import { supabase } from "@/integrations/supabase/client";
import type { 
  TeacherProfile, 
  TeacherPermissions, 
  TimeEntry,
  TeacherDashboardStats,
  ClockInOutRequest,
  UpdateTimeEntryRequest 
} from "@/types/teacher";

// =====================================================
// Teacher Profile Management
// =====================================================

export const getTeacherProfile = async (userId: string): Promise<TeacherProfile | null> => {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching teacher profile:", error);
    return null;
  }

  return data as unknown as TeacherProfile;
};

export const updateTeacherProfile = async (
  userId: string,
  updates: Partial<TeacherProfile>
): Promise<boolean> => {
  const { error } = await supabase
    .from("teacher_profiles")
    .update(updates as any)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating teacher profile:", error);
    return false;
  }

  return true;
};

// =====================================================
// Teacher Permissions
// =====================================================

export const getTeacherPermissions = async (
  teacherId: string,
  providerId: string
): Promise<TeacherPermissions | null> => {
  const { data, error } = await supabase
    .from("teacher_permissions")
    .select("*")
    .eq("teacher_id", teacherId)
    .eq("provider_id", providerId)
    .single();

  if (error) {
    console.error("Error fetching teacher permissions:", error);
    return null;
  }

  return data as unknown as TeacherPermissions;
};

export const hasPermission = async (
  teacherId: string,
  providerId: string,
  permission: keyof Omit<TeacherPermissions, "id" | "teacher_id" | "provider_id" | "created_at" | "updated_at">
): Promise<boolean> => {
  const permissions = await getTeacherPermissions(teacherId, providerId);
  return permissions ? permissions[permission] : false;
};

// =====================================================
// Time Tracking
// =====================================================

export const clockIn = async (
  teacherId: string,
  providerId: string,
  location?: ClockInOutRequest
): Promise<TimeEntry | null> => {
  const profile = await getTeacherProfile(teacherId);
  
  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      teacher_id: teacherId,
      provider_id: providerId,
      clock_in_time: new Date().toISOString(),
      clock_in_lat: location?.lat,
      clock_in_lng: location?.lng,
      hourly_rate_snapshot: profile?.hourly_rate || 0,
    } as any)
    .select()
    .single();

  if (error) {
    console.error("Error clocking in:", error);
    return null;
  }

  return data as unknown as TimeEntry;
};

export const clockOut = async (
  timeEntryId: string,
  location?: ClockInOutRequest
): Promise<TimeEntry | null> => {
  const { data, error } = await supabase
    .from("time_entries")
    .update({
      clock_out_time: new Date().toISOString(),
      clock_out_lat: location?.lat,
      clock_out_lng: location?.lng,
    } as any)
    .eq("id", timeEntryId)
    .select()
    .single();

  if (error) {
    console.error("Error clocking out:", error);
    return null;
  }

  return data as unknown as TimeEntry;
};

export const getCurrentTimeEntry = async (teacherId: string): Promise<TimeEntry | null> => {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("teacher_id", teacherId)
    .is("clock_out_time", null)
    .order("clock_in_time", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching current time entry:", error);
    return null;
  }

  return (data as unknown as TimeEntry) || null;
};

export const updateTimeEntry = async (
  timeEntryId: string,
  updates: UpdateTimeEntryRequest
): Promise<boolean> => {
  const { error } = await supabase
    .from("time_entries")
    .update(updates as any)
    .eq("id", timeEntryId);

  if (error) {
    console.error("Error updating time entry:", error);
    return false;
  }

  return true;
};

export const getTimeEntries = async (
  teacherId: string,
  startDate?: Date,
  endDate?: Date
): Promise<TimeEntry[]> => {
  let query = supabase
    .from("time_entries")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("clock_in_time", { ascending: false });

  if (startDate) {
    query = query.gte("clock_in_time", startDate.toISOString());
  }

  if (endDate) {
    query = query.lte("clock_in_time", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching time entries:", error);
    return [];
  }

  return (data as unknown as TimeEntry[]) || [];
};

// =====================================================
// Dashboard Stats (computed from time_entries)
// =====================================================

export const getTeacherDashboardStats = async (
  teacherId: string
): Promise<TeacherDashboardStats | null> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("teacher_id", teacherId)
    .gte("clock_in_time", startOfMonth.toISOString());

  if (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }

  const entries = (data as unknown as TimeEntry[]) || [];
  const workedDays = new Set(entries.map(e => e.clock_in_time.split("T")[0]));

  return {
    teacher_id: teacherId,
    days_worked_this_month: workedDays.size,
    total_hours_this_month: entries.reduce((sum, e) => sum + (e.total_hours || 0), 0),
    total_earnings_this_month: entries.reduce((sum, e) => sum + (e.gross_pay || 0), 0),
    pending_approvals: entries.filter(e => !e.is_approved && e.clock_out_time).length,
  };
};

// =====================================================
// Children Access (based on provider relationship)
// =====================================================

export const getAssignedChildren = async (providerId: string) => {
  const { data: bookings } = await supabase
    .from("bookings")
    .select("child_id")
    .eq("provider_id", providerId)
    .in("status", ["confirmed", "completed"]);

  if (!bookings || bookings.length === 0) return [];

  const childIds = [...new Set(bookings.map(b => b.child_id))];

  const { data, error } = await supabase
    .from("children")
    .select("*")
    .in("id", childIds);

  if (error) {
    console.error("Error fetching assigned children:", error);
    return [];
  }

  return data || [];
};

// =====================================================
// Attendance Management
// =====================================================

export const getAttendanceRecords = async (
  providerId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('provider_id', providerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
};

export const checkInChild = async (
  childId: string,
  teacherId: string,
  providerId: string,
  latitude?: number,
  longitude?: number
) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        child_id: childId,
        provider_id: providerId,
        check_in_time: new Date().toISOString(),
        checked_in_by: teacherId,
        check_in_lat: latitude,
        check_in_lng: longitude,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking in child:', error);
    return null;
  }
};

export const checkOutChild = async (
  attendanceId: string,
  _teacherId: string,
  latitude?: number,
  longitude?: number
) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out_time: new Date().toISOString(),
        check_out_lat: latitude,
        check_out_lng: longitude,
      })
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking out child:', error);
    return null;
  }
};

export const getProviderChildren = async (providerId: string) => {
  return getAssignedChildren(providerId);
};

export const getTodayAttendance = async (providerId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('provider_id', providerId)
      .eq('date', today)
      .order('check_in_time', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    return [];
  }
};
