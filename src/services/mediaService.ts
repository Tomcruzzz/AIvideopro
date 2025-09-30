import { supabase } from '../lib/supabase';
import { MediaAsset, ClipType } from '../types';

export const mediaService = {
  async createMediaAsset(asset: {
    asset_type: ClipType;
    source: 'upload' | 'ai-generated' | 'rendered';
    url: string;
    thumbnail_url?: string;
    filename: string;
    duration?: number;
    metadata?: Record<string, any>;
    ai_job_id?: string;
  }): Promise<MediaAsset> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        user_id: user.id,
        ...asset
      })
      .select()
      .single();

    if (error) throw error;
    return data as MediaAsset;
  },

  async getUserAssets(): Promise<MediaAsset[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MediaAsset[];
  },

  async getAssetById(assetId: string): Promise<MediaAsset> {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', assetId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Asset not found');
    return data as MediaAsset;
  },

  async deleteAsset(assetId: string): Promise<void> {
    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', assetId);

    if (error) throw error;
  },

  async uploadFile(file: File, bucket: string = 'media'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
};