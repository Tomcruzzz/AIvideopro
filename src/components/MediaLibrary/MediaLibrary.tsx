import { useState, useEffect } from 'react';
import { MediaAsset } from '../../types';
import { mediaService } from '../../services/mediaService';
import { X, Plus, Loader2, Video, Image as ImageIcon, Music } from 'lucide-react';

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: MediaAsset) => void;
}

export function MediaLibrary({ isOpen, onClose, onSelectAsset }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'video' | 'image' | 'audio'>('all');

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    try {
      const data = await mediaService.getUserAssets();
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = filter === 'all'
    ? assets
    : assets.filter(asset => asset.asset_type === filter);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return ImageIcon;
      case 'audio': return Music;
      default: return Video;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Media Library</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 border-b border-slate-700">
          <div className="flex gap-2">
            {(['all', 'video', 'image', 'audio'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  filter === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No media assets</h3>
              <p className="text-slate-400">Generate videos with AI to populate your library</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAssets.map(asset => {
                const Icon = getAssetIcon(asset.asset_type);
                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      onSelectAsset(asset);
                      onClose();
                    }}
                    className="group bg-slate-700 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
                  >
                    <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
                      {asset.thumbnail_url ? (
                        <img
                          src={asset.thumbnail_url}
                          alt={asset.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon className="w-8 h-8 text-slate-500" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-white truncate">{asset.filename}</p>
                      {asset.duration && (
                        <p className="text-xs text-slate-400 mt-1">
                          {Math.round(asset.duration / 1000)}s
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}