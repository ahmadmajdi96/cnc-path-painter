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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assignees: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      automated_step_resources: {
        Row: {
          automated_step_id: string
          created_at: string
          id: string
          quantity: number | null
          resource_id: string
        }
        Insert: {
          automated_step_id: string
          created_at?: string
          id?: string
          quantity?: number | null
          resource_id: string
        }
        Update: {
          automated_step_id?: string
          created_at?: string
          id?: string
          quantity?: number | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_step_resources_automated_step_id_fkey"
            columns: ["automated_step_id"]
            isOneToOne: false
            referencedRelation: "automated_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_step_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_steps: {
        Row: {
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      automations: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          input_parameters: Json | null
          name: string
          on_failure: Json | null
          operations: Json
          output_parameters: Json | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          input_parameters?: Json | null
          name: string
          on_failure?: Json | null
          operations?: Json
          output_parameters?: Json | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          input_parameters?: Json | null
          name?: string
          on_failure?: Json | null
          operations?: Json
          output_parameters?: Json | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bottlenecks: {
        Row: {
          description: string
          estimated_delay_minutes: number | null
          id: string
          identified_at: string
          impact_level: string | null
          production_line_id: string | null
          resolved_at: string | null
          station_id: string | null
          status: string | null
        }
        Insert: {
          description: string
          estimated_delay_minutes?: number | null
          id?: string
          identified_at?: string
          impact_level?: string | null
          production_line_id?: string | null
          resolved_at?: string | null
          station_id?: string | null
          status?: string | null
        }
        Update: {
          description?: string
          estimated_delay_minutes?: number | null
          id?: string
          identified_at?: string
          impact_level?: string | null
          production_line_id?: string | null
          resolved_at?: string | null
          station_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bottlenecks_production_line_id_fkey"
            columns: ["production_line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bottlenecks_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          bot_response: string
          chatbot_id: string
          confidence_score: number | null
          created_at: string
          feedback_rating: number | null
          id: string
          response_time_ms: number | null
          session_id: string
          user_message: string
        }
        Insert: {
          bot_response: string
          chatbot_id: string
          confidence_score?: number | null
          created_at?: string
          feedback_rating?: number | null
          id?: string
          response_time_ms?: number | null
          session_id: string
          user_message: string
        }
        Update: {
          bot_response?: string
          chatbot_id?: string
          confidence_score?: number | null
          created_at?: string
          feedback_rating?: number | null
          id?: string
          response_time_ms?: number | null
          session_id?: string
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_conversations_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_qa_pairs: {
        Row: {
          answer: string
          chatbot_id: string
          confidence_threshold: number | null
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          question: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          answer: string
          chatbot_id: string
          confidence_threshold?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          answer?: string
          chatbot_id?: string
          confidence_threshold?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_qa_pairs_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_rules: {
        Row: {
          action_type: string
          action_value: Json
          chatbot_id: string
          condition_type: string
          condition_value: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          updated_at: string
        }
        Insert: {
          action_type: string
          action_value: Json
          chatbot_id: string
          condition_type: string
          condition_value: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          action_value?: Json
          chatbot_id?: string
          condition_type?: string
          condition_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_rules_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          api_key: string | null
          connection_type: string | null
          created_at: string
          description: string | null
          endpoint_url: string | null
          id: string
          max_tokens: number | null
          model_name: string
          model_type: string
          name: string
          project_id: string | null
          status: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          connection_type?: string | null
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          id?: string
          max_tokens?: number | null
          model_name: string
          model_type: string
          name: string
          project_id?: string | null
          status?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          connection_type?: string | null
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          id?: string
          max_tokens?: number | null
          model_name?: string
          model_type?: string
          name?: string
          project_id?: string | null
          status?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cnc_machines: {
        Row: {
          created_at: string
          endpoint_url: string | null
          id: string
          ip_address: string | null
          manufacturer: string | null
          max_feed_rate: number | null
          max_spindle_speed: number | null
          model: string
          name: string
          plunge_rate: number | null
          port: number | null
          project_id: string | null
          protocol: string | null
          safe_height: number | null
          status: string
          updated_at: string
          work_area: string | null
          work_height: number | null
        }
        Insert: {
          created_at?: string
          endpoint_url?: string | null
          id?: string
          ip_address?: string | null
          manufacturer?: string | null
          max_feed_rate?: number | null
          max_spindle_speed?: number | null
          model: string
          name: string
          plunge_rate?: number | null
          port?: number | null
          project_id?: string | null
          protocol?: string | null
          safe_height?: number | null
          status?: string
          updated_at?: string
          work_area?: string | null
          work_height?: number | null
        }
        Update: {
          created_at?: string
          endpoint_url?: string | null
          id?: string
          ip_address?: string | null
          manufacturer?: string | null
          max_feed_rate?: number | null
          max_spindle_speed?: number | null
          model?: string
          name?: string
          plunge_rate?: number | null
          port?: number | null
          project_id?: string | null
          protocol?: string | null
          safe_height?: number | null
          status?: string
          updated_at?: string
          work_area?: string | null
          work_height?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cnc_machines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry: string
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      conveyor_belts: {
        Row: {
          belt_length: number
          belt_width: number
          created_at: string
          current_draw: number
          endpoint_url: string | null
          id: string
          ip_address: string | null
          is_connected: boolean
          manufacturer: string
          max_load: number
          max_speed: number
          model: string
          motor_power: number
          name: string
          port: number | null
          position_x: number | null
          position_y: number | null
          position_z: number | null
          project_id: string | null
          protocol: string
          status: string
          updated_at: string
          voltage: number
        }
        Insert: {
          belt_length?: number
          belt_width?: number
          created_at?: string
          current_draw?: number
          endpoint_url?: string | null
          id?: string
          ip_address?: string | null
          is_connected?: boolean
          manufacturer: string
          max_load?: number
          max_speed?: number
          model: string
          motor_power?: number
          name: string
          port?: number | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          project_id?: string | null
          protocol?: string
          status?: string
          updated_at?: string
          voltage?: number
        }
        Update: {
          belt_length?: number
          belt_width?: number
          created_at?: string
          current_draw?: number
          endpoint_url?: string | null
          id?: string
          ip_address?: string | null
          is_connected?: boolean
          manufacturer?: string
          max_load?: number
          max_speed?: number
          model?: string
          motor_power?: number
          name?: string
          port?: number | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          project_id?: string | null
          protocol?: string
          status?: string
          updated_at?: string
          voltage?: number
        }
        Relationships: [
          {
            foreignKeyName: "conveyor_belts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      critical_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          description: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          source: string | null
          source_type: string | null
          status: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          source?: string | null
          source_type?: string | null
          status?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          source?: string | null
          source_type?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      dataset_annotations: {
        Row: {
          class_id: string
          created_at: string
          dataset_item_id: string
          height: number
          id: string
          width: number
          x: number
          y: number
        }
        Insert: {
          class_id: string
          created_at?: string
          dataset_item_id: string
          height: number
          id?: string
          width: number
          x: number
          y: number
        }
        Update: {
          class_id?: string
          created_at?: string
          dataset_item_id?: string
          height?: number
          id?: string
          width?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "dataset_annotations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "dataset_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataset_annotations_dataset_item_id_fkey"
            columns: ["dataset_item_id"]
            isOneToOne: false
            referencedRelation: "dataset_items"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_classes: {
        Row: {
          color: string
          created_at: string
          dataset_id: string
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          dataset_id: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          dataset_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataset_classes_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_combinations: {
        Row: {
          created_at: string
          dataset_ids: Json
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dataset_ids?: Json
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dataset_ids?: Json
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      dataset_items: {
        Row: {
          classification_class_id: string | null
          content: string | null
          created_at: string
          dataset_id: string
          file_url: string | null
          id: string
          name: string
          url: string | null
        }
        Insert: {
          classification_class_id?: string | null
          content?: string | null
          created_at?: string
          dataset_id: string
          file_url?: string | null
          id?: string
          name: string
          url?: string | null
        }
        Update: {
          classification_class_id?: string | null
          content?: string | null
          created_at?: string
          dataset_id?: string
          file_url?: string | null
          id?: string
          name?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dataset_items_classification_class_id_fkey"
            columns: ["classification_class_id"]
            isOneToOne: false
            referencedRelation: "dataset_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataset_items_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_count: number | null
          mode: string | null
          name: string
          project_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_count?: number | null
          mode?: string | null
          name: string
          project_id?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_count?: number | null
          mode?: string | null
          name?: string
          project_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "datasets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      division_departments: {
        Row: {
          created_at: string | null
          department_id: string
          division_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          division_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          division_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "division_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string | null
          head_id: string | null
          id: string
          location: string | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          location?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          location?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "divisions_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          email: string | null
          employee_id: string
          id: string
          is_manager: boolean | null
          mobile_number: string | null
          name: string
          position: string | null
          salary: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          employee_id: string
          id?: string
          is_manager?: boolean | null
          mobile_number?: string | null
          name: string
          position?: string | null
          salary?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          employee_id?: string
          id?: string
          is_manager?: boolean | null
          mobile_number?: string | null
          name?: string
          position?: string | null
          salary?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      endpoints: {
        Row: {
          created_at: string
          description: string | null
          id: string
          machine_id: string
          name: string
          project_id: string | null
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          machine_id: string
          name: string
          project_id?: string | null
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          machine_id?: string
          name?: string
          project_id?: string | null
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "endpoints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      hardware: {
        Row: {
          communication_protocol: string | null
          created_at: string
          data_type: string | null
          id: string
          installation_date: string | null
          ip_address: unknown
          model: string | null
          name: string
          project_id: string | null
          serial_number: string | null
          status: string | null
          type: string
          warranty_expiry: string | null
        }
        Insert: {
          communication_protocol?: string | null
          created_at?: string
          data_type?: string | null
          id?: string
          installation_date?: string | null
          ip_address?: unknown
          model?: string | null
          name: string
          project_id?: string | null
          serial_number?: string | null
          status?: string | null
          type: string
          warranty_expiry?: string | null
        }
        Update: {
          communication_protocol?: string | null
          created_at?: string
          data_type?: string | null
          id?: string
          installation_date?: string | null
          ip_address?: unknown
          model?: string | null
          name?: string
          project_id?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hardware_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          automation_steps: Json | null
          configuration: Json
          created_at: string
          data_configuration: Json | null
          description: string | null
          id: string
          last_test: Json | null
          live_data: Json | null
          name: string
          output_mappings: Json | null
          parameters: Json
          project_id: string | null
          result_destination: string
          source_endpoint: Json
          status: string
          target_endpoint: Json
          updated_at: string
        }
        Insert: {
          automation_steps?: Json | null
          configuration?: Json
          created_at?: string
          data_configuration?: Json | null
          description?: string | null
          id?: string
          last_test?: Json | null
          live_data?: Json | null
          name: string
          output_mappings?: Json | null
          parameters?: Json
          project_id?: string | null
          result_destination?: string
          source_endpoint?: Json
          status?: string
          target_endpoint?: Json
          updated_at?: string
        }
        Update: {
          automation_steps?: Json | null
          configuration?: Json
          created_at?: string
          data_configuration?: Json | null
          description?: string | null
          id?: string
          last_test?: Json | null
          live_data?: Json | null
          name?: string
          output_mappings?: Json | null
          parameters?: Json
          project_id?: string | null
          result_destination?: string
          source_endpoint?: Json
          status?: string
          target_endpoint?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      joint_configurations: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          joint_1_angle: number | null
          joint_2_angle: number | null
          joint_3_angle: number | null
          joint_4_angle: number | null
          joint_5_angle: number | null
          joint_6_angle: number | null
          joint_7_angle: number | null
          joint_8_angle: number | null
          name: string
          project_id: string | null
          robotic_arm_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          joint_1_angle?: number | null
          joint_2_angle?: number | null
          joint_3_angle?: number | null
          joint_4_angle?: number | null
          joint_5_angle?: number | null
          joint_6_angle?: number | null
          joint_7_angle?: number | null
          joint_8_angle?: number | null
          name: string
          project_id?: string | null
          robotic_arm_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          joint_1_angle?: number | null
          joint_2_angle?: number | null
          joint_3_angle?: number | null
          joint_4_angle?: number | null
          joint_5_angle?: number | null
          joint_6_angle?: number | null
          joint_7_angle?: number | null
          joint_8_angle?: number | null
          name?: string
          project_id?: string | null
          robotic_arm_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "joint_configurations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "joint_configurations_robotic_arm_id_fkey"
            columns: ["robotic_arm_id"]
            isOneToOne: false
            referencedRelation: "robotic_arms"
            referencedColumns: ["id"]
          },
        ]
      }
      laser_machines: {
        Row: {
          beam_diameter: number | null
          created_at: string
          endpoint_url: string | null
          id: string
          ip_address: string | null
          manufacturer: string | null
          max_frequency: number | null
          max_power: number | null
          max_speed: number | null
          model: string
          name: string
          port: number | null
          project_id: string | null
          protocol: string | null
          status: string
          updated_at: string
        }
        Insert: {
          beam_diameter?: number | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          ip_address?: string | null
          manufacturer?: string | null
          max_frequency?: number | null
          max_power?: number | null
          max_speed?: number | null
          model: string
          name: string
          port?: number | null
          project_id?: string | null
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          beam_diameter?: number | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          ip_address?: string | null
          manufacturer?: string | null
          max_frequency?: number | null
          max_power?: number | null
          max_speed?: number | null
          model?: string
          name?: string
          port?: number | null
          project_id?: string | null
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "laser_machines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      laser_toolpaths: {
        Row: {
          created_at: string
          id: string
          laser_machine_id: string
          laser_params: Json | null
          name: string
          points: Json
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          laser_machine_id: string
          laser_params?: Json | null
          name: string
          points?: Json
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          laser_machine_id?: string
          laser_params?: Json | null
          name?: string
          points?: Json
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "laser_toolpaths_laser_machine_id_fkey"
            columns: ["laser_machine_id"]
            isOneToOne: false
            referencedRelation: "laser_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laser_toolpaths_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      live_production_feed: {
        Row: {
          event_type: string
          id: string
          item_id: string | null
          message: string | null
          production_line_id: string | null
          station_id: string | null
          timestamp: string
        }
        Insert: {
          event_type: string
          id?: string
          item_id?: string | null
          message?: string | null
          production_line_id?: string | null
          station_id?: string | null
          timestamp?: string
        }
        Update: {
          event_type?: string
          id?: string
          item_id?: string | null
          message?: string | null
          production_line_id?: string | null
          station_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_production_feed_production_line_id_fkey"
            columns: ["production_line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_production_feed_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_dataset_items: {
        Row: {
          created_at: string
          dataset_id: string
          id: string
          location_id: string
        }
        Insert: {
          created_at?: string
          dataset_id: string
          id?: string
          location_id: string
        }
        Update: {
          created_at?: string
          dataset_id?: string
          id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_dataset_items_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "location_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_dataset_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_datasets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location_count: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location_count?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location_count?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      machine_status: {
        Row: {
          efficiency_percentage: number | null
          id: string
          last_updated: string
          machine_id: string
          output_today: number | null
          status: string | null
        }
        Insert: {
          efficiency_percentage?: number | null
          id?: string
          last_updated?: string
          machine_id: string
          output_today?: number | null
          status?: string | null
        }
        Update: {
          efficiency_percentage?: number | null
          id?: string
          last_updated?: string
          machine_id?: string
          output_today?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machine_status_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: true
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          cost: number | null
          created_at: string
          id: string
          installation_date: string | null
          last_maintenance: string | null
          location: string | null
          model: string | null
          name: string
          production_line_id: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          id?: string
          installation_date?: string | null
          last_maintenance?: string | null
          location?: string | null
          model?: string | null
          name: string
          production_line_id?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          id?: string
          installation_date?: string | null
          last_maintenance?: string | null
          location?: string | null
          model?: string | null
          name?: string
          production_line_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "machines_production_line_id_fkey"
            columns: ["production_line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_step_resources: {
        Row: {
          created_at: string
          id: string
          manual_step_id: string
          quantity: number | null
          resource_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manual_step_id: string
          quantity?: number | null
          resource_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manual_step_id?: string
          quantity?: number | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_step_resources_manual_step_id_fkey"
            columns: ["manual_step_id"]
            isOneToOne: false
            referencedRelation: "manual_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_step_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_steps: {
        Row: {
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      motion_keyframes: {
        Row: {
          created_at: string
          duration_ms: number | null
          easing_type: string | null
          id: string
          joint_1_angle: number | null
          joint_2_angle: number | null
          joint_3_angle: number | null
          joint_4_angle: number | null
          joint_5_angle: number | null
          joint_6_angle: number | null
          joint_7_angle: number | null
          joint_8_angle: number | null
          motion_path_id: string
          project_id: string | null
          sequence_order: number
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          easing_type?: string | null
          id?: string
          joint_1_angle?: number | null
          joint_2_angle?: number | null
          joint_3_angle?: number | null
          joint_4_angle?: number | null
          joint_5_angle?: number | null
          joint_6_angle?: number | null
          joint_7_angle?: number | null
          joint_8_angle?: number | null
          motion_path_id: string
          project_id?: string | null
          sequence_order: number
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          easing_type?: string | null
          id?: string
          joint_1_angle?: number | null
          joint_2_angle?: number | null
          joint_3_angle?: number | null
          joint_4_angle?: number | null
          joint_5_angle?: number | null
          joint_6_angle?: number | null
          joint_7_angle?: number | null
          joint_8_angle?: number | null
          motion_path_id?: string
          project_id?: string | null
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "motion_keyframes_motion_path_id_fkey"
            columns: ["motion_path_id"]
            isOneToOne: false
            referencedRelation: "motion_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "motion_keyframes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      motion_paths: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          name: string
          path_data: Json
          project_id: string | null
          robotic_arm_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          path_data?: Json
          project_id?: string | null
          robotic_arm_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          path_data?: Json
          project_id?: string | null
          robotic_arm_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "motion_paths_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "motion_paths_robotic_arm_id_fkey"
            columns: ["robotic_arm_id"]
            isOneToOne: false
            referencedRelation: "robotic_arms"
            referencedColumns: ["id"]
          },
        ]
      }
      optimized_routes: {
        Row: {
          created_at: string
          id: string
          optimization_algorithm: string | null
          route_data: Json
          total_distance: number | null
          total_duration: number | null
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          optimization_algorithm?: string | null
          route_data?: Json
          total_distance?: number | null
          total_duration?: number | null
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          optimization_algorithm?: string | null
          route_data?: Json
          total_distance?: number | null
          total_duration?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimized_routes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          due_date: string | null
          id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          project_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      printer_3d: {
        Row: {
          created_at: string
          endpoint_url: string | null
          id: string
          ip_address: string | null
          manufacturer: string | null
          max_bed_temp: number | null
          max_build_volume_x: number | null
          max_build_volume_y: number | null
          max_build_volume_z: number | null
          max_hotend_temp: number | null
          model: string
          name: string
          nozzle_diameter: number | null
          port: number | null
          project_id: string | null
          protocol: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          endpoint_url?: string | null
          id?: string
          ip_address?: string | null
          manufacturer?: string | null
          max_bed_temp?: number | null
          max_build_volume_x?: number | null
          max_build_volume_y?: number | null
          max_build_volume_z?: number | null
          max_hotend_temp?: number | null
          model: string
          name: string
          nozzle_diameter?: number | null
          port?: number | null
          project_id?: string | null
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          endpoint_url?: string | null
          id?: string
          ip_address?: string | null
          manufacturer?: string | null
          max_bed_temp?: number | null
          max_build_volume_x?: number | null
          max_build_volume_y?: number | null
          max_build_volume_z?: number | null
          max_hotend_temp?: number | null
          model?: string
          name?: string
          nozzle_diameter?: number | null
          port?: number | null
          project_id?: string | null
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "printer_3d_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      printer_3d_configurations: {
        Row: {
          build_volume_x: number | null
          build_volume_y: number | null
          build_volume_z: number | null
          created_at: string
          endpoint_url: string | null
          id: string
          models: Json | null
          models_with_files: Json | null
          print_params: Json | null
          printer_id: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          build_volume_x?: number | null
          build_volume_y?: number | null
          build_volume_z?: number | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          models?: Json | null
          models_with_files?: Json | null
          print_params?: Json | null
          printer_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          build_volume_x?: number | null
          build_volume_y?: number | null
          build_volume_z?: number | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          models?: Json | null
          models_with_files?: Json | null
          print_params?: Json | null
          printer_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "printer_3d_configurations_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: true
            referencedRelation: "printer_3d"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "printer_3d_configurations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      production_lines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          status: Database["public"]["Enums"]["production_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["production_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["production_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_lines_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      production_performance: {
        Row: {
          actual_units: number | null
          created_at: string
          date: string
          downtime_minutes: number | null
          efficiency_percentage: number | null
          id: string
          production_line_id: string | null
          quality_rate: number | null
          shift: string | null
          target_units: number | null
        }
        Insert: {
          actual_units?: number | null
          created_at?: string
          date?: string
          downtime_minutes?: number | null
          efficiency_percentage?: number | null
          id?: string
          production_line_id?: string | null
          quality_rate?: number | null
          shift?: string | null
          target_units?: number | null
        }
        Update: {
          actual_units?: number | null
          created_at?: string
          date?: string
          downtime_minutes?: number | null
          efficiency_percentage?: number | null
          id?: string
          production_line_id?: string | null
          quality_rate?: number | null
          shift?: string | null
          target_units?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_performance_production_line_id_fkey"
            columns: ["production_line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          department_id: string | null
          email: string | null
          full_name: string | null
          id: string
          position: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      project_components: {
        Row: {
          component_id: string
          component_name: string
          component_type: string
          created_at: string
          id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          component_id: string
          component_name: string
          component_type: string
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          component_id?: string
          component_name?: string
          component_type?: string
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_components_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_resources: {
        Row: {
          created_at: string
          id: string
          project_id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          resource_id: string
          resource_type: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_built: boolean | null
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_built?: boolean | null
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_built?: boolean | null
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      question_datasets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string
          created_at: string
          dataset_id: string
          id: string
          is_expanded: boolean | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          dataset_id: string
          id?: string
          is_expanded?: boolean | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          dataset_id?: string
          id?: string
          is_expanded?: boolean | null
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "question_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      responsibilities: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responsibilities_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      responsibility_assignments: {
        Row: {
          created_at: string
          id: string
          responsibility_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          responsibility_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          responsibility_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responsibility_assignments_responsibility_id_fkey"
            columns: ["responsibility_id"]
            isOneToOne: false
            referencedRelation: "responsibilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responsibility_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      robotic_arms: {
        Row: {
          created_at: string
          degrees_of_freedom: number
          id: string
          ip_address: unknown
          is_connected: boolean | null
          joints: number
          manufacturer: string | null
          max_payload: number
          max_reach: number
          model: string
          name: string
          port: number | null
          position_x: number | null
          position_y: number | null
          position_z: number | null
          project_id: string | null
          protocol: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          degrees_of_freedom?: number
          id?: string
          ip_address?: unknown
          is_connected?: boolean | null
          joints?: number
          manufacturer?: string | null
          max_payload?: number
          max_reach?: number
          model: string
          name: string
          port?: number | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          project_id?: string | null
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          degrees_of_freedom?: number
          id?: string
          ip_address?: unknown
          is_connected?: boolean | null
          joints?: number
          manufacturer?: string | null
          max_payload?: number
          max_reach?: number
          model?: string
          name?: string
          port?: number | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          project_id?: string | null
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "robotic_arms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      role_assignments: {
        Row: {
          created_at: string
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          level: string | null
          permissions: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          level?: string | null
          permissions?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          level?: string | null
          permissions?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          created_at: string
          dataset_id: string
          description: string | null
          id: string
          is_expanded: boolean | null
          name: string
          prompt: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dataset_id: string
          description?: string | null
          id?: string
          is_expanded?: boolean | null
          name: string
          prompt?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dataset_id?: string
          description?: string | null
          id?: string
          is_expanded?: boolean | null
          name?: string
          prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rules_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "rules_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      rules_datasets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      section_capacity: {
        Row: {
          current_load: number | null
          efficiency_percentage: number | null
          id: string
          max_capacity: number
          section_id: string
          updated_at: string
        }
        Insert: {
          current_load?: number | null
          efficiency_percentage?: number | null
          id?: string
          max_capacity: number
          section_id: string
          updated_at?: string
        }
        Update: {
          current_load?: number | null
          efficiency_percentage?: number | null
          id?: string
          max_capacity?: number
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_capacity_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: true
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      software: {
        Row: {
          created_at: string
          endpoint: string | null
          id: string
          name: string
          status: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          id?: string
          name: string
          status?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          id?: string
          name?: string
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      station_workflows: {
        Row: {
          created_at: string | null
          id: string
          station_id: string
          workflow_id: string
          workflow_order: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          station_id: string
          workflow_id: string
          workflow_order?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          station_id?: string
          workflow_id?: string
          workflow_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "station_workflows_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "station_workflows_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          workflows: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          workflows?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          workflows?: Json | null
        }
        Relationships: []
      }
      steps: {
        Row: {
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_questions: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          question_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          question_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          prompt: string | null
          rule_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          prompt?: string | null
          rule_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          prompt?: string | null
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          name: string
          objectives: string[] | null
          status: string | null
          team_lead_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          objectives?: string[] | null
          status?: string | null
          team_lead_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          objectives?: string[] | null
          status?: string | null
          team_lead_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      toolpaths: {
        Row: {
          cnc_machine_id: string
          created_at: string
          id: string
          machine_params: Json | null
          name: string
          points: Json
          updated_at: string
        }
        Insert: {
          cnc_machine_id: string
          created_at?: string
          id?: string
          machine_params?: Json | null
          name: string
          points?: Json
          updated_at?: string
        }
        Update: {
          cnc_machine_id?: string
          created_at?: string
          id?: string
          machine_params?: Json | null
          name?: string
          points?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toolpaths_cnc_machine_id_fkey"
            columns: ["cnc_machine_id"]
            isOneToOne: false
            referencedRelation: "cnc_machines"
            referencedColumns: ["id"]
          },
        ]
      }
      traceability_records: {
        Row: {
          assignee_id: string | null
          created_at: string
          id: string
          input_date: string
          input_time: string
          item_id: string
          notes: string | null
          production_line_id: string | null
          station_id: string | null
          step_id: string | null
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          id?: string
          input_date?: string
          input_time?: string
          item_id: string
          notes?: string | null
          production_line_id?: string | null
          station_id?: string | null
          step_id?: string | null
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          id?: string
          input_date?: string
          input_time?: string
          item_id?: string
          notes?: string | null
          production_line_id?: string | null
          station_id?: string | null
          step_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "traceability_records_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "assignees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traceability_records_production_line_id_fkey"
            columns: ["production_line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traceability_records_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traceability_records_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stops: {
        Row: {
          created_at: string
          id: string
          location_id: string
          stop_order: number
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          stop_order: number
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          stop_order?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          end_location_id: string | null
          id: string
          name: string
          start_location_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_location_id?: string | null
          id?: string
          name: string
          start_location_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_location_id?: string | null
          id?: string
          name?: string
          start_location_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_end_location_id_fkey"
            columns: ["end_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_start_location_id_fkey"
            columns: ["start_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      vision_systems: {
        Row: {
          camera_type: string
          communication_type: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          name: string
          port: number | null
          resolution: string
          status: string
          updated_at: string
        }
        Insert: {
          camera_type: string
          communication_type?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          name: string
          port?: number | null
          resolution: string
          status?: string
          updated_at?: string
        }
        Update: {
          camera_type?: string
          communication_type?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          name?: string
          port?: number | null
          resolution?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      website_builds: {
        Row: {
          additional_details: Json
          completed_at: string | null
          created_at: string
          error_message: string | null
          features: Json
          id: string
          project_id: string | null
          redirections: Json
          result_file_url: string | null
          status: string
          updated_at: string
          use_cases: string
          website_type: string
        }
        Insert: {
          additional_details?: Json
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          features?: Json
          id?: string
          project_id?: string | null
          redirections?: Json
          result_file_url?: string | null
          status?: string
          updated_at?: string
          use_cases: string
          website_type: string
        }
        Update: {
          additional_details?: Json
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          features?: Json
          id?: string
          project_id?: string | null
          redirections?: Json
          result_file_url?: string | null
          status?: string
          updated_at?: string
          use_cases?: string
          website_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_builds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_connections: {
        Row: {
          condition_type: string
          condition_value: Json | null
          created_at: string
          edge_type: string | null
          id: string
          source_handle: string | null
          source_node_id: string
          target_handle: string | null
          target_node_id: string
          workflow_id: string
        }
        Insert: {
          condition_type?: string
          condition_value?: Json | null
          created_at?: string
          edge_type?: string | null
          id?: string
          source_handle?: string | null
          source_node_id: string
          target_handle?: string | null
          target_node_id: string
          workflow_id: string
        }
        Update: {
          condition_type?: string
          condition_value?: Json | null
          created_at?: string
          edge_type?: string | null
          id?: string
          source_handle?: string | null
          source_node_id?: string
          target_handle?: string | null
          target_node_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_connections_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "workflow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_connections_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "workflow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_connections_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          execution_data: Json | null
          id: string
          project_id: string | null
          started_at: string
          status: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          project_id?: string | null
          started_at?: string
          status?: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          project_id?: string | null
          started_at?: string
          status?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_nodes: {
        Row: {
          component_id: string | null
          component_type: string
          config: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          node_type: string
          position_x: number
          position_y: number
          updated_at: string
          workflow_id: string
        }
        Insert: {
          component_id?: string | null
          component_type: string
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          node_type: string
          position_x?: number
          position_y?: number
          updated_at?: string
          workflow_id: string
        }
        Update: {
          component_id?: string | null
          component_type?: string
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          node_type?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_nodes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          created_at: string
          id: string
          step_id: string
          step_order: number
          step_type: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          step_id: string
          step_order?: number
          step_type: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          step_id?: string
          step_order?: number
          step_type?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          description: string | null
          error_count: number | null
          id: string
          is_active: boolean | null
          last_run: string | null
          name: string
          next_run: string | null
          project_id: string | null
          run_count: number | null
          status: string | null
          steps: string | null
          success_count: number | null
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          name: string
          next_run?: string | null
          project_id?: string | null
          run_count?: number | null
          status?: string | null
          steps?: string | null
          success_count?: number | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          name?: string
          next_run?: string | null
          project_id?: string | null
          run_count?: number | null
          status?: string | null
          steps?: string | null
          success_count?: number | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      production_status: "active" | "maintenance" | "inactive"
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
      production_status: ["active", "maintenance", "inactive"],
    },
  },
} as const
