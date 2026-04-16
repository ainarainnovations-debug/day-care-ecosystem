import { supabase } from '@/integrations/supabase/client';

export const parentDashboardService = {
  // Get parent's children
  async getMyChildren(parentId: string) {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId);

    if (error) console.error('Error fetching children:', error);
    return (data || []) as any[];
  },

  // Get active bookings
  async getMyBookings(parentId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, provider_profiles!bookings_provider_id_fkey(*)')
      .eq('parent_id', parentId)
      .in('status', ['confirmed', 'pending'])
      .order('booking_date', { ascending: true });

    if (error) console.error('Error fetching bookings:', error);
    return (data || []) as any[];
  },

  // Get invoices
  async getMyInvoices(parentId: string) {
    const { data, error } = await (supabase as any)
      .from('invoices')
      .select('*, provider_profiles(*)')
      .eq('parent_id', parentId)
      .order('due_date', { ascending: false });

    if (error) console.error('Error fetching invoices:', error);
    return (data || []) as any[];
  },

  // Get payment methods
  async getMyPaymentMethods(parentId: string) {
    const { data, error } = await (supabase as any)
      .from('payment_methods')
      .select('*')
      .eq('parent_id', parentId)
      .eq('status', 'active');

    if (error) console.error('Error fetching payment methods:', error);
    return (data || []) as any[];
  },

  // Get today's attendance for my children
  async getTodaysAttendance(parentId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*, children!inner(*)')
      .eq('children.parent_id', parentId)
      .gte('date', today)
      .lt('date', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

    if (error) console.error('Error fetching attendance:', error);
    return (data || []) as any[];
  },

  // Get dashboard stats
  async getDashboardStats(parentId: string) {
    const [children, bookings, invoices, attendance] = await Promise.all([
      this.getMyChildren(parentId),
      this.getMyBookings(parentId),
      this.getMyInvoices(parentId),
      this.getTodaysAttendance(parentId),
    ]);

    const upcomingBookings = bookings.filter((b: any) => {
      const bookingDate = new Date(b.booking_date);
      return bookingDate > new Date();
    }).length;

    const overdueInvoices = invoices.filter((i: any) => {
      if (i.status === 'overdue') return true;
      if (i.status === 'sent' && new Date(i.due_date) < new Date()) return true;
      return false;
    }).length;

    const activeChildren = children.filter((c: any) => 
      c.enrollment_status === 'active'
    ).length;

    const checkedInToday = attendance.filter((a: any) => 
      a.check_in_time && !a.check_out_time
    ).length;

    return {
      totalChildren: children.length,
      activeChildren,
      upcomingBookings,
      overdueInvoices,
      checkedInToday,
      pendingPayments: invoices.filter((i: any) => i.status === 'sent').length,
    };
  },

  // Create a booking
  async createBooking(parentId: string, booking: any) {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        parent_id: parentId,
        ...booking,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
