import { useEffect, useState } from 'react';
import { Archive, Image as ImageIcon, Video } from 'lucide-react';
import api from '../services/api';
import MemoryCard from '../components/MemoryCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function History() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('photo');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/memories', { params: { label: 'historical', limit: 50, sort: 'newest_captured' } });
        setMemories(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <div className="bg-ink-950 text-white pb-12 pt-16 px-4 border-b border-ink-900">
        <div className="mx-auto max-w-7xl text-center">
          <Archive className="mx-auto h-12 w-12 text-terracotta-400 mb-4" />
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">इतिहास के पन्नों से</h1>
          <p className="mt-4 text-ink-300 max-w-2xl mx-auto">
            A dedicated archive of old photos and videos that capture the essence of Kashichak from days gone by. 
            <span className="block mt-1 font-serif italic">"वक्त बदल गया, पर यादें आज भी वहीं खड़ी हैं।"</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setFilter('photo')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition ${
              filter === 'photo' ? 'bg-terracotta-600 text-white' : 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300 dark:hover:bg-terracotta-900/60 hover:bg-terracotta-200'
            }`}
          >
            <ImageIcon className="h-4 w-4" /> Photos
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition ${
              filter === 'video' ? 'bg-terracotta-600 text-white' : 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300 dark:hover:bg-terracotta-900/60 hover:bg-terracotta-200'
            }`}
          >
            <Video className="h-4 w-4" /> Videos
          </button>
        </div>

        {loading ? (
          <GridSkeleton count={6} />
        ) : memories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {memories
              .filter(m => filter === 'all' || (filter === 'photo' ? m.mediaType === 'photo' : m.mediaType === 'video'))
              .map((memory) => (
              <div key={memory._id}>
                <MemoryCard memory={memory} />
              </div>
            ))}
            {memories.filter(m => filter === 'all' || (filter === 'photo' ? m.mediaType === 'photo' : m.mediaType === 'video')).length === 0 && (
              <div className="col-span-full py-12 text-center text-ink-950/50 dark:text-terracotta-50/50">
                No {filter}s found.
              </div>
            )}
          </div>
        ) : (
          <EmptyState 
            icon={Archive}
            title="The archive is empty" 
            message="No historical photos have been uploaded yet." 
          />
        )}
      </div>
    </div>
  );
}
