export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          clerk_id: string;
          email: string | null;
          name: string | null;
          credits: number;
          plan: 'free' | 'starter' | 'pro' | 'unlimited';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email?: string | null;
          name?: string | null;
          credits?: number;
          plan?: 'free' | 'starter' | 'pro' | 'unlimited';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string | null;
          name?: string | null;
          credits?: number;
          plan?: 'free' | 'starter' | 'pro' | 'unlimited';
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'signup';
          description: string | null;
          tool_type: string | null;
          generation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'signup';
          description?: string | null;
          tool_type?: string | null;
          generation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: 'purchase' | 'usage' | 'bonus' | 'refund' | 'signup';
          description?: string | null;
          tool_type?: string | null;
          generation_id?: string | null;
          created_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          tool_type: 'roadmap' | 'prd' | 'pitch_deck' | 'persona' | 'competitive_analysis';
          title: string | null;
          input: Json;
          output: Json;
          credits_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_type: 'roadmap' | 'prd' | 'pitch_deck' | 'persona' | 'competitive_analysis';
          title?: string | null;
          input: Json;
          output: Json;
          credits_used: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_type?: 'roadmap' | 'prd' | 'pitch_deck' | 'persona' | 'competitive_analysis';
          title?: string | null;
          input?: Json;
          output?: Json;
          credits_used?: number;
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_prefix: string;
          key_hash: string;
          last_used_at: string | null;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          key_prefix: string;
          key_hash: string;
          last_used_at?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          key_prefix?: string;
          key_hash?: string;
          last_used_at?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Helper types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
export type Generation = Database['public']['Tables']['generations']['Row'];
export type ApiKey = Database['public']['Tables']['api_keys']['Row'];

export type ToolType = Generation['tool_type'];
export type Plan = UserProfile['plan'];
export type TransactionType = CreditTransaction['type'];
