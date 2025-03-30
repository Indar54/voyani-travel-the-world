export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      travel_groups: {
        Row: {
          id: string;
          title: string;
          description: string;
          destination: string;
          start_date: string;
          end_date: string;
          budget_range: number | null;
          max_participants: number | null;
          current_participants: number;
          image_url: string | null;
          creator_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          destination: string;
          start_date: string;
          end_date: string;
          budget_range?: number | null;
          max_participants?: number | null;
          current_participants?: number;
          image_url?: string | null;
          creator_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          destination?: string;
          start_date?: string;
          end_date?: string;
          budget_range?: number | null;
          max_participants?: number | null;
          current_participants?: number;
          image_url?: string | null;
          creator_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "travel_groups_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      group_messages: {
        Row: {
          id: string;
          content: string;
          created_at: string;
          group_id: string;
          sender_id: string;
        };
        Insert: {
          id?: string;
          content: string;
          created_at?: string;
          group_id: string;
          sender_id: string;
        };
        Update: {
          id?: string;
          content?: string;
          created_at?: string;
          group_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "travel_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      group_members: {
        Row: {
          id: string;
          profile_id: string;
          travel_group_id: string;
          status: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          travel_group_id: string;
          status?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          travel_group_id?: string;
          status?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_travel_group_id_fkey";
            columns: ["travel_group_id"];
            referencedRelation: "travel_groups";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 