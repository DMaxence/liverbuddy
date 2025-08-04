export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          avatar_url: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
          version: string;
          os: string;
          os_version: string;
          device: string;
          language: string;
          region: string;
          timezone: string;
          last_active_at: string;
          deleted: boolean;
          app_lang?: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          avatar_url?: string | null;
          full_name?: string | null;
          region?: string | null;
          created_at?: string;
          updated_at?: string;
          app_lang?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          avatar_url?: string | null;
          full_name?: string | null;
          region?: string | null;
          created_at?: string;
          updated_at?: string;
          app_lang?: string;
        };
      },
      feedback: {
        Row: {
          id: string;
          title: string;
          description: string;
          rating: number;
          created_at: string;
          user_id: string;
        };
        Insert: {
          title: string;
          description: string;
          rating: number;
          user_id: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          rating?: number;
          user_id?: string;
          created_at?: string;
        };
      },
    };
  };
}
