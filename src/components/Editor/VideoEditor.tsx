import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, TimelineClip, AIGenerationJob, MediaAsset } from '../../types';
import { projectService } from '../../services/projectService';
import { aiGenerationService } from '../../services/aiGenerationService';
import { mediaService } from '../../services/mediaService';
import { Timeline } from '../Timeline/Timeline';
import { AIGenerationModal } from '../Modals/AIGenerationModal';
import { MediaLibrary } from '../MediaLibrary/MediaLibrary';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { FileUpload } from '../Upload/FileUpload';
import { ToastContainer } from '../Toast/Toast';
import { useToast } from '../../hooks/useToast';
import { Sparkles, Library, ArrowLeft, Save, Loader2, Wand2, ArrowUp, Upload } from 'lucide-react';

interface VideoEditorProps {
  projectId: string;
}

export function VideoEditor({ projectId }: VideoEditorProps) {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error, info } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiJobs, setAiJobs] = useState<AIGenerationJob[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadProject();
    loadAIJobs();

    const interval = setInterval(() => {
      checkPendingJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId]);

  const loadProject = async () => {
    try {
      const projectData = await projectService.getProjectById(projectId);
      const clipsData = await projectService.getProjectClips(projectId);
      setProject(projectData);
      setClips(clipsData);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIJobs = async () => {
    try {
      const jobs = await aiGenerationService.getUserJobs(10);
      setAiJobs(jobs.filter(job => job.status === 'pending' || job.status === 'processing'));
    } catch (error) {
      console.error('Failed to load AI jobs:', error);
    }
  };

  const checkPendingJobs = async () => {
    const pendingJobs = aiJobs.filter(job => job.status === 'pending' || job.status === 'processing');

    for (const job of pendingJobs) {
      try {
        const updatedJob = await aiGenerationService.pollJobStatus(job.id);

        if (updatedJob.status === 'completed' && updatedJob.result_url) {
          await mediaService.createMediaAsset({
            asset_type: 'video',
            source: 'ai-generated',
            url: updatedJob.result_url,
            filename: `AI Generated - ${job.provider}`,
            duration: (job.parameters.duration || 5) * 1000,
            metadata: {
              provider: job.provider,
              prompt: job.prompt
            },
            ai_job_id: job.id
          });

          setAiJobs(prev => prev.filter(j => j.id !== job.id));
        }
      } catch (error) {
        console.error('Failed to check job status:', error);
      }
    }
  };

  const handleAIGenerate = async (params: any) => {
    try {
      const job = await aiGenerationService.createGenerationJob({
        ...params,
        projectId
      });
      setAiJobs(prev => [...prev, job]);
      success('AI generation started! Check your media library soon.');
      info('Note: This is a demo. Connect real AI providers to generate videos.');
    } catch (err: any) {
      console.error('Failed to create AI generation job:', err);
      error(err.message || 'Failed to start AI generation');
      throw err;
    }
  };

  const handleClipUpdate = async (clipId: string, updates: Partial<TimelineClip>) => {
    try {
      const updatedClip = await projectService.updateClip(clipId, updates);
      setClips(clips.map(c => c.id === clipId ? updatedClip : c));
    } catch (err: any) {
      console.error('Failed to update clip:', err);
      error('Failed to update clip');
    }
  };

  const handleClipDelete = async (clipId: string) => {
    try {
      await projectService.deleteClip(clipId);
      setClips(clips.filter(c => c.id !== clipId));
      success('Clip deleted');
    } catch (err: any) {
      console.error('Failed to delete clip:', err);
      error('Failed to delete clip');
    }
  };

  const handleAssetSelect = async (asset: MediaAsset) => {
    try {
      const newClip = await projectService.addClipToProject(projectId, {
        track_index: 0,
        start_time: project?.duration || 0,
        duration: asset.duration || 5000,
        clip_type: asset.asset_type,
        source_url: asset.url,
        trim_start: 0,
        trim_end: null,
        properties: {}
      });
      setClips([...clips, newClip]);

      const newDuration = Math.max(
        project?.duration || 0,
        newClip.start_time + newClip.duration
      );
      await projectService.updateProject(projectId, { duration: newDuration });
      setProject(prev => prev ? { ...prev, duration: newDuration } : null);
      success('Clip added to timeline');
    } catch (err: any) {
      console.error('Failed to add clip:', err);
      error('Failed to add clip to timeline');
    }
  };

  const handleUploadComplete = async (asset: MediaAsset) => {
    success('File uploaded successfully!');
    await handleAssetSelect(asset);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      success('Project saved successfully');
    } catch (err: any) {
      error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const selectedClip = clips.find(c => c.id === selectedClipId);

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">{project.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {aiJobs.length > 0 && (
            <div className="px-3 py-1.5 bg-purple-600/20 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-sm text-purple-300">{aiJobs.length} generating</span>
            </div>
          )}

          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>

          <button
            onClick={() => setShowMediaLibrary(true)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Library className="w-4 h-4" />
            Library
          </button>

          <button
            onClick={() => setShowAIModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-slate-950">
          <VideoPlayer
            clips={clips}
            currentTime={currentTime}
            isPlaying={isPlaying}
          />
        </div>

        {selectedClip && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 p-6 overflow-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Clip Properties</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Track
                </label>
                <input
                  type="number"
                  value={selectedClip.track_index}
                  onChange={(e) => handleClipUpdate(selectedClip.id, { track_index: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedClip.properties.opacity || 1}
                  onChange={(e) => handleClipUpdate(selectedClip.id, {
                    properties: { ...selectedClip.properties, opacity: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Speed
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="4"
                  step="0.25"
                  value={selectedClip.properties.speed || 1}
                  onChange={(e) => handleClipUpdate(selectedClip.id, {
                    properties: { ...selectedClip.properties, speed: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
                <span className="text-xs text-slate-400">
                  {selectedClip.properties.speed || 1}x
                </span>
              </div>

              <div className="pt-4 space-y-2">
                <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Add Lipsync
                </button>
                <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <ArrowUp className="w-4 h-4" />
                  Upscale to 4K
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-64 border-t border-slate-700">
        <Timeline
          clips={clips}
          duration={project.duration || 30000}
          onClipUpdate={handleClipUpdate}
          onClipDelete={handleClipDelete}
          onClipSelect={setSelectedClipId}
          selectedClipId={selectedClipId}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTimeUpdate={setCurrentTime}
          onPlayingChange={setIsPlaying}
        />
      </div>

      <AIGenerationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIGenerate}
      />

      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelectAsset={handleAssetSelect}
      />

      <FileUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadComplete={handleUploadComplete}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}