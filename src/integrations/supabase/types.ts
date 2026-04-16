export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          child_id: string
          created_at: string
          description: string | null
          id: string
          logged_at: string
          provider_id: string
          title: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          child_id: string
          created_at?: string
          description?: string | null
          id?: string
          logged_at?: string
          provider_id: string
          title?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          child_id?: string
          created_at?: string
          description?: string | null
          id?: string
          logged_at?: string
          provider_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_photos: {
        Row: {
          activity_log_id: string
          caption: string | null
          created_at: string
          id: string
          photo_url: string
        }
        Insert: {
          activity_log_id: string
          caption?: string | null
          created_at?: string
          id?: string
          photo_url: string
        }
        Update: {
          activity_log_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_photos_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_resolved: boolean
          related_booking_id: string | null
          related_provider_id: string | null
          related_user_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_resolved?: boolean
          related_booking_id?: string | null
          related_provider_id?: string | null
          related_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_resolved?: boolean
          related_booking_id?: string | null
          related_provider_id?: string | null
          related_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_alerts_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          booking_id: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_time: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_time: string | null
          checked_in_by: string | null
          child_id: string
          created_at: string
          date: string
          id: string
          provider_id: string
        }
        Insert: {
          booking_id?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_time?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_time?: string | null
          checked_in_by?: string | null
          child_id: string
          created_at?: string
          date?: string
          id?: string
          provider_id: string
        }
        Update: {
          booking_id?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_time?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_time?: string | null
          checked_in_by?: string | null
          child_id?: string
          created_at?: string
          date?: string
          id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_type: Database["public"]["Enums"]["booking_type"]
          child_id: string
          commission_amount: number
          created_at: string
          date: string
          end_time: string | null
          id: string
          notes: string | null
          parent_id: string
          provider_id: string
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id: string | null
          total_price: number
          updated_at: string
        }
        Insert: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          child_id: string
          commission_amount?: number
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          notes?: string | null
          parent_id: string
          provider_id: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id?: string | null
          total_price?: number
          updated_at?: string
        }
        Update: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          child_id?: string
          commission_amount?: number
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          parent_id?: string
          provider_id?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id?: string | null
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          allergies: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: string | null
          id: string
          medical_notes: string | null
          name: string
          parent_id: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          medical_notes?: string | null
          name: string
          parent_id: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          medical_notes?: string | null
          name?: string
          parent_id?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enrollment_applications: {
        Row: {
          child_id: string | null
          created_at: string
          id: string
          message: string | null
          parent_id: string
          provider_id: string
          provider_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          parent_id: string
          provider_id: string
          provider_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          parent_id?: string
          provider_id?: string
          provider_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          provider_id: string
          type: Database["public"]["Enums"]["invite_code_type"]
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          provider_id: string
          type: Database["public"]["Enums"]["invite_code_type"]
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          provider_id?: string
          type?: Database["public"]["Enums"]["invite_code_type"]
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          commission: number
          created_at: string
          due_date: string | null
          id: string
          paid_at: string | null
          parent_id: string
          period_end: string | null
          period_start: string | null
          provider_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          commission?: number
          created_at?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          parent_id: string
          period_end?: string | null
          period_start?: string | null
          provider_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          commission?: number
          created_at?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          parent_id?: string
          period_end?: string | null
          period_start?: string | null
          provider_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          close_time: string | null
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string | null
          provider_id: string
        }
        Insert: {
          close_time?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
          provider_id: string
        }
        Update: {
          close_time?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
          provider_id?: string
        }
        Relationships: []
      }
      provider_claims: {
        Row: {
          admin_notes: string | null
          business_ein: string | null
          claimant_user_id: string
          created_at: string
          document_urls: string[] | null
          id: string
          provider_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
          verification_notes: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_ein?: string | null
          claimant_user_id: string
          created_at?: string
          document_urls?: string[] | null
          id?: string
          provider_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          verification_notes?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_ein?: string | null
          claimant_user_id?: string
          created_at?: string
          document_urls?: string[] | null
          id?: string
          provider_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_claims_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_profiles: {
        Row: {
          address: string | null
          age_range_max: number | null
          age_range_min: number | null
          amenities: string[] | null
          business_name: string
          capacity: number
          city: string | null
          created_at: string
          custom_domain: string | null
          description: string | null
          full_day_rate: number | null
          half_day_rate: number | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          is_verified: boolean
          lat: number | null
          license_number: string | null
          lng: number | null
          photos: string[] | null
          provider_type: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          age_range_max?: number | null
          age_range_min?: number | null
          amenities?: string[] | null
          business_name: string
          capacity?: number
          city?: string | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          full_day_rate?: number | null
          half_day_rate?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          lat?: number | null
          license_number?: string | null
          lng?: number | null
          photos?: string[] | null
          provider_type?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          age_range_max?: number | null
          age_range_min?: number | null
          amenities?: string[] | null
          business_name?: string
          capacity?: number
          city?: string | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          full_day_rate?: number | null
          half_day_rate?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          lat?: number | null
          license_number?: string | null
          lng?: number | null
          photos?: string[] | null
          provider_type?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_moderated: boolean
          parent_id: string
          provider_id: string
          rating: number
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_moderated?: boolean
          parent_id: string
          provider_id: string
          rating: number
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_moderated?: boolean
          parent_id?: string
          provider_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_permissions: {
        Row: {
          can_check_in_children: boolean
          can_check_out_children: boolean
          can_log_activities: boolean
          can_manage_bookings: boolean
          can_message_parents: boolean
          can_upload_photos: boolean
          can_view_billing: boolean
          created_at: string
          id: string
          provider_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          can_check_in_children?: boolean
          can_check_out_children?: boolean
          can_log_activities?: boolean
          can_manage_bookings?: boolean
          can_message_parents?: boolean
          can_upload_photos?: boolean
          can_view_billing?: boolean
          created_at?: string
          id?: string
          provider_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          can_check_in_children?: boolean
          can_check_out_children?: boolean
          can_log_activities?: boolean
          can_manage_bookings?: boolean
          can_message_parents?: boolean
          can_upload_photos?: boolean
          can_view_billing?: boolean
          created_at?: string
          id?: string
          provider_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_permissions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employment_start_date: string | null
          employment_status: string
          hourly_rate: number | null
          id: string
          photo_url: string | null
          provider_id: string
          specializations: string[] | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_start_date?: string | null
          employment_status?: string
          hourly_rate?: number | null
          id?: string
          photo_url?: string | null
          provider_id: string
          specializations?: string[] | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_start_date?: string | null
          employment_status?: string
          hourly_rate?: number | null
          id?: string
          photo_url?: string | null
          provider_id?: string
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_duration_minutes: number | null
          clock_in_lat: number | null
          clock_in_lng: number | null
          clock_in_time: string
          clock_out_lat: number | null
          clock_out_lng: number | null
          clock_out_time: string | null
          created_at: string
          gross_pay: number | null
          hourly_rate_snapshot: number | null
          id: string
          is_approved: boolean
          notes: string | null
          provider_id: string
          teacher_id: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_duration_minutes?: number | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_in_time?: string
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          clock_out_time?: string | null
          created_at?: string
          gross_pay?: number | null
          hourly_rate_snapshot?: number | null
          id?: string
          is_approved?: boolean
          notes?: string | null
          provider_id: string
          teacher_id: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_duration_minutes?: number | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_in_time?: string
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          clock_out_time?: string | null
          created_at?: string
          gross_pay?: number | null
          hourly_rate_snapshot?: number | null
          id?: string
          is_approved?: boolean
          notes?: string | null
          provider_id?: string
          teacher_id?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_access: {
        Args: {
          _action: string
          _details?: Json
          _target_id?: string
          _target_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      activity_type:
        | "meal"
        | "nap"
        | "diaper"
        | "activity"
        | "medicine"
        | "note"
        | "incident"
        | "photo"
      alert_severity: "low" | "medium" | "high" | "critical"
      app_role: "admin" | "moderator" | "user"
      application_status: "pending" | "approved" | "rejected"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      booking_type: "full_day" | "half_day" | "hourly"
      claim_status: "pending" | "approved" | "rejected"
      invite_code_type: "teacher_invite" | "parent_enrollment"
      invoice_status: "draft" | "sent" | "paid" | "overdue"
      user_role: "parent" | "provider" | "admin" | "teacher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "meal",
        "nap",
        "diaper",
        "activity",
        "medicine",
        "note",
        "incident",
        "photo",
      ],
      alert_severity: ["low", "medium", "high", "critical"],
      app_role: ["admin", "moderator", "user"],
      application_status: ["pending", "approved", "rejected"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      booking_type: ["full_day", "half_day", "hourly"],
      claim_status: ["pending", "approved", "rejected"],
      invite_code_type: ["teacher_invite", "parent_enrollment"],
      invoice_status: ["draft", "sent", "paid", "overdue"],
      user_role: ["parent", "provider", "admin", "teacher"],
    },
  },
} as const
