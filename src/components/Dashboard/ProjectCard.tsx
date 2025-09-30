import { Project } from '../../types';
import { Clock, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onDuplicate: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onOpen, onDuplicate, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="group bg-slate-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
      onClick={() => onOpen(project.id)}
    >
      <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-slate-500 text-sm">No preview</div>
        )}

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(project.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{project.name}</h3>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(project.updated_at)}
          </span>
          <span>{project.resolution}</span>
          <span>{project.fps} fps</span>
        </div>
      </div>
    </div>
  );
}