import { supabase } from '@/integrations/supabase/client';

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  parent_id: string;
  provider_id: string;
  enrollment_status: string;
  schedule_type: string;
}

export interface Booking {
  id: string;
  parent_id: string;
  provider_id: string;
  child_id: string;
  booking_date: string;
  booking_type: string;
  status: string;
  total_price: number;
  created_at: string;
}

export interface Attendance {
  id: string;
  child_id: string;
  provider_id: string;
  check_in_time: string;
  check_out_time?: string;
  status: string;
  date: string;
}

export const providerDashboardService = {
  // Get today's attendance
  async getTodaysAttendance(providerId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        children!inner(first_name, last_name, date_of_birth, parent_id, profiles!children_parent_id_fkey(full_name))
      `)
      .eq('provider_id', providerId)
      .gte('date', today)
      .lt('date', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

    if (error) throw error;
    return (data || []) as unknown as any[];
  },

  // Get enrolled children
  async getEnrolledChildren(providerId: string) {
    const { data, error } = await (supabase as any)
      .from('children')
      .select('*')
      .eq('provider_id', providerId);

    if (error) console.error('Error fetching children:', error);
    return (data || []) as unknown as any[];
  },

  // Get pending bookings
  async getPendingBookings(providerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_parent_id_fkey(full_name),
        children(first_name, last_name)
      `)
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as any[];
  },

  // Get dashboard stats
  async getDashboardStats(providerId: string) {
    const [attendance, children, bookings, invoices] = await Promise.all([
      this.getTodaysAttendance(providerId),
      this.getEnrolledChildren(providerId),
      this.getPendingBookings(providerId),
      supabase.from('invoices' as any).select('*').eq('provider_id', providerId),
    ]);

    const presentToday = attendance.filter((a: any) => a.status === 'present').length;
    const expectedToday = children.length;
    const capacity = 8; // This should come from provider_profiles
    
    const monthlyRevenue = (invoices.data || []).reduce((sum: number, inv: any) => {
      const invDate = new Date(inv.created_at);
      const now = new Date();
      if (invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()) {
        return sum + (inv.amount || 0);
      }
      return sum;
    }, 0);

    return {
      kidsToday: `${presentToday}/${expectedToday}`,
      kidsTodayProgress: expectedToday > 0 ? (presentToday / expectedToday) * 100 : 0,
      capacity: `${children.length}/${capacity}`,
      capacityProgress: (children.length / capacity) * 100,
      monthlyRevenue,
      pendingBookings: bookings.length,
    };
  },

  // Update attendance
  async checkInChild(childId: string, providerId: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { data, error } = await (supabase as any)
      .from('attendance')
      .insert({
        child_id: childId,
        provider_id: providerId,
        date: today,
        check_in_time: now,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async checkOutChild(attendanceId: string) {
    const now = new Date().toISOString();

    const { data, error } = await (supabase as any)
      .from('attendance')
      .update({
        check_out_time: now,
      })
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
