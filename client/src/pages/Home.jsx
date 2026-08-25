import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Compass, UploadCloud, MapPin, Camera, PenLine, Archive, Trophy } from 'lucide-react';
import api from '../services/api';
import PlaceCard from '../components/PlaceCard';
import MemoryCard from '../components/MemoryCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';

const steps = [
  { icon: MapPin, title: 'Find your place', text: 'Search for your village, town, or landmark.' },
  { icon: Camera, title: 'Upload a memory', text: 'Share a photo or video connected to it.' },
  { icon: PenLine, title: 'Share its story', text: 'Tell us when it was taken and what it means.' },
  { icon: Archive, title: 'Preserve it forever', text: 'It joins the place\'s living timeline.' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [places, setPlaces] = useState([]);
  const [memories, setMemories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get('/places', { params: { sort: 'most_memories', limit: 6 } }),
      api.get('/memories', { params: { sort: 'newest', limit: 8 } }),
      api.get('/users/leaderboard'),
    ]).then(([placesRes, memoriesRes, leaderboardRes]) => {
      if (placesRes.status === 'fulfilled') setPlaces(placesRes.value.data.data);
      if (memoriesRes.status === 'fulfilled') {
        const list = memoriesRes.value.data.data;
        setMemories(list);
        setFeatured(list.find((m) => m.isFeatured) || list[0] || null);
      }
      if (leaderboardRes.status === 'fulfilled') setLeaderboard(leaderboardRes.value.data.data);
      setLoading(false);
    });
  }, []);

  const handleSearchChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) return setSuggestions([]);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/places/search-suggestions', { params: { q: val } });
        setSuggestions(res.data.data);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const goToPlace = (slug) => navigate(`/places/${slug}`);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-terracotta-50 to-white dark:from-ink-950 dark:to-ink-950">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Every Place Has a Story.
            <br />
            <span className="text-terracotta-600 dark:text-terracotta-400">Every Memory Belongs Somewhere.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-ink-950/70 dark:text-terracotta-50/70 sm:text-lg">
            Apna Kashichak is a community archive where people preserve photos and videos of the villages,
            towns, and landmarks they call home — starting with Kashichak and growing across India.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/explore" className="btn-primary"><Compass className="h-4 w-4" /> Explore Places</Link>
            <Link to="/upload" className="btn-secondary"><UploadCloud className="h-4 w-4" /> Share a Memory</Link>
          </div>

          {/* Search */}
          <div className="relative mx-auto mt-12 max-w-xl">
            <div className="flex items-center gap-3 rounded-full border border-terracotta-200 dark:border-terracotta-800 bg-white dark:bg-ink-950/60 px-5 py-4 shadow-soft">
              <Search className="h-5 w-5 text-terracotta-400" />
              <input
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search your place..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-950/40 dark:placeholder:text-terracotta-50/40"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-terracotta-100 dark:border-terracotta-900/50 bg-white dark:bg-ink-950 text-left shadow-soft">
                {suggestions.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => goToPlace(s.slug)}
                    className="flex w-full items-center gap-2 px-5 py-3 text-sm hover:bg-terracotta-50 dark:hover:bg-terracotta-900/30"
                  >
                    <MapPin className="h-4 w-4 text-terracotta-400" />
                    <span>{s.name}</span>
                    <span className="ml-auto text-xs text-ink-950/40 dark:text-terracotta-50/40">
                      {[s.area, s.district, s.state].filter(Boolean).join(', ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular places */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Popular Places</h2>
          <Link to="/explore" className="text-sm font-medium text-terracotta-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <GridSkeleton count={6} />
        ) : places.length === 0 ? (
          <EmptyState title="No places yet" message="Be the first to add a place and start preserving its memories." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p) => <PlaceCard key={p._id} place={p} />)}
          </div>
        )}
      </section>

      {/* Featured memory */}
      {featured && (
        <section className="bg-terracotta-50/60 dark:bg-terracotta-950/10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-8 font-display text-2xl font-semibold sm:text-3xl">Featured Memory</h2>
            <div className="grid gap-8 overflow-hidden rounded-3xl bg-white dark:bg-ink-950 shadow-soft md:grid-cols-2">
              <img src={featured.mediaUrl} alt={featured.caption} className="h-72 w-full object-cover md:h-full" />
              <div className="flex flex-col justify-center p-8">
                <p className="text-xs font-medium uppercase tracking-wide text-terracotta-600">
                  {featured.place?.name}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">{featured.caption}</h3>
                <p className="mt-4 text-sm text-ink-950/70 dark:text-terracotta-50/70">{featured.story}</p>
                <p className="mt-6 text-xs text-ink-950/50 dark:text-terracotta-50/50">
                  Shared by {featured.uploader?.name} · Captured {new Date(featured.dateCaptured).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest memories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 font-display text-2xl font-semibold sm:text-3xl">Latest Memories</h2>
        {loading ? (
          <GridSkeleton count={8} />
        ) : memories.length === 0 ? (
          <EmptyState title="No memories have been shared yet" message="Be the first to preserve one." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {memories.map((m) => (
              <MemoryCard key={m._id} memory={m} onClick={() => navigate(`/places/${m.place?.slug}`)} />
            ))}
          </div>
        )}
      </section>

      {/* Top Contributors */}
      <section className="bg-terracotta-50/30 dark:bg-terracotta-950/5 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-terracotta-500" />
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Top Contributors</h2>
          </div>
          {loading ? (
            <GridSkeleton count={4} />
          ) : leaderboard.length === 0 ? (
            <EmptyState title="No contributors yet" message="Start sharing memories to appear here." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {leaderboard.map((user, index) => (
                <Link key={user._id} to={`/profile/${user._id}`} className="card flex items-center gap-4 p-4 hover:border-terracotta-300 transition">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-terracotta-200 dark:bg-terracotta-800 flex items-center justify-center overflow-hidden">
                      {user.user.profileImage ? (
                        <img src={user.user.profileImage} alt={user.user.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display text-lg text-terracotta-700 dark:text-terracotta-300">
                          {user.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-terracotta-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-ink-950">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm line-clamp-1">{user.user.name}</p>
                    <p className="text-xs text-ink-950/60 dark:text-terracotta-50/60 mt-0.5">
                      {user.memoryCount} memories · {user.totalLikes} likes
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-terracotta-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">How It Works</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-800">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-medium text-terracotta-300">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-terracotta-100/70">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
