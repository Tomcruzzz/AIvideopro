import { supabase } from '../lib/supabase';
import { ProcessingJob, ProcessingJobType } from '../types';

export const processingService = {
  async createProcessingJob(params: {
    job_type: ProcessingJobType;
    source_clip_id?: string;
    project_id?: string;
    parameters?: Record<string, any>;
  }): Promise<ProcessingJob> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('processing_jobs')
      .insert({
        user_id: user.id,
        ...params,
        status: 'pending',
        progress: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as ProcessingJob;
  },

  async getUserJobs(limit: number = 50): Promise<ProcessingJob[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ProcessingJob[];
  },

  async getJobById(jobId: string): Promise<ProcessingJob> {
    const { data, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Job not found');
    return data as ProcessingJob;
  },

  async updateJobProgress(jobId: string, progress: number): Promise<void> {
    const { error } = await supabase
      .from('processing_jobs')
      .update({ progress })
      .eq('id', jobId);

    if (error) throw error;
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
      .from('processing_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  },

  async deleteJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('processing_jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  }
};