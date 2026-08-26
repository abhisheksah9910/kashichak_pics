import { useEffect, useState } from 'react';
import { Archive, Image as ImageIcon, Video } from 'lucide-react';
import api from '../services/api';
import MemoryCard from '../components/MemoryCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import Lightbox from '../components/Lightbox';
import toast from 'react-hot-toast';

export default function History() {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('photo');
  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  const handleLike = async (memoryId) => {
    if (!user) return toast.error('Please log in to like memories.');
    try {
      const res = await api.post(`/memories/${memoryId}/like`);
      setMemories((prev) => prev.map((m) => (m._id === memoryId ? { ...m, likeCount: res.data.data.likeCount } : m)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReport = async (memoryId) => {
    if (!user) return toast.error('Please log in to report content.');
    try {
      await api.post('/reports', { memoryId, reason: 'inappropriate' });
      toast.success('Reported. Our moderators will review it.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await api.delete(`/memories/${memoryId}`);
      toast.success('Memory deleted.');
      setMemories((prev) => prev.filter((m) => m._id !== memoryId));
      setLightboxIndex(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleEditMemory = async (memory) => {
    const newCaption = window.prompt('Enter new caption:', memory.caption);
    if (newCaption === null) return;
    const newStory = window.prompt('Enter new story (optional):', memory.story || '');
    if (newStory === null) return;

    try {
      const res = await api.put(`/memories/${memory._id}`, { caption: newCaption, story: newStory });
      toast.success('Memory updated.');
      setMemories((prev) => prev.map((m) => (m._id === memory._id ? { ...m, caption: newCaption, story: newStory } : m)));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const filteredMemories = memories.filter(m => filter === 'all' || (filter === 'photo' ? m.mediaType === 'photo' : m.mediaType === 'video'));

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
        ) : filteredMemories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredMemories.map((memory, idx) => (
              <div key={memory._id}>
                <MemoryCard memory={memory} onClick={() => setLightboxIndex(idx)} />
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

      {/* Lightbox */}
      {lightboxIndex !== null && filteredMemories[lightboxIndex] && (
        <Lightbox
          memory={filteredMemories[lightboxIndex]}
          currentUser={user}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i > 0 ? i - 1 : i))}
          onNext={() => setLightboxIndex((i) => (i < filteredMemories.length - 1 ? i + 1 : i))}
          onLike={() => handleLike(filteredMemories[lightboxIndex]._id)}
          onReport={() => handleReport(filteredMemories[lightboxIndex]._id)}
          onDelete={() => handleDeleteMemory(filteredMemories[lightboxIndex]._id)}
          onEdit={() => handleEditMemory(filteredMemories[lightboxIndex])}
        />
      )}
    </div>
  );
}
