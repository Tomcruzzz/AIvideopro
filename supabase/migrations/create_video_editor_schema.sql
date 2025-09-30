/*
  # AI Video Pro - Database Schema

  This migration creates the core database structure for the AI Video Pro application.

  ## New Tables

  ### `projects`
  Stores user video projects with metadata
  - `id` (uuid, primary key) - Unique project identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `name` (text) - Project name
  - `duration` (integer) - Project duration in milliseconds
  - `resolution` (text) - Video resolution (e.g., "1920x1080")
  - `fps` (integer) - Frames per second (default 30)
  - `thumbnail_url` (text, nullable) - Project thumbnail image
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `timeline_clips`
  Stores individual clips on the video timeline
  - `id` (uuid, primary key) - Unique clip identifier
  - `project_id` (uuid) - Reference to parent project
  - `track_index` (integer) - Layer/track number (0 = bottom)
  - `start_time` (integer) - Start position on timeline in milliseconds
  - `duration` (integer) - Clip duration in milliseconds
  - `clip_type` (text) - Type: 'video', 'image', 'audio'
  - `source_url` (text) - URL to media file in Supabase Storage
  - `trim_start` (integer) - Trim start point in milliseconds (default 0)
  - `trim_end` (integer, nullable) - Trim end point in milliseconds
  - `properties` (jsonb) - Additional properties (opacity, speed, position, etc.)
  - `created_at` (timestamptz) - Creation timestamp

  ### `ai_generation_jobs`
  Tracks AI video generation requests
  - `id` (uuid, primary key) - Unique job identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `project_id` (uuid, nullable) - Optional reference to project
  - `provider` (text) - AI provider: 'runway', 'kling', 'veo3', 'seadance'
  - `job_type` (text) - Type: 'text-to-video', 'image-to-video'
  - `prompt` (text) - Generation prompt
  - `source_image_url` (text, nullable) - Source image for image-to-video
  - `parameters` (jsonb) - Generation parameters (duration, aspect ratio, etc.)
  - `status` (text) - Status: 'pending', 'processing', 'completed', 'failed'
  - `provider_job_id` (text, nullable) - External provider's job ID
  - `result_url` (text, nullable) - URL to generated video
  - `error_message` (text, nullable) - Error details if failed
  - `created_at` (timestamptz) - Creation timestamp
  - `completed_at` (timestamptz, nullable) - Completion timestamp

  ### `media_assets`
  Library of user's media files and generated videos
  - `id` (uuid, primary key) - Unique asset identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `asset_type` (text) - Type: 'video', 'image', 'audio'
  - `source` (text) - Source: 'upload', 'ai-generated', 'rendered'
  - `url` (text) - URL to asset file
  - `thumbnail_url` (text, nullable) - Thumbnail for preview
  - `filename` (text) - Original filename
  - `duration` (integer, nullable) - Duration in milliseconds (for video/audio)
  - `metadata` (jsonb) - Additional metadata (resolution, format, size, etc.)
  - `ai_job_id` (uuid, nullable) - Reference to AI generation job if applicable
  - `created_at` (timestamptz) - Creation timestamp

  ### `processing_jobs`
  Tracks video processing tasks (lipsync, upscaling, rendering)
  - `id` (uuid, primary key) - Unique job identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `job_type` (text) - Type: 'lipsync', 'upscale', 'render'
  - `source_clip_id` (uuid, nullable) - Source clip for processing
  - `project_id` (uuid, nullable) - Project for render jobs
  - `parameters` (jsonb) - Processing parameters
  - `status` (text) - Status: 'pending', 'processing', 'completed', 'failed'
  - `progress` (integer) - Progress percentage (0-100)
  - `result_url` (text, nullable) - URL to processed video
  - `error_message` (text, nullable) - Error details if failed
  - `created_at` (timestamptz) - Creation timestamp
  - `completed_at` (timestamptz, nullable) - Completion timestamp

  ## Security

  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated users to manage their own data only
  - Users can only read/write their own projects, clips, jobs, and assets
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration integer DEFAULT 0,
  resolution text DEFAULT '1920x1080',
  fps integer DEFAULT 30,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create timeline_clips table
CREATE TABLE IF NOT EXISTS timeline_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  track_index integer DEFAULT 0,
  start_time integer DEFAULT 0,
  duration integer NOT NULL,
  clip_type text NOT NULL,
  source_url text NOT NULL,
  trim_start integer DEFAULT 0,
  trim_end integer,
  properties jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create ai_generation_jobs table
CREATE TABLE IF NOT EXISTS ai_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  provider text NOT NULL,
  job_type text NOT NULL,
  prompt text NOT NULL,
  source_image_url text,
  parameters jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  provider_job_id text,
  result_url text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  source text NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  filename text NOT NULL,
  duration integer,
  metadata jsonb DEFAULT '{}',
  ai_job_id uuid REFERENCES ai_generation_jobs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create processing_jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  source_clip_id uuid REFERENCES timeline_clips(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  parameters jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  progress integer DEFAULT 0,
  result_url text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id ON timeline_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_start_time ON timeline_clips(start_time);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON ai_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for timeline_clips
CREATE POLICY "Users can view own timeline clips"
  ON timeline_clips FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own timeline clips"
  ON timeline_clips FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own timeline clips"
  ON timeline_clips FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own timeline clips"
  ON timeline_clips FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_generation_jobs
CREATE POLICY "Users can view own AI jobs"
  ON ai_generation_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI jobs"
  ON ai_generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI jobs"
  ON ai_generation_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI jobs"
  ON ai_generation_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for media_assets
CREATE POLICY "Users can view own media assets"
  ON media_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own media assets"
  ON media_assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media assets"
  ON media_assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media assets"
  ON media_assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for processing_jobs
CREATE POLICY "Users can view own processing jobs"
  ON processing_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own processing jobs"
  ON processing_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processing jobs"
  ON processing_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own processing jobs"
  ON processing_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();