import { supabase } from '@/integrations/supabase/client';

export interface Classroom {
  id: string;
  provider_id: string;
  name: string;
  age_group: string;
  licensed_capacity: number;
  current_enrollment: number;
  pending_enrollment: number;
  available_spots: number;
  min_age_months: number;
  max_age_months: number;
  ratio_child_to_staff: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntry {
  id: string;
  provider_id: string;
  parent_name: string;
  parent_email: string;
  child_first_name: string;
  child_last_name: string;
  child_date_of_birth: string;
  child_age_months: number;
  age_group: string;
  desired_start_date: string;
  schedule_type: string;
  status: string;
  position: number;
  added_at: string;
}

export const capacityService = {
  // Get all classrooms for a provider
  async getClassrooms(providerId: string) {
    const { data, error } = await supabase
      .from('classrooms' as any)
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('age_group', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as Classroom[];
  },

  // Get capacity summary stats
  async getCapacityStats(providerId: string) {
    const classrooms = await this.getClassrooms(providerId);
    
    const totalCapacity = classrooms.reduce((sum, c) => sum + c.licensed_capacity, 0);
    const totalEnrolled = classrooms.reduce((sum, c) => sum + c.current_enrollment, 0);
    const totalPending = classrooms.reduce((sum, c) => sum + c.pending_enrollment, 0);
    const totalAvailable = classrooms.reduce((sum, c) => sum + c.available_spots, 0);
    const utilization = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;

    return {
      totalCapacity,
      totalEnrolled,
      totalPending,
      totalAvailable,
      utilization,
      classrooms,
    };
  },

  // Get waitlist for a provider
  async getWaitlist(providerId: string) {
    const { data, error} = await supabase
      .from('waitlist' as any)
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'active')
      .order('position', { ascending: true});

    if (error) throw error;
    return (data || []) as unknown as WaitlistEntry[];
  },

  // Create a new classroom
  async createClassroom(providerId: string, classroom: Partial<Classroom>) {
    const { data, error } = await supabase
      .from('classrooms' as any)
      .insert({
        provider_id: providerId,
        ...classroom,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update classroom capacity
  async updateClassroom(classroomId: string, updates: Partial<Classroom>) {
    const { data, error } = await supabase
      .from('classrooms' as any)
      .update(updates)
      .eq('id', classroomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Add to waitlist
  async addToWaitlist(providerId: string, entry: Partial<WaitlistEntry>) {
    // Get current max position for this age group
    const { data: existingEntries } = await supabase
      .from('waitlist' as any)
      .select('position')
      .eq('provider_id', providerId)
      .eq('age_group', entry.age_group || '')
      .eq('status', 'active')
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingEntries && existingEntries.length > 0 
      ? (existingEntries[0] as any).position + 1 
      : 1;

    const { data, error } = await supabase
      .from('waitlist' as any)
      .insert({
        provider_id: providerId,
        position: nextPosition,
        ...entry,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove from waitlist
  async removeFromWaitlist(waitlistId: string) {
    const { error } = await supabase
      .from('waitlist' as any)
      .update({ status: 'withdrew' })
      .eq('id', waitlistId);

    if (error) throw error;
  },
};
