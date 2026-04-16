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
      daily_rituals: {
        Row: {
          bonus_claimed: boolean
          created_at: string
          embers_earned: number
          id: string
          quest_1_completed: boolean
          quest_1_params: Json
          quest_1_type: string
          quest_2_completed: boolean
          quest_2_params: Json
          quest_2_type: string
          quest_3_completed: boolean
          quest_3_params: Json
          quest_3_type: string
          ritual_date: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          bonus_claimed?: boolean
          created_at?: string
          embers_earned?: number
          id?: string
          quest_1_completed?: boolean
          quest_1_params?: Json
          quest_1_type: string
          quest_2_completed?: boolean
          quest_2_params?: Json
          quest_2_type: string
          quest_3_completed?: boolean
          quest_3_params?: Json
          quest_3_type: string
          ritual_date?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          bonus_claimed?: boolean
          created_at?: string
          embers_earned?: number
          id?: string
          quest_1_completed?: boolean
          quest_1_params?: Json
          quest_1_type?: string
          quest_2_completed?: boolean
          quest_2_params?: Json
          quest_2_type?: string
          quest_3_completed?: boolean
          quest_3_params?: Json
          quest_3_type?: string
          ritual_date?: string
          user_id?: string
          xp_earned?: number
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
      pillar_progress: {
        Row: {
          boss_defeated: boolean
          created_at: string
          current_floor: number
          id: string
          pillar: string
          total_trials_mastered: number
          trials_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          boss_defeated?: boolean
          created_at?: string
          current_floor?: number
          id?: string
          pillar: string
          total_trials_mastered?: number
          trials_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          boss_defeated?: boolean
          created_at?: string
          current_floor?: number
          id?: string
          pillar?: string
          total_trials_mastered?: number
          trials_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_characters: {
        Row: {
          created_at: string
          current_rank: string
          embers: number
          equipped_piece_set: string
          equipped_theme: string
          equipped_title: string | null
          last_ritual_date: string | null
          level: number
          longest_streak: number
          main_pillar: string | null
          streak_days: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_rank?: string
          embers?: number
          equipped_piece_set?: string
          equipped_theme?: string
          equipped_title?: string | null
          last_ritual_date?: string | null
          level?: number
          longest_streak?: number
          main_pillar?: string | null
          streak_days?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_rank?: string
          embers?: number
          equipped_piece_set?: string
          equipped_theme?: string
          equipped_title?: string | null
          last_ritual_date?: string | null
          level?: number
          longest_streak?: number
          main_pillar?: string | null
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      player_unlocks: {
        Row: {
          acquired_at: string
          equipped: boolean
          id: string
          unlock_id: string
          unlock_type: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          equipped?: boolean
          id?: string
          unlock_id: string
          unlock_type: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          equipped?: boolean
          id?: string
          unlock_id?: string
          unlock_type?: string
          user_id?: string
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
      skill_tree_progress: {
        Row: {
          attempts: number
          best_accuracy: number | null
          branch: string
          created_at: string
          id: string
          level: number
          mastered: boolean
          skill_name: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          attempts?: number
          best_accuracy?: number | null
          branch: string
          created_at?: string
          id?: string
          level?: number
          mastered?: boolean
          skill_name: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          attempts?: number
          best_accuracy?: number | null
          branch?: string
          created_at?: string
          id?: string
          level?: number
          mastered?: boolean
          skill_name?: string
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          accuracy: number | null
          created_at: string
          duration_seconds: number | null
          id: string
          metadata: Json | null
          pillar: string
          positions_attempted: number
          positions_correct: number
          session_type: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          pillar: string
          positions_attempted?: number
          positions_correct?: number
          session_type: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          pillar?: string
          positions_attempted?: number
          positions_correct?: number
          session_type?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      trial_history: {
        Row: {
          attempts: number
          best_accuracy: number | null
          created_at: string
          floor_number: number
          id: string
          mastered_at: string | null
          passed: boolean
          perfect_clear: boolean
          pillar: string
          trial_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          best_accuracy?: number | null
          created_at?: string
          floor_number: number
          id?: string
          mastered_at?: string | null
          passed?: boolean
          perfect_clear?: boolean
          pillar: string
          trial_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          best_accuracy?: number | null
          created_at?: string
          floor_number?: number
          id?: string
          mastered_at?: string | null
          passed?: boolean
          perfect_clear?: boolean
          pillar?: string
          trial_number?: number
          updated_at?: string
          user_id?: string
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
      user_games: {
        Row: {
          analyzed: boolean
          created_at: string
          game_id: string
          id: string
          opponent: string | null
          pgn: string | null
          platform: string
          played_at: string | null
          result: string | null
          time_control: string | null
          user_id: string
        }
        Insert: {
          analyzed?: boolean
          created_at?: string
          game_id: string
          id?: string
          opponent?: string | null
          pgn?: string | null
          platform: string
          played_at?: string | null
          result?: string | null
          time_control?: string | null
          user_id: string
        }
        Update: {
          analyzed?: boolean
          created_at?: string
          game_id?: string
          id?: string
          opponent?: string | null
          pgn?: string | null
          platform?: string
          played_at?: string | null
          result?: string | null
          time_control?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_positions: {
        Row: {
          category: string
          created_at: string
          difficulty_score: number | null
          drilled: boolean
          engine_best_san: string | null
          eval_after: number | null
          eval_before: number | null
          fen: string
          game_id: string | null
          id: string
          move_number: number
          user_id: string
          your_move_san: string | null
        }
        Insert: {
          category: string
          created_at?: string
          difficulty_score?: number | null
          drilled?: boolean
          engine_best_san?: string | null
          eval_after?: number | null
          eval_before?: number | null
          fen: string
          game_id?: string | null
          id?: string
          move_number: number
          user_id: string
          your_move_san?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          difficulty_score?: number | null
          drilled?: boolean
          engine_best_san?: string | null
          eval_after?: number | null
          eval_before?: number | null
          fen?: string
          game_id?: string | null
          id?: string
          move_number?: number
          user_id?: string
          your_move_san?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_positions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "user_games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          chesscom_username: string | null
          created_at: string
          id: string
          last_sync_at: string | null
          lichess_username: string | null
          longest_streak: number
          primary_pillar: string | null
          skill_rating: number | null
          updated_at: string
          user_id: string
          warmup_streak: number
        }
        Insert: {
          chesscom_username?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          lichess_username?: string | null
          longest_streak?: number
          primary_pillar?: string | null
          skill_rating?: number | null
          updated_at?: string
          user_id: string
          warmup_streak?: number
        }
        Update: {
          chesscom_username?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          lichess_username?: string | null
          longest_streak?: number
          primary_pillar?: string | null
          skill_rating?: number | null
          updated_at?: string
          user_id?: string
          warmup_streak?: number
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
      warmup_sessions: {
        Row: {
          created_at: string
          diagnostic_correct: number
          diagnostic_total: number
          id: string
          practice_correct: number
          practice_total: number
          user_id: string
          warmup_date: string
          weakness_category: string
          went_to_battle: boolean
          won_after: boolean | null
        }
        Insert: {
          created_at?: string
          diagnostic_correct?: number
          diagnostic_total?: number
          id?: string
          practice_correct?: number
          practice_total?: number
          user_id: string
          warmup_date?: string
          weakness_category: string
          went_to_battle?: boolean
          won_after?: boolean | null
        }
        Update: {
          created_at?: string
          diagnostic_correct?: number
          diagnostic_total?: number
          id?: string
          practice_correct?: number
          practice_total?: number
          user_id?: string
          warmup_date?: string
          weakness_category?: string
          went_to_battle?: boolean
          won_after?: boolean | null
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
