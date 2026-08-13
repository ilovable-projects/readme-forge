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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      readme_documents: {
        Row: {
          created_at: string
          id: string
          markdown_content: string
          repository_id: string
          score: number | null
          template: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          markdown_content: string
          repository_id: string
          score?: number | null
          template?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          markdown_content?: string
          repository_id?: string
          score?: number | null
          template?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "readme_documents_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      readme_scores: {
        Row: {
          accuracy_score: number | null
          configuration_score: number | null
          contribution_score: number | null
          created_at: string
          documentation_score: number | null
          features_score: number | null
          id: string
          installation_score: number | null
          issues: Json | null
          overall_score: number
          overview_score: number | null
          readme_document_id: string
          suggestions: Json | null
          tech_stack_score: number | null
          usage_score: number | null
        }
        Insert: {
          accuracy_score?: number | null
          configuration_score?: number | null
          contribution_score?: number | null
          created_at?: string
          documentation_score?: number | null
          features_score?: number | null
          id?: string
          installation_score?: number | null
          issues?: Json | null
          overall_score: number
          overview_score?: number | null
          readme_document_id: string
          suggestions?: Json | null
          tech_stack_score?: number | null
          usage_score?: number | null
        }
        Update: {
          accuracy_score?: number | null
          configuration_score?: number | null
          contribution_score?: number | null
          created_at?: string
          documentation_score?: number | null
          features_score?: number | null
          id?: string
          installation_score?: number | null
          issues?: Json | null
          overall_score?: number
          overview_score?: number | null
          readme_document_id?: string
          suggestions?: Json | null
          tech_stack_score?: number | null
          usage_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "readme_scores_readme_document_id_fkey"
            columns: ["readme_document_id"]
            isOneToOne: false
            referencedRelation: "readme_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      repositories: {
        Row: {
          created_at: string
          default_branch: string | null
          description: string | null
          forks: number | null
          github_url: string
          id: string
          is_private: boolean | null
          language: string | null
          metadata: Json | null
          name: string
          owner: string
          stars: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_branch?: string | null
          description?: string | null
          forks?: number | null
          github_url: string
          id?: string
          is_private?: boolean | null
          language?: string | null
          metadata?: Json | null
          name: string
          owner: string
          stars?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_branch?: string | null
          description?: string | null
          forks?: number | null
          github_url?: string
          id?: string
          is_private?: boolean | null
          language?: string | null
          metadata?: Json | null
          name?: string
          owner?: string
          stars?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      repository_analyses: {
        Row: {
          analysis_data: Json
          created_at: string
          detected_dependencies: Json | null
          detected_frameworks: Json | null
          detected_languages: Json | null
          detected_scripts: Json | null
          environment_variables: Json | null
          id: string
          license: string | null
          project_structure: Json | null
          repository_id: string
        }
        Insert: {
          analysis_data?: Json
          created_at?: string
          detected_dependencies?: Json | null
          detected_frameworks?: Json | null
          detected_languages?: Json | null
          detected_scripts?: Json | null
          environment_variables?: Json | null
          id?: string
          license?: string | null
          project_structure?: Json | null
          repository_id: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          detected_dependencies?: Json | null
          detected_frameworks?: Json | null
          detected_languages?: Json | null
          detected_scripts?: Json | null
          environment_variables?: Json | null
          id?: string
          license?: string | null
          project_structure?: Json | null
          repository_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repository_analyses_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
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
