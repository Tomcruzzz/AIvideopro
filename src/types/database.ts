export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          duration: number;
          resolution: string;
          fps: number;
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          duration?: number;
          resolution?: string;
          fps?: number;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          duration?: number;
          resolution?: string;
          fps?: number;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      timeline_clips: {
        Row: {
          id: string;
          project_id: string;
          track_index: number;
          start_time: number;
          duration: number;
          clip_type: string;
          source_url: string;
          trim_start: number;
          trim_end: number | null;
          properties: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          track_index?: number;
          start_time?: number;
          duration: number;
          clip_type: string;
          source_url: string;
          trim_start?: number;
          trim_end?: number | null;
          properties?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          track_index?: number;
          start_time?: number;
          duration?: number;
          clip_type?: string;
          source_url?: string;
          trim_start?: number;
          trim_end?: number | null;
          properties?: Record<string, any>;
          created_at?: string;
        };
      };
      ai_generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          provider: string;
          job_type: string;
          prompt: string;
          source_image_url: string | null;
          parameters: Record<string, any>;
          status: string;
          provider_job_id: string | null;
          result_url: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          provider: string;
          job_type: string;
          prompt: string;
          source_image_url?: string | null;
          parameters?: Record<string, any>;
          status?: string;
          provider_job_id?: string | null;
          result_url?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          provider?: string;
          job_type?: string;
          prompt?: string;
          source_image_url?: string | null;
          parameters?: Record<string, any>;
          status?: string;
          provider_job_id?: string | null;
          result_url?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      media_assets: {
        Row: {
          id: string;
          user_id: string;
          asset_type: string;
          source: string;
          url: string;
          thumbnail_url: string | null;
          filename: string;
          duration: number | null;
          metadata: Record<string, any>;
          ai_job_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_type: string;
          source: string;
          url: string;
          thumbnail_url?: string | null;
          filename: string;
          duration?: number | null;
          metadata?: Record<string, any>;
          ai_job_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset_type?: string;
          source?: string;
          url?: string;
          thumbnail_url?: string | null;
          filename?: string;
          duration?: number | null;
          metadata?: Record<string, any>;
          ai_job_id?: string | null;
          created_at?: string;
        };
      };
      processing_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_type: string;
          source_clip_id: string | null;
          project_id: string | null;
          parameters: Record<string, any>;
          status: string;
          progress: number;
          result_url: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_type: string;
          source_clip_id?: string | null;
          project_id?: string | null;
          parameters?: Record<string, any>;
          status?: string;
          progress?: number;
          result_url?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_type?: string;
          source_clip_id?: string | null;
          project_id?: string | null;
          parameters?: Record<string, any>;
          status?: string;
          progress?: number;
          result_url?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
}