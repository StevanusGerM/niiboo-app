/**
 * Supabase database types for NiiBooo.
 * Mirrors supabase/schema.sql. Regenerate with:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 * (then re-add the JSON content types from ./content.ts where needed).
 */
import type { ExamQuestion, LessonContent, StoryPair } from "./content";

export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type SectionType = "listening" | "reading" | "writing";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          current_hsk_level: number;
          streak_days: number;
          token_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          current_hsk_level?: number;
          streak_days?: number;
          token_balance?: number;
        };
        Update: {
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          current_hsk_level?: number;
          streak_days?: number;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          hsk_level: number;
          title: string;
          category: string;
          content_json: LessonContent;
          created_at: string;
        };
        Insert: {
          id?: string;
          hsk_level: number;
          title: string;
          category: string;
          content_json: LessonContent;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          is_completed: boolean;
          score: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          is_completed?: boolean;
          score?: number | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Insert"]>;
        Relationships: [];
      };
      parallel_stories: {
        Row: {
          id: string;
          title_zh: string;
          title_id: string;
          hsk_level: number;
          content_pairs: StoryPair[];
          audio_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title_zh: string;
          title_id: string;
          hsk_level: number;
          content_pairs: StoryPair[];
          audio_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["parallel_stories"]["Insert"]>;
        Relationships: [];
      };
      hsk_exams: {
        Row: {
          id: string;
          hsk_level: number;
          section_type: SectionType;
          questions_json: ExamQuestion[];
          created_at: string;
        };
        Insert: {
          id?: string;
          hsk_level: number;
          section_type: SectionType;
          questions_json: ExamQuestion[];
        };
        Update: Partial<Database["public"]["Tables"]["hsk_exams"]["Insert"]>;
        Relationships: [];
      };
      expert_bookings: {
        Row: {
          id: string;
          user_id: string;
          expert_name: string;
          scheduled_time: string;
          status: BookingStatus;
          zoom_link: string | null;
          token_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expert_name: string;
          scheduled_time: string;
          status?: BookingStatus;
          zoom_link?: string | null;
          token_cost?: number;
        };
        Update: Partial<Database["public"]["Tables"]["expert_bookings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      book_expert_session: {
        Args: { p_expert_name: string; p_scheduled_time: string; p_cost: number };
        Returns: Database["public"]["Tables"]["expert_bookings"]["Row"];
      };
      cancel_expert_session: {
        Args: { p_booking_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

type Tables = Database["public"]["Tables"];
export type Profile = Tables["profiles"]["Row"];
export type Lesson = Tables["lessons"]["Row"];
export type UserProgress = Tables["user_progress"]["Row"];
export type ParallelStory = Tables["parallel_stories"]["Row"];
export type HskExam = Tables["hsk_exams"]["Row"];
export type ExpertBooking = Tables["expert_bookings"]["Row"];
