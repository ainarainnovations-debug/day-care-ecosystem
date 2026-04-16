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
          checked_in_by_teacher_id: string | null
          checked_out_by_teacher_id: string | null
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
          checked_in_by_teacher_id?: string | null
          checked_out_by_teacher_id?: string | null
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
          checked_in_by_teacher_id?: string | null
          checked_out_by_teacher_id?: string | null
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
      classrooms: {
        Row: {
          age_group: string
          capacity: number
          created_at: string | null
          current_enrollment: number | null
          id: string
          is_active: boolean | null
          max_age_months: number | null
          min_age_months: number | null
          name: string
          provider_id: string
          teacher_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          age_group: string
          capacity?: number
          created_at?: string | null
          current_enrollment?: number | null
          id?: string
          is_active?: boolean | null
          max_age_months?: number | null
          min_age_months?: number | null
          name: string
          provider_id: string
          teacher_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age_group?: string
          capacity?: number
          created_at?: string | null
          current_enrollment?: number | null
          id?: string
          is_active?: boolean | null
          max_age_months?: number | null
          min_age_months?: number | null
          name?: string
          provider_id?: string
          teacher_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      enrollment_child_assignments: {
        Row: {
          assigned_at: string | null
          billing_profile_created: boolean | null
          child_id: string
          classroom_id: string | null
          created_at: string | null
          first_invoice_date: string | null
          id: string
          submission_id: string
          tuition_schedule: Json | null
        }
        Insert: {
          assigned_at?: string | null
          billing_profile_created?: boolean | null
          child_id: string
          classroom_id?: string | null
          created_at?: string | null
          first_invoice_date?: string | null
          id?: string
          submission_id: string
          tuition_schedule?: Json | null
        }
        Update: {
          assigned_at?: string | null
          billing_profile_created?: boolean | null
          child_id?: string
          classroom_id?: string | null
          created_at?: string | null
          first_invoice_date?: string | null
          id?: string
          submission_id?: string
          tuition_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_child_assignments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_child_assignments_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_child_assignments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "enrollment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_document_requirements: {
        Row: {
          allowed_file_types: string[] | null
          created_at: string | null
          description: string | null
          display_order: number
          document_name: string
          form_id: string
          id: string
          is_required: boolean | null
          max_file_size_mb: number | null
          state_required_for: string[] | null
        }
        Insert: {
          allowed_file_types?: string[] | null
          created_at?: string | null
          description?: string | null
          display_order: number
          document_name: string
          form_id: string
          id?: string
          is_required?: boolean | null
          max_file_size_mb?: number | null
          state_required_for?: string[] | null
        }
        Update: {
          allowed_file_types?: string[] | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          document_name?: string
          form_id?: string
          id?: string
          is_required?: boolean | null
          max_file_size_mb?: number | null
          state_required_for?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_document_requirements_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "enrollment_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_documents: {
        Row: {
          document_name: string
          file_name: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          rejection_reason: string | null
          requirement_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status:
            | Database["public"]["Enums"]["document_requirement_status"]
            | null
          submission_id: string
          uploaded_at: string | null
        }
        Insert: {
          document_name: string
          file_name: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          rejection_reason?: string | null
          requirement_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?:
            | Database["public"]["Enums"]["document_requirement_status"]
            | null
          submission_id: string
          uploaded_at?: string | null
        }
        Update: {
          document_name?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          rejection_reason?: string | null
          requirement_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?:
            | Database["public"]["Enums"]["document_requirement_status"]
            | null
          submission_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_documents_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "enrollment_document_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_documents_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "enrollment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_form_fields: {
        Row: {
          compliance_category: string | null
          created_at: string | null
          display_order: number
          field_name: string
          field_type: Database["public"]["Enums"]["form_field_type"]
          form_id: string
          full_width: boolean | null
          help_text: string | null
          id: string
          is_required: boolean | null
          label: string
          options: Json | null
          placeholder: string | null
          section: string | null
          state_required_for: string[] | null
          validation_rules: Json | null
        }
        Insert: {
          compliance_category?: string | null
          created_at?: string | null
          display_order: number
          field_name: string
          field_type: Database["public"]["Enums"]["form_field_type"]
          form_id: string
          full_width?: boolean | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          label: string
          options?: Json | null
          placeholder?: string | null
          section?: string | null
          state_required_for?: string[] | null
          validation_rules?: Json | null
        }
        Update: {
          compliance_category?: string | null
          created_at?: string | null
          display_order?: number
          field_name?: string
          field_type?: Database["public"]["Enums"]["form_field_type"]
          form_id?: string
          full_width?: boolean | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          label?: string
          options?: Json | null
          placeholder?: string | null
          section?: string | null
          state_required_for?: string[] | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "enrollment_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_forms: {
        Row: {
          allow_save_resume: boolean | null
          created_at: string | null
          description: string | null
          enabled_languages: string[] | null
          expiration_days: number | null
          handbook_url: string | null
          id: string
          is_active: boolean | null
          name: string
          other_policy_urls: Json | null
          photo_release_url: string | null
          provider_id: string
          state_template: string | null
          tuition_agreement_url: string | null
          updated_at: string | null
        }
        Insert: {
          allow_save_resume?: boolean | null
          created_at?: string | null
          description?: string | null
          enabled_languages?: string[] | null
          expiration_days?: number | null
          handbook_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          other_policy_urls?: Json | null
          photo_release_url?: string | null
          provider_id: string
          state_template?: string | null
          tuition_agreement_url?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_save_resume?: boolean | null
          created_at?: string | null
          description?: string | null
          enabled_languages?: string[] | null
          expiration_days?: number | null
          handbook_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          other_policy_urls?: Json | null
          photo_release_url?: string | null
          provider_id?: string
          state_template?: string | null
          tuition_agreement_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_forms_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_missing_item_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          item_identifier: string
          item_type: string
          message: string | null
          notification_sent_at: string | null
          requested_by: string
          submission_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          item_identifier: string
          item_type: string
          message?: string | null
          notification_sent_at?: string | null
          requested_by: string
          submission_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          item_identifier?: string
          item_type?: string
          message?: string | null
          notification_sent_at?: string | null
          requested_by?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_missing_item_requests_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "enrollment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_submissions: {
        Row: {
          accepted_at: string | null
          age_group: string | null
          child_date_of_birth: string | null
          child_first_name: string | null
          child_last_name: string | null
          created_at: string | null
          decline_reason: string | null
          desired_start_date: string | null
          expires_at: string | null
          form_data: Json | null
          form_id: string
          id: string
          is_complete: boolean | null
          is_subsidy_family: boolean | null
          last_saved_at: string | null
          missing_documents: string[] | null
          missing_fields: string[] | null
          parent_email: string | null
          parent_ip_address: unknown
          parent_name: string | null
          parent_phone: string | null
          parent_signature_at: string | null
          parent_signature_data: string | null
          parent_user_id: string | null
          preferred_language: string | null
          provider_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["enrollment_status"] | null
          submitted_at: string | null
          subsidy_program: string | null
          unique_link_token: string
          unsigned_policies: string[] | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          age_group?: string | null
          child_date_of_birth?: string | null
          child_first_name?: string | null
          child_last_name?: string | null
          created_at?: string | null
          decline_reason?: string | null
          desired_start_date?: string | null
          expires_at?: string | null
          form_data?: Json | null
          form_id: string
          id?: string
          is_complete?: boolean | null
          is_subsidy_family?: boolean | null
          last_saved_at?: string | null
          missing_documents?: string[] | null
          missing_fields?: string[] | null
          parent_email?: string | null
          parent_ip_address?: unknown
          parent_name?: string | null
          parent_phone?: string | null
          parent_signature_at?: string | null
          parent_signature_data?: string | null
          parent_user_id?: string | null
          preferred_language?: string | null
          provider_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          submitted_at?: string | null
          subsidy_program?: string | null
          unique_link_token: string
          unsigned_policies?: string[] | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          age_group?: string | null
          child_date_of_birth?: string | null
          child_first_name?: string | null
          child_last_name?: string | null
          created_at?: string | null
          decline_reason?: string | null
          desired_start_date?: string | null
          expires_at?: string | null
          form_data?: Json | null
          form_id?: string
          id?: string
          is_complete?: boolean | null
          is_subsidy_family?: boolean | null
          last_saved_at?: string | null
          missing_documents?: string[] | null
          missing_fields?: string[] | null
          parent_email?: string | null
          parent_ip_address?: unknown
          parent_name?: string | null
          parent_phone?: string | null
          parent_signature_at?: string | null
          parent_signature_data?: string | null
          parent_user_id?: string | null
          preferred_language?: string | null
          provider_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          submitted_at?: string | null
          subsidy_program?: string | null
          unique_link_token?: string
          unsigned_policies?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "enrollment_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_submissions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          read: boolean | null
          read_at: string | null
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
          read?: boolean | null
          read_at?: string | null
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
          read?: boolean | null
          read_at?: string | null
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
          can_check_in_children: boolean | null
          can_check_out_children: boolean | null
          can_log_activities: boolean | null
          can_manage_bookings: boolean | null
          can_message_parents: boolean | null
          can_upload_photos: boolean | null
          can_view_billing: boolean | null
          created_at: string
          id: string
          provider_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          can_check_in_children?: boolean | null
          can_check_out_children?: boolean | null
          can_log_activities?: boolean | null
          can_manage_bookings?: boolean | null
          can_message_parents?: boolean | null
          can_upload_photos?: boolean | null
          can_view_billing?: boolean | null
          created_at?: string
          id?: string
          provider_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          can_check_in_children?: boolean | null
          can_check_out_children?: boolean | null
          can_log_activities?: boolean | null
          can_manage_bookings?: boolean | null
          can_message_parents?: boolean | null
          can_upload_photos?: boolean | null
          can_view_billing?: boolean | null
          created_at?: string
          id?: string
          provider_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employment_start_date: string | null
          employment_status: string | null
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
          employment_status?: string | null
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
          employment_status?: string | null
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
          is_approved: boolean | null
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
          clock_in_time: string
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          clock_out_time?: string | null
          created_at?: string
          gross_pay?: number | null
          hourly_rate_snapshot?: number | null
          id?: string
          is_approved?: boolean | null
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
          is_approved?: boolean | null
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
      teacher_dashboard_stats: {
        Row: {
          days_worked_this_month: number | null
          pending_approvals: number | null
          teacher_id: string | null
          total_earnings_this_month: number | null
          total_hours_this_month: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_enrollment_completeness: {
        Args: { p_submission_id: string }
        Returns: Json
      }
      generate_enrollment_link_token: { Args: never; Returns: string }
      get_unread_count: { Args: never; Returns: number }
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
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_notification_read: {
        Args: { p_notification_id: string }
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
      document_requirement_status:
        | "not_uploaded"
        | "uploaded"
        | "approved"
        | "rejected"
      enrollment_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "incomplete"
        | "accepted"
        | "on_hold"
        | "declined"
      form_field_type:
        | "text"
        | "email"
        | "phone"
        | "date"
        | "number"
        | "textarea"
        | "select"
        | "multiselect"
        | "checkbox"
        | "radio"
        | "file_upload"
        | "signature"
        | "address"
        | "emergency_contact"
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
      document_requirement_status: [
        "not_uploaded",
        "uploaded",
        "approved",
        "rejected",
      ],
      enrollment_status: [
        "draft",
        "submitted",
        "under_review",
        "incomplete",
        "accepted",
        "on_hold",
        "declined",
      ],
      form_field_type: [
        "text",
        "email",
        "phone",
        "date",
        "number",
        "textarea",
        "select",
        "multiselect",
        "checkbox",
        "radio",
        "file_upload",
        "signature",
        "address",
        "emergency_contact",
      ],
      invite_code_type: ["teacher_invite", "parent_enrollment"],
      invoice_status: ["draft", "sent", "paid", "overdue"],
      user_role: ["parent", "provider", "admin", "teacher"],
    },
  },
} as const
