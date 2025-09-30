import { useRef, useState, useEffect } from 'react';
import { TimelineClip } from '../../types';
import { Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut } from 'lucide-react';

interface TimelineProps {
  clips: TimelineClip[];
  duration: number;
  onClipUpdate: (clipId: string, updates: Partial<TimelineClip>) => void;
  onClipDelete: (clipId: string) => void;
  onClipSelect: (clipId: string | null) => void;
  selectedClipId: string | null;
  currentTime?: number;
  isPlaying?: boolean;
  onTimeUpdate?: (time: number) => void;
  onPlayingChange?: (playing: boolean) => void;
}

export function Timeline({
  clips,
  duration,
  onClipUpdate,
  onClipDelete,
  onClipSelect,
  selectedClipId,
  currentTime: externalCurrentTime,
  isPlaying: externalIsPlaying,
  onTimeUpdate,
  onPlayingChange
}: TimelineProps) {
  const [internalCurrentTime, setInternalCurrentTime] = useState(0);
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);

  const currentTime = externalCurrentTime !== undefined ? externalCurrentTime : internalCurrentTime;
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;

  const setCurrentTime = (time: number | ((prev: number) => number)) => {
    const newTime = typeof time === 'function' ? time(currentTime) : time;
    if (onTimeUpdate) {
      onTimeUpdate(newTime);
    } else {
      setInternalCurrentTime(newTime);
    }
  };

  const setIsPlaying = (playing: boolean) => {
    if (onPlayingChange) {
      onPlayingChange(playing);
    } else {
      setInternalIsPlaying(playing);
    }
  };
  const [zoom, setZoom] = useState(1);
  const [draggedClip, setDraggedClip] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const timeToPixel = (time: number) => (time / 1000) * 100 * zoom;
  const pixelToTime = (pixel: number) => (pixel / (100 * zoom)) * 1000;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 33;
        if (next >= duration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 33);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 1000));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 1000));
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = pixelToTime(x);
    setCurrentTime(Math.max(0, Math.min(duration, time)));
  };

  const handleClipDragStart = (clipId: string) => {
    setDraggedClip(clipId);
  };

  const handleClipDrag = (e: React.MouseEvent, clipId: string) => {
    if (!draggedClip) return;

    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const newStartTime = Math.max(0, pixelToTime(x));

    onClipUpdate(clipId, { start_time: Math.round(newStartTime) });
  };

  const handleClipDragEnd = () => {
    setDraggedClip(null);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const tracks = Array.from(new Set(clips.map(c => c.track_index))).sort((a, b) => b - a);
  if (tracks.length === 0) tracks.push(0);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSkipBack}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
          >
            <SkipBack className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={handleSkipForward}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
          >
            <SkipForward className="w-5 h-5 text-white" />
          </button>
          <span className="ml-4 text-sm font-mono text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <span className="text-sm text-white">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(4, zoom + 0.25))}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="relative min-w-full" ref={timelineRef}>
          <div className="flex border-b border-slate-700">
            <div className="w-20 flex-shrink-0 bg-slate-800 border-r border-slate-700"></div>
            <div className="flex-1 relative h-10 bg-slate-800" onClick={handleTimelineClick}>
              {Array.from({ length: Math.ceil(duration / 1000) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-slate-600"
                  style={{ left: `${timeToPixel(i * 1000)}px` }}
                >
                  <span className="absolute top-1 left-1 text-xs text-slate-400">
                    {i}s
                  </span>
                </div>
              ))}
            </div>
          </div>

          {tracks.map(trackIndex => (
            <div key={trackIndex} className="flex border-b border-slate-700">
              <div className="w-20 flex-shrink-0 bg-slate-800 border-r border-slate-700 p-2">
                <span className="text-xs text-slate-400">Track {trackIndex + 1}</span>
              </div>
              <div className="flex-1 relative h-16 bg-slate-850">
                {clips
                  .filter(clip => clip.track_index === trackIndex)
                  .map(clip => (
                    <div
                      key={clip.id}
                      className={`absolute top-1 bottom-1 rounded cursor-move transition-all ${
                        selectedClipId === clip.id
                          ? 'ring-2 ring-blue-500'
                          : 'hover:ring-2 hover:ring-blue-400'
                      } ${
                        clip.clip_type === 'video'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500'
                          : clip.clip_type === 'image'
                          ? 'bg-gradient-to-r from-green-600 to-green-500'
                          : 'bg-gradient-to-r from-yellow-600 to-yellow-500'
                      }`}
                      style={{
                        left: `${timeToPixel(clip.start_time)}px`,
                        width: `${timeToPixel(clip.duration)}px`
                      }}
                      onMouseDown={() => {
                        onClipSelect(clip.id);
                        handleClipDragStart(clip.id);
                      }}
                      onMouseMove={(e) => handleClipDrag(e, clip.id)}
                      onMouseUp={handleClipDragEnd}
                    >
                      <div className="h-full px-2 py-1 flex flex-col justify-center overflow-hidden">
                        <span className="text-xs text-white font-medium truncate">
                          {clip.source_url.split('/').pop()?.substring(0, 20)}
                        </span>
                        <span className="text-xs text-white/70">
                          {formatTime(clip.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
            style={{ left: `${timeToPixel(currentTime) + 80}px` }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}