import { useCallback, useState } from 'react';
import { Upload, X, FileVideo, Image as ImageIcon, Music, Loader2 } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { MediaAsset, ClipType } from '../../types';

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (asset: MediaAsset) => void;
}

export function FileUpload({ isOpen, onClose, onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const getAssetType = (fileType: string): ClipType => {
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('audio/')) return 'audio';
    return 'video';
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration * 1000);
      };
      video.onerror = () => resolve(5000);
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const url = await mediaService.uploadFile(file, 'media');

      clearInterval(progressInterval);
      setProgress(95);

      let duration = null;
      if (file.type.startsWith('video/')) {
        duration = await getVideoDuration(file);
      }

      const assetType = getAssetType(file.type);
      const asset = await mediaService.createMediaAsset({
        asset_type: assetType,
        source: 'upload',
        url,
        filename: file.name,
        duration,
        metadata: {
          size: file.size,
          format: file.type
        }
      });

      setProgress(100);
      onUploadComplete(asset);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Upload Media</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            className={`border-2 border-dashed rounded-xl p-12 transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <input
              type="file"
              id="file-input"
              accept="video/*,image/*,audio/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={uploading}
            />

            {uploading ? (
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Uploading...</p>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-400">{progress}%</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drop your files here
                </h3>
                <p className="text-slate-400 mb-6">
                  or click to browse from your device
                </p>

                <label
                  htmlFor="file-input"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all cursor-pointer"
                >
                  Choose File
                </label>

                <div className="mt-8 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileVideo className="w-5 h-5" />
                    <span className="text-sm">Video</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Image</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Music className="w-5 h-5" />
                    <span className="text-sm">Audio</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-400 mt-4 text-center">
            Supported formats: MP4, MOV, AVI, PNG, JPG, GIF, MP3, WAV
          </p>
        </div>
      </div>
    </div>
  );
}