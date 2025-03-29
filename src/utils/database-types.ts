
import { Database } from '@/integrations/supabase/types';

// Type extension for the group_messages table
export interface GroupMessagesTable {
  Row: {
    id: string;
    travel_group_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    travel_group_id: string;
    sender_id: string;
    content: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    travel_group_id?: string;
    sender_id?: string;
    content?: string;
    created_at?: string;
    updated_at?: string;
  };
}

// Extended Database interface with group_messages
export interface ExtendedDatabase extends Database {
  public: {
    Tables: Database['public']['Tables'] & {
      group_messages: GroupMessagesTable;
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}

// Type utility for accessing these tables in controllers
export type ExtendedTables<T extends keyof ExtendedDatabase['public']['Tables']> = 
  ExtendedDatabase['public']['Tables'][T]['Row'];
