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
          status?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
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
          protocol?: string | null
          safe_height?: number | null
          status?: string
          updated_at?: string
          work_area?: string | null
          work_height?: number | null
        }
        Relationships: []
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
          protocol?: string
          status?: string
          updated_at?: string
          voltage?: number
        }
        Relationships: []
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
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          employee_id: string
          id?: string
          is_manager?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          employee_id?: string
          id?: string
          is_manager?: boolean | null
          name?: string
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
          status?: string
          updated_at?: string
          url?: string
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
          ip_address: unknown | null
          model: string | null
          name: string
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
          ip_address?: unknown | null
          model?: string | null
          name: string
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
          ip_address?: unknown | null
          model?: string | null
          name?: string
          serial_number?: string | null
          status?: string | null
          type?: string
          warranty_expiry?: string | null
        }
        Relationships: []
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
          robotic_arm_id?: string
          updated_at?: string
        }
        Relationships: [
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
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      laser_toolpaths: {
        Row: {
          created_at: string
          id: string
          laser_machine_id: string
          laser_params: Json | null
          name: string
          points: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          laser_machine_id: string
          laser_params?: Json | null
          name: string
          points?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          laser_machine_id?: string
          laser_params?: Json | null
          name?: string
          points?: Json
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
          robotic_arm_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "motion_paths_robotic_arm_id_fkey"
            columns: ["robotic_arm_id"]
            isOneToOne: false
            referencedRelation: "robotic_arms"
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
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
          ip_address: unknown | null
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
          protocol: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          degrees_of_freedom?: number
          id?: string
          ip_address?: unknown | null
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
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          degrees_of_freedom?: number
          id?: string
          ip_address?: unknown | null
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
          protocol?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
          id: string
          is_active: boolean | null
          name: string
          steps: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
