// =====================================================
// TypeScript Types for Teacher System
// =====================================================

export type UserRole = "parent" | "provider" | "admin" | "teacher";

export type EmploymentStatus = "active" | "inactive" | "on_leave";

export interface TeacherProfile {
  id: string;
  user_id: string;
  provider_id: string;
  bio?: string;
  certifications?: string[];
  years_experience?: number;
  specializations?: string[];
  hourly_rate?: number;
  employment_start_date?: string;
  employment_status: EmploymentStatus;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherPermissions {
  id: string;
  teacher_id: string;
  provider_id: string;
  can_check_in_children: boolean;
  can_check_out_children: boolean;
  can_log_activities: boolean;
  can_upload_photos: boolean;
  can_message_parents: boolean;
  can_view_billing: boolean;
  can_manage_bookings: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  teacher_id: string;
  provider_id: string;
  clock_in_time: string;
  clock_out_time?: string;
  break_duration_minutes?: number;
  clock_in_lat?: number;
  clock_in_lng?: number;
  clock_out_lat?: number;
  clock_out_lng?: number;
  hourly_rate_snapshot?: number;
  total_hours?: number;
  gross_pay?: number;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherDashboardStats {
  teacher_id: string;
  days_worked_this_month: number;
  total_hours_this_month: number;
  total_earnings_this_month: number;
  pending_approvals: number;
}

export interface ClockInOutRequest {
  lat?: number;
  lng?: number;
}

export interface UpdateTimeEntryRequest {
  break_duration_minutes?: number;
  notes?: string;
}

