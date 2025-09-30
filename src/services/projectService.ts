import { supabase } from '../lib/supabase';
import { Project, TimelineClip } from '../types';

export const projectService = {
  async createProject(name: string): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        duration: 0,
        resolution: '1920x1080',
        fps: 30
      })
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async getUserProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  async getProjectById(projectId: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Project not found');
    return data as Project;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  },

  async duplicateProject(projectId: string): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const originalProject = await this.getProjectById(projectId);
    const clips = await this.getProjectClips(projectId);

    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: `${originalProject.name} (Copy)`,
        duration: originalProject.duration,
        resolution: originalProject.resolution,
        fps: originalProject.fps
      })
      .select()
      .single();

    if (projectError) throw projectError;

    if (clips.length > 0) {
      const newClips = clips.map(clip => ({
        project_id: newProject.id,
        track_index: clip.track_index,
        start_time: clip.start_time,
        duration: clip.duration,
        clip_type: clip.clip_type,
        source_url: clip.source_url,
        trim_start: clip.trim_start,
        trim_end: clip.trim_end,
        properties: clip.properties
      }));

      const { error: clipsError } = await supabase
        .from('timeline_clips')
        .insert(newClips);

      if (clipsError) throw clipsError;
    }

    return newProject as Project;
  },

  async getProjectClips(projectId: string): Promise<TimelineClip[]> {
    const { data, error } = await supabase
      .from('timeline_clips')
      .select('*')
      .eq('project_id', projectId)
      .order('track_index', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as TimelineClip[];
  },

  async addClipToProject(
    projectId: string,
    clip: Omit<TimelineClip, 'id' | 'project_id' | 'created_at'>
  ): Promise<TimelineClip> {
    const { data, error } = await supabase
      .from('timeline_clips')
      .insert({
        project_id: projectId,
        ...clip
      })
      .select()
      .single();

    if (error) throw error;
    return data as TimelineClip;
  },

  async updateClip(clipId: string, updates: Partial<TimelineClip>): Promise<TimelineClip> {
    const { data, error } = await supabase
      .from('timeline_clips')
      .update(updates)
      .eq('id', clipId)
      .select()
      .single();

    if (error) throw error;
    return data as TimelineClip;
  },

  async deleteClip(clipId: string): Promise<void> {
    const { error } = await supabase
      .from('timeline_clips')
      .delete()
      .eq('id', clipId);

    if (error) throw error;
  }
};