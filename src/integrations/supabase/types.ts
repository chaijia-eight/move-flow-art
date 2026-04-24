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
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          properties: Json
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          properties?: Json
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          properties?: Json
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blitz_content: {
        Row: {
          content_id: string
          fen: string
          hint: string | null
          solution_san: string[]
          time_limit_seconds: number | null
        }
        Insert: {
          content_id: string
          fen: string
          hint?: string | null
          solution_san: string[]
          time_limit_seconds?: number | null
        }
        Update: {
          content_id?: string
          fen?: string
          hint?: string | null
          solution_san?: string[]
          time_limit_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blitz_content_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          content_ids: string[]
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_ids?: string[]
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_ids?: string[]
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content_id: string
          created_at: string
          id: string
          likes_count: number
          text: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          likes_count?: number
          text: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          likes_count?: number
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          completion_rate: number
          completions: number
          created_at: string
          creator_id: string
          description: string | null
          difficulty: number
          id: string
          is_featured: boolean
          is_team_content: boolean
          published_at: string | null
          status: string
          tags: string[]
          thumbnail_fen: string | null
          title: string | null
          type: string
          updated_at: string
          views: number
        }
        Insert: {
          completion_rate?: number
          completions?: number
          created_at?: string
          creator_id: string
          description?: string | null
          difficulty?: number
          id?: string
          is_featured?: boolean
          is_team_content?: boolean
          published_at?: string | null
          status?: string
          tags?: string[]
          thumbnail_fen?: string | null
          title?: string | null
          type: string
          updated_at?: string
          views?: number
        }
        Update: {
          completion_rate?: number
          completions?: number
          created_at?: string
          creator_id?: string
          description?: string | null
          difficulty?: number
          id?: string
          is_featured?: boolean
          is_team_content?: boolean
          published_at?: string | null
          status?: string
          tags?: string[]
          thumbnail_fen?: string | null
          title?: string | null
          type?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      deep_dive_content: {
        Row: {
          content_id: string
          est_duration_seconds: number | null
          total_steps: number
        }
        Insert: {
          content_id: string
          est_duration_seconds?: number | null
          total_steps?: number
        }
        Update: {
          content_id?: string
          est_duration_seconds?: number | null
          total_steps?: number
        }
        Relationships: [
          {
            foreignKeyName: "deep_dive_content_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      deep_dive_steps: {
        Row: {
          branch_parent_step_id: string | null
          content_id: string
          context_before: string | null
          created_at: string
          fen: string
          hint: string | null
          id: string
          is_branch_point: boolean
          prompt: string | null
          solution_san: string[]
          step_number: number
        }
        Insert: {
          branch_parent_step_id?: string | null
          content_id: string
          context_before?: string | null
          created_at?: string
          fen: string
          hint?: string | null
          id?: string
          is_branch_point?: boolean
          prompt?: string | null
          solution_san: string[]
          step_number: number
        }
        Update: {
          branch_parent_step_id?: string | null
          content_id?: string
          context_before?: string | null
          created_at?: string
          fen?: string
          hint?: string | null
          id?: string
          is_branch_point?: boolean
          prompt?: string | null
          solution_san?: string[]
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "deep_dive_steps_branch_parent_step_id_fkey"
            columns: ["branch_parent_step_id"]
            isOneToOne: false
            referencedRelation: "deep_dive_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deep_dive_steps_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
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
      reports: {
        Row: {
          content_id: string
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          content_id: string | null
          created_at: string
          from_user_id: string
          id: string
          points_amount: number
          to_creator_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          points_amount: number
          to_creator_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          points_amount?: number
          to_creator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tips_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_content_interactions: {
        Row: {
          content_id: string
          created_at: string
          id: string
          interaction_type: string
          time_spent_ms: number | null
          user_id: string
          was_personalized: boolean
          weakness_tag_targeted: string | null
          xp_earned: number
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          interaction_type: string
          time_spent_ms?: number | null
          user_id: string
          was_personalized?: boolean
          weakness_tag_targeted?: string | null
          xp_earned?: number
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          time_spent_ms?: number | null
          user_id?: string
          was_personalized?: boolean
          weakness_tag_targeted?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_content_interactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
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
          avatar_url: string | null
          best_streak: number
          bio: string | null
          chesscom_username: string | null
          consumer_level: number
          consumer_xp: number
          created_at: string
          creator_level: number
          creator_xp: number
          current_streak: number
          id: string
          last_analysis_at: string | null
          last_streak_date: string | null
          last_sync_at: string | null
          lichess_username: string | null
          longest_streak: number
          primary_pillar: string | null
          puzzle_losses: number
          puzzle_rating: number
          puzzle_wins: number
          skill_rating: number | null
          total_points: number
          updated_at: string
          user_id: string
          username: string | null
          warmup_streak: number
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number
          bio?: string | null
          chesscom_username?: string | null
          consumer_level?: number
          consumer_xp?: number
          created_at?: string
          creator_level?: number
          creator_xp?: number
          current_streak?: number
          id?: string
          last_analysis_at?: string | null
          last_streak_date?: string | null
          last_sync_at?: string | null
          lichess_username?: string | null
          longest_streak?: number
          primary_pillar?: string | null
          puzzle_losses?: number
          puzzle_rating?: number
          puzzle_wins?: number
          skill_rating?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
          username?: string | null
          warmup_streak?: number
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number
          bio?: string | null
          chesscom_username?: string | null
          consumer_level?: number
          consumer_xp?: number
          created_at?: string
          creator_level?: number
          creator_xp?: number
          current_streak?: number
          id?: string
          last_analysis_at?: string | null
          last_streak_date?: string | null
          last_sync_at?: string | null
          lichess_username?: string | null
          longest_streak?: number
          primary_pillar?: string | null
          puzzle_losses?: number
          puzzle_rating?: number
          puzzle_wins?: number
          skill_rating?: number | null
          total_points?: number
          updated_at?: string
          user_id?: string
          username?: string | null
          warmup_streak?: number
        }
        Relationships: []
      }
      user_weaknesses: {
        Row: {
          created_at: string
          id: string
          last_seen: string
          severity_score: number
          status: string
          times_missed: number
          times_solved_since: number
          updated_at: string
          user_id: string
          weakness_tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen?: string
          severity_score?: number
          status?: string
          times_missed?: number
          times_solved_since?: number
          updated_at?: string
          user_id: string
          weakness_tag: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen?: string
          severity_score?: number
          status?: string
          times_missed?: number
          times_solved_since?: number
          updated_at?: string
          user_id?: string
          weakness_tag?: string
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
