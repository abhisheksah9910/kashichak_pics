import { PlayCircle, Heart } from 'lucide-react';

export default function MemoryCard({ memory, onClick }) {
  return (
    <button onClick={onClick} className="card group relative block w-full break-inside-avoid mb-4 overflow-hidden text-left">
      <div className="relative w-full overflow-hidden bg-terracotta-100 dark:bg-terracotta-900/30">
        <img
          src={memory.thumbnailUrl || memory.mediaUrl}
          alt={memory.caption}
          loading="lazy"
          className="w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {memory.mediaType === 'video' && (
          <PlayCircle className="absolute inset-0 m-auto h-10 w-10 text-white drop-shadow-lg" />
        )}
      </div>
      <div className="p-4">
        <p className="line-clamp-2 text-sm font-medium">{memory.caption}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-ink-950/50 dark:text-terracotta-50/50">
          <span>{memory.uploader?.name || 'Anonymous'}</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" /> {memory.likeCount || 0}
          </span>
        </div>
      </div>
    </button>
  );
}
