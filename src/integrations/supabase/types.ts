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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      custom_lines: {
        Row: {
          created_at: string
          fens: string[]
          id: string
          move_count: number
          moves: string[]
          name: string
          opening_id: string
          side: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fens: string[]
          id?: string
          move_count?: number
          moves: string[]
          name?: string
          opening_id?: string
          side?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fens?: string[]
          id?: string
          move_count?: number
          moves?: string[]
          name?: string
          opening_id?: string
          side?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          analysis_used: boolean
          id: string
          last_trap_learned_at: string | null
          lines_learned: number
          practice_used: boolean
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          analysis_used?: boolean
          id?: string
          last_trap_learned_at?: string | null
          lines_learned?: number
          practice_used?: boolean
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          analysis_used?: boolean
          id?: string
          last_trap_learned_at?: string | null
          lines_learned?: number
          practice_used?: boolean
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      line_overrides: {
        Row: {
          conclusion_text: string | null
          crucial_moment_index: number | null
          id: string
          line_id: string
          moves: string[] | null
          updated_at: string
        }
        Insert: {
          conclusion_text?: string | null
          crucial_moment_index?: number | null
          id?: string
          line_id: string
          moves?: string[] | null
          updated_at?: string
        }
        Update: {
          conclusion_text?: string | null
          crucial_moment_index?: number | null
          id?: string
          line_id?: string
          moves?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      move_explanations: {
        Row: {
          created_at: string
          explanation: string
          id: string
          line_index: number
          move_index: number
          move_san: string
          opening_id: string
          updated_at: string
          variation_id: string
        }
        Insert: {
          created_at?: string
          explanation?: string
          id?: string
          line_index?: number
          move_index: number
          move_san?: string
          opening_id: string
          updated_at?: string
          variation_id: string
        }
        Update: {
          created_at?: string
          explanation?: string
          id?: string
          line_index?: number
          move_index?: number
          move_san?: string
          opening_id?: string
          updated_at?: string
          variation_id?: string
        }
        Relationships: []
      }
      redeem_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          redeemed_at: string | null
          redeemed_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Relationships: []
      }
      user_entitlements: {
        Row: {
          created_at: string
          entitlement: string
          expires_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement?: string
          expires_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entitlement?: string
          expires_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_focus: {
        Row: {
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_repertoires: {
        Row: {
          created_at: string
          id: string
          name: string
          side: string
          starting_fen: string
          theme_id: string
          tree: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          side?: string
          starting_fen?: string
          theme_id?: string
          tree?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          side?: string
          starting_fen?: string
          theme_id?: string
          tree?: Json
          updated_at?: string
          user_id?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
