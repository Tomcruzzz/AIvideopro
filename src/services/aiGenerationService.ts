import { supabase } from '../lib/supabase';
import { AIProvider, JobType, AIGenerationJob } from '../types';

interface GenerateVideoParams {
  provider: AIProvider;
  jobType: JobType;
  prompt: string;
  sourceImageUrl?: string;
  parameters?: {
    duration?: number;
    aspect_ratio?: string;
    style?: string;
    model?: string;
  };
  projectId?: string;
}

export const aiGenerationService = {
  async createGenerationJob(params: GenerateVideoParams): Promise<AIGenerationJob> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('ai_generation_jobs')
      .insert({
        user_id: user.id,
        provider: params.provider,
        job_type: params.jobType,
        prompt: params.prompt,
        source_image_url: params.sourceImageUrl,
        parameters: params.parameters || {},
        project_id: params.projectId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data as AIGenerationJob;
  },

  async getUserJobs(limit: number = 50): Promise<AIGenerationJob[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('ai_generation_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AIGenerationJob[];
  },

  async getJobById(jobId: string): Promise<AIGenerationJob> {
    const { data, error } = await supabase
      .from('ai_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Job not found');
    return data as AIGenerationJob;
  },

  async updateJobStatus(
    jobId: string,
    status: string,
    resultUrl?: string,
    errorMessage?: string
  ): Promise<void> {
    const updates: any = {
      status,
      ...(resultUrl && { result_url: resultUrl }),
      ...(errorMessage && { error_message: errorMessage }),
      ...(status === 'completed' || status === 'failed' ? { completed_at: new Date().toISOString() } : {})
    };

    const { error } = await supabase
      .from('ai_generation_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  },

  async pollJobStatus(jobId: string): Promise<AIGenerationJob> {
    return this.getJobById(jobId);
  },

  async deleteJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_generation_jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  }
};