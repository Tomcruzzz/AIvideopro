import { AIProvider, JobType } from '../types';

export interface MockGenerationParams {
  provider: AIProvider;
  jobType: JobType;
  prompt: string;
  sourceImageUrl?: string;
  parameters?: {
    duration?: number;
    aspect_ratio?: string;
  };
}

const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
];

export const mockAIProvider = {
  async generateVideo(params: MockGenerationParams): Promise<{ jobId: string; status: string }> {
    console.log('Mock AI Generation:', params);

    const jobId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setTimeout(() => {
      console.log(`Mock job ${jobId} completed`);
    }, 3000);

    return {
      jobId,
      status: 'pending'
    };
  },

  async checkJobStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    resultUrl?: string;
    errorMessage?: string;
  }> {
    const randomVideo = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];

    return {
      status: 'completed',
      resultUrl: randomVideo
    };
  },

  async simulateGeneration(jobId: string, onComplete: (resultUrl: string) => void) {
    setTimeout(() => {
      const randomVideo = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
      onComplete(randomVideo);
    }, 5000);
  }
};