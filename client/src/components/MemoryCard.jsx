import { PlayCircle, Heart, Share2 } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaUtils';

export default function MemoryCard({ memory, onClick }) {
  return (
    <button onClick={onClick} className="card group relative flex flex-col h-full w-full overflow-hidden text-left">
      <div className="relative w-full aspect-square sm:aspect-[4/3] shrink-0 overflow-hidden bg-terracotta-100 dark:bg-terracotta-900/30">
        <img
          src={getMediaUrl(memory.thumbnailUrl || memory.mediaUrl)}
          alt={memory.caption}
          loading="lazy"
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        {memory.mediaType === 'video' && (
          <PlayCircle className="absolute inset-0 m-auto h-10 w-10 text-white drop-shadow-lg" />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="line-clamp-2 text-sm font-medium">{memory.caption}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-ink-950/50 dark:text-terracotta-50/50">
          <span>{memory.uploader?.name || 'Anonymous'}</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: memory.caption,
                    text: `Check out this memory from ${memory.place?.name || 'Kashichak'}: ${memory.caption}`,
                    url: window.location.origin + `/places/${memory.place?.slug || ''}`
                  }).catch(() => {});
                } else {
                  // Fallback for desktop browsers without Web Share API
                  navigator.clipboard.writeText(window.location.origin + `/places/${memory.place?.slug || ''}`);
                  // You might want to use a toast here if available, but simplest fallback is alert or nothing
                }
              }}
              className="flex items-center gap-1 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors"
              aria-label="Share memory"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <span className="flex items-center gap-1">
              <Heart className={`h-3.5 w-3.5 ${memory.isLiked ? 'fill-red-500 text-red-500' : ''}`} /> {memory.likeCount || 0}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
