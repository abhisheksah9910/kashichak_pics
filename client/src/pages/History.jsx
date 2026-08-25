import { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import api from '../services/api';
import MemoryCard from '../components/MemoryCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function History() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

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
        {loading ? (
          <GridSkeleton count={6} />
        ) : memories.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>div:not(:first-child)]:mt-4">
            {memories.map((memory) => (
              <div key={memory._id} className="break-inside-avoid">
                <MemoryCard memory={memory} />
              </div>
            ))}
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
