import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Image, Video, Users, CalendarClock, X, Heart, Flag, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GridSkeleton, Spinner } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Lightbox from '../components/Lightbox';
import MemoryCard from '../components/MemoryCard';
import { getMediaUrl } from '../utils/mediaUtils';

export default function PlaceDetails() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [yearsCovered, setYearsCovered] = useState([]);
  const [memories, setMemories] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [tab, setTab] = useState('Photos');
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/places/${slug}`)
      .then((res) => {
        setPlace(res.data.data.place);
        setYearsCovered(res.data.data.yearsCovered);
      })
      .catch(() => setPlace(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!place) return;
    if (tab === 'Timeline') {
      api.get('/memories/timeline', { params: { place: slug } }).then((res) => setTimeline(res.data.data));
    } else {
      const type = tab === 'Photos' ? 'photo' : tab === 'Videos' ? 'video' : undefined;
      api.get('/memories', { params: { place: slug, type, limit: 40, sort: 'newest_captured' } }).then((res) => setMemories(res.data.data));
    }
  }, [place, tab, slug]);

  const handleLike = async (memoryId, idx) => {
    if (!user) return toast.error('Please log in to like memories.');
    try {
      const res = await api.post(`/memories/${memoryId}/like`);
      setMemories((prev) => prev.map((m, i) => (i === idx ? { ...m, likeCount: res.data.data.likeCount, isLiked: res.data.data.liked } : m)));
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

  const handleSetCover = async (mediaUrl) => {
    try {
      await api.put(`/places/${place._id}`, { coverImage: mediaUrl });
      toast.success('Place cover photo updated successfully.');
      setPlace({ ...place, coverImage: mediaUrl });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: place.name,
      text: `Check out memories of ${place.name} on Kashichak!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><GridSkeleton count={6} /></div>;
  if (!place) return <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6"><EmptyState title="Place not found" /></div>;

  return (
    <div>
      {/* Cover */}
      <div className="relative h-64 w-full md:h-96">
        {place.coverImage ? (
          <img src={getMediaUrl(place.coverImage)} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><MapPin className="h-16 w-16 text-terracotta-300" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-4 py-6 text-white sm:px-6">
          <p className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-4 w-4" /> {[place.area, place.district, place.state, place.country].filter(Boolean).join(' › ')}
          </p>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">{place.name}</h1>
            <button onClick={handleShare} className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm hover:bg-white/30 transition">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {place.description && <p className="max-w-3xl text-ink-950/70 dark:text-terracotta-50/70">{place.description}</p>}

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-ink-950/70 dark:text-terracotta-50/70">
          <span className="flex items-center gap-1.5"><Image className="h-4 w-4" /> {place.photoCount || 0} photos</span>
          <span className="flex items-center gap-1.5"><Video className="h-4 w-4" /> {place.videoCount || 0} videos</span>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {place.contributorCount || 0} contributors</span>
          {yearsCovered.length > 0 && (
            <span className="flex items-center gap-1.5"><CalendarClock className="h-4 w-4" /> {yearsCovered[yearsCovered.length - 1]}–{yearsCovered[0]}</span>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 border-b border-terracotta-100 dark:border-terracotta-900/40 pb-6">
          <button
            onClick={() => setTab('Photos')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === 'Photos' ? 'bg-terracotta-600 text-white' : 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300 dark:hover:bg-terracotta-900/60 hover:bg-terracotta-200'
            }`}
          >
            <Image className="h-4 w-4" /> Photos
          </button>
          <button
            onClick={() => setTab('Videos')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === 'Videos' ? 'bg-terracotta-600 text-white' : 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300 dark:hover:bg-terracotta-900/60 hover:bg-terracotta-200'
            }`}
          >
            <Video className="h-4 w-4" /> Videos
          </button>
          <button
            onClick={() => setTab('Timeline')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === 'Timeline' ? 'bg-terracotta-600 text-white' : 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300 dark:hover:bg-terracotta-900/60 hover:bg-terracotta-200'
            }`}
          >
            <CalendarClock className="h-4 w-4" /> Timeline
          </button>
        </div>

        <div className="mt-8">
          {tab === 'Timeline' ? (
            timeline.length === 0 ? (
              <EmptyState title="No timeline yet" message="Once memories are approved, they'll appear here year by year." />
            ) : (
              <div>
                <h2 className="mb-6 font-display text-xl font-semibold">See How This Place Changed Over Time</h2>
                <div className="space-y-10">
                  {timeline.map((group) => (
                    <div key={group._id} className="relative border-l-2 border-terracotta-200 dark:border-terracotta-800 pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-terracotta-600" />
                      <h3 className="font-display text-2xl font-semibold text-terracotta-700 dark:text-terracotta-300">{group._id}</h3>
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                        {group.memories.map((m) => (
                          <div key={m._id} className="relative group cursor-pointer" onClick={() => setLightboxMemory(m)}>
                            {m.mediaType === 'video' ? (
                              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/10">
                                <video src={getMediaUrl(m.thumbnailUrl || m.mediaUrl)} className="h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                <PlayCircle className="absolute inset-0 m-auto h-8 w-8 text-white drop-shadow-md" />
                              </div>
                            ) : (
                              <img src={getMediaUrl(m.thumbnailUrl || m.mediaUrl)} alt={m.caption} className="aspect-square w-full rounded-xl object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : memories.length === 0 ? (
            <EmptyState title="No memories have been shared from this place yet" message="Be the first to preserve one." action={<Link to="/upload" className="btn-primary">Share a Memory</Link>} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {memories.map((m, idx) => (
                <MemoryCard key={m._id} memory={m} onClick={() => setLightboxIndex(idx)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && memories[lightboxIndex] && (
        <Lightbox
          memory={memories[lightboxIndex]}
          currentUser={user}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i > 0 ? i - 1 : i))}
          onNext={() => setLightboxIndex((i) => (i < memories.length - 1 ? i + 1 : i))}
          onLike={() => handleLike(memories[lightboxIndex]._id, lightboxIndex)}
          onReport={() => handleReport(memories[lightboxIndex]._id)}
          onDelete={() => handleDeleteMemory(memories[lightboxIndex]._id)}
          onEdit={() => handleEditMemory(memories[lightboxIndex])}
          onSetCover={() => handleSetCover(memories[lightboxIndex].mediaUrl)}
        />
      )}
    </div>
  );
}


