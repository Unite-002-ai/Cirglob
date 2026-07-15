export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          email: string | null;
          role: string;
          name: string | null;
          avatar: string | null;
          first_name: string | null;
          last_name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          completed: boolean;
          is_completed: boolean;
          last_login_at: string | null;
          last_password_change_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        },
        {
          id: string;
          email?: string | null;
          role?: string;
          name?: string | null;
          avatar?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          completed?: boolean;
          is_completed?: boolean;
          last_login_at?: string | null;
          last_password_change_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        }
      >;

      profile_settings: Table<
        {
          user_id: string;
          notifications_enabled: boolean;
          login_alerts: boolean;
          trusted_devices: boolean;
          require_new_device_verification: boolean;
          revoke_sessions_on_password_change: boolean;
          system_updates: boolean;
          app_updates: boolean;
          dark_mode: boolean;
          created_at: string | null;
          updated_at: string | null;
        },
        {
          user_id: string;
          notifications_enabled?: boolean;
          login_alerts?: boolean;
          trusted_devices?: boolean;
          require_new_device_verification?: boolean;
          revoke_sessions_on_password_change?: boolean;
          system_updates?: boolean;
          app_updates?: boolean;
          dark_mode?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        }
      >;

      sessions_log: Table<
        {
          id: string;
          user_id: string;
          event: string | null;
          session_id: string | null;
          device_id: string | null;
          browser: string | null;
          os: string | null;
          country: string | null;
          city: string | null;
          ip_address: string | null;
          ip_hash: string | null;
          login_success: boolean | null;
          trusted: boolean | null;
          user_agent: string | null;
          created_at: string | null;
          updated_at: string | null;
        },
        {
          id?: string;
          user_id: string;
          event?: string | null;
          session_id?: string | null;
          device_id?: string | null;
          browser?: string | null;
          os?: string | null;
          country?: string | null;
          city?: string | null;
          ip_address?: string | null;
          ip_hash?: string | null;
          login_success?: boolean | null;
          trusted?: boolean | null;
          user_agent?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        }
      >;

      trusted_devices: Table<
        {
          id: string;
          user_id: string;
          device_id: string;
          browser: string | null;
          os: string | null;
          user_agent: string | null;
          last_ip_hash: string | null;
          last_seen_at: string | null;
          created_at: string | null;
          trusted: boolean | null;
          nickname: string | null;
        },
        {
          id?: string;
          user_id: string;
          device_id: string;
          browser?: string | null;
          os?: string | null;
          user_agent?: string | null;
          last_ip_hash?: string | null;
          last_seen_at?: string | null;
          created_at?: string | null;
          trusted?: boolean | null;
          nickname?: string | null;
        }
      >;

      security_verifications: Table<
        {
          id: string;
          user_id: string;
          code_hash: string;
          type: string;
          expires_at: string;
          used: boolean;
          attempts: number;
          created_at: string | null;
        },
        {
          id?: string;
          user_id: string;
          code_hash: string;
          type: string;
          expires_at: string;
          used?: boolean;
          attempts?: number;
          created_at?: string | null;
        }
      >;

      security_events: Table<
        {
          id: string;
          user_id: string;
          event_type: string;
          risk_level: string | null;
          device_id: string | null;
          browser: string | null;
          os: string | null;
          country: string | null;
          city: string | null;
          ip_hash: string | null;
          metadata: Json | null;
          created_at: string | null;
        },
        {
          id?: string;
          user_id: string;
          event_type: string;
          risk_level?: string | null;
          device_id?: string | null;
          browser?: string | null;
          os?: string | null;
          country?: string | null;
          city?: string | null;
          ip_hash?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        }
      >;
    };
  };
}
