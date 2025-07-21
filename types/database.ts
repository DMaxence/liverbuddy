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
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          requirement_type: "drinks_consumed";
          requirement_value: number;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          requirement_type: "drinks_consumed";
          requirement_value: number;
          xp_reward: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          requirement_type?: "drinks_consumed";
          requirement_value?: number;
          xp_reward?: number;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
    };
  };
}
