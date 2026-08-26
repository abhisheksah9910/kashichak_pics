import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, UploadCloud, MapPin, Camera, PenLine, Archive, Trophy } from 'lucide-react';
import api from '../services/api';
import PlaceCard from '../components/PlaceCard';
import MemoryCard from '../components/MemoryCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';

const steps = [
  { icon: MapPin, title: 'Find your place (जगह खोजें)', text: 'Search for your village, town, or landmark.' },
  { icon: Camera, title: 'Upload a memory (फोटो डालें)', text: 'Share a photo or video connected to it.' },
  { icon: PenLine, title: 'Share its story (कहानी बताएँ)', text: 'Tell us when it was taken and what it means.' },
  { icon: Archive, title: 'Preserve it forever (हमेशा के लिए संजोएँ)', text: 'It joins the place\'s living timeline.' },
];

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <>
      <span className="bg-gradient-to-r from-terracotta-400 via-orange-400 to-terracotta-500 bg-clip-text text-transparent py-2 leading-normal">
        {displayedText}
      </span>
      <motion.span 
        animate={{ opacity: [1, 0, 1] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="text-terracotta-500 font-light ml-1"
      >
        |
      </motion.span>
    </>
  );
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [places, setPlaces] = useState([]);
  const [memories, setMemories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHindi, setIsHindi] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsHindi((prev) => !prev);
    }, 4500); // Wait 4.5s so typing finishes
    return () => clearInterval(interval);
  }, []);

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
      <section className="relative overflow-hidden bg-ink-950 text-white">
        {/* Animated subtle background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-terracotta-600/30 blur-[100px]" />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-orange-600/20 blur-[120px]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:py-32 flex flex-col justify-center min-h-[350px]">
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-normal tracking-tight min-h-[120px] sm:min-h-[160px] flex items-center justify-center drop-shadow-xl">
            <TypewriterText text={!isHindi ? "Welcome to Apna Kashichak" : "अपना काशीचक में आपका स्वागत है"} />
          </h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/explore" className="btn-primary shadow-terracotta-600/20 shadow-lg"><Compass className="h-4 w-4" /> Explore (जगहें खोजें)</Link>
            <Link to="/upload" className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20"><UploadCloud className="h-4 w-4" /> Share Memory (यादें साझा करें)</Link>
          </motion.div>

          {/* Search */}
          <div className="relative mx-auto mt-12 max-w-xl">
            <div className="flex items-center gap-3 rounded-full border border-terracotta-200 dark:border-terracotta-800 bg-white dark:bg-ink-950/60 px-5 py-4 shadow-soft">
              <Search className="h-5 w-5 text-terracotta-400" />
              <input
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search your place (अपनी जगह खोजें)..."
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



      {/* Gaon Ki Khabar (Noticeboard) */}
      <section className="mx-auto max-w-5xl px-4 py-2 sm:px-6 mb-8 mt-2">
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-50 dark:from-terracotta-900/30 dark:to-orange-900/10 border border-orange-200 dark:border-terracotta-800 p-4 shadow-sm">
          <div className="shrink-0 rounded-full bg-orange-500 p-2 text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-orange-900 dark:text-orange-200">Gaon Ki Khabar (गाँव की ख़बर)</h3>
            <p className="mt-1 text-sm text-orange-800 dark:text-orange-300">
              Welcome to Apna Kashichak! A place to preserve our memories. <br className="hidden sm:block" /> 
              सभी ग्रामवासियों का 'अपना काशीचक' में स्वागत है। आइए अपनी पुरानी तस्वीरें साझा करें!
            </p>
          </div>
        </div>
      </section>

      {/* Popular places */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
      >
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
      </motion.section>

      {/* Featured memory */}
      {featured && (
        <section className="bg-terracotta-50/60 dark:bg-terracotta-950/10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-8 font-display text-2xl font-semibold sm:text-3xl">Featured Memory</h2>
            <div className="grid gap-8 overflow-hidden rounded-3xl bg-white dark:bg-ink-950 shadow-soft md:grid-cols-2">
              {featured.mediaType === 'video' ? (
                <div className="relative h-72 w-full md:h-full cursor-pointer group" onClick={() => navigate(`/places/${featured.place?.slug}`)}>
                  <video src={featured.mediaUrl} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <img src={featured.mediaUrl} alt={featured.caption} className="h-72 w-full object-cover md:h-full cursor-pointer" onClick={() => navigate(`/places/${featured.place?.slug}`)} />
              )}
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
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
      >
        <h2 className="mb-8 font-display text-2xl font-semibold sm:text-3xl">Latest Memories</h2>
        {loading ? (
          <GridSkeleton count={8} />
        ) : memories.length === 0 ? (
          <EmptyState title="No memories have been shared yet" message="Be the first to preserve one." />
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [column-fill:_balance]">
            {memories.map((m) => (
              <MemoryCard key={m._id} memory={m} onClick={() => navigate(`/places/${m.place?.slug}`)} />
            ))}
          </div>
        )}
      </motion.section>

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
