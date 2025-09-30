import { useRef, useEffect, useState } from 'react';
import { TimelineClip } from '../../types';

interface VideoPlayerProps {
  clips: TimelineClip[];
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ clips, currentTime, isPlaying, onTimeUpdate }: VideoPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoElements, setVideoElements] = useState<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    const newVideoElements = new Map<string, HTMLVideoElement>();

    clips.forEach(clip => {
      if (clip.clip_type === 'video' && !videoElements.has(clip.id)) {
        const video = document.createElement('video');
        video.src = clip.source_url;
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        newVideoElements.set(clip.id, video);
      }
    });

    setVideoElements(prev => new Map([...prev, ...newVideoElements]));

    return () => {
      newVideoElements.forEach(video => {
        video.src = '';
      });
    };
  }, [clips]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const activeClips = clips.filter(clip => {
      return currentTime >= clip.start_time && currentTime < clip.start_time + clip.duration;
    });

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    activeClips.sort((a, b) => a.track_index - b.track_index);

    activeClips.forEach(clip => {
      const clipLocalTime = currentTime - clip.start_time + clip.trim_start;

      if (clip.clip_type === 'video') {
        const video = videoElements.get(clip.id);
        if (video) {
          video.currentTime = clipLocalTime / 1000;

          try {
            const opacity = clip.properties.opacity ?? 1;
            ctx.globalAlpha = opacity;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
          } catch (e) {
            console.error('Error drawing video frame:', e);
          }
        }
      } else if (clip.clip_type === 'image') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = clip.source_url;
        img.onload = () => {
          const opacity = clip.properties.opacity ?? 1;
          ctx.globalAlpha = opacity;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
        };
      }
    });

    if (activeClips.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No clips at current time', canvas.width / 2, canvas.height / 2);
    }
  }, [currentTime, clips, videoElements]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950">
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="max-w-full max-h-full"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  );
}