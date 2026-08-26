import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, UploadCloud, MapPin, Camera, PenLine, Archive, Trophy } from 'lucide-react';
import api from '../services/api';
import PlaceCard from '../components/PlaceCard';
import MemoryCard from '../components/MemoryCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import AdBanner from '../components/AdBanner';

const TypewriterText = ({ texts, typingSpeed = 80, deletingSpeed = 40, pause = 2500 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    let timer;
    const current = loopNum % texts.length;
    const fullText = texts[current];

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, displayedText.length - 1));
      }, deletingSpeed);
    } else {
      timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
      }, typingSpeed);
    }

    if (!isDeleting && displayedText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, loopNum, texts, typingSpeed, deletingSpeed, pause]);

  return (
    <>
      <span className="font-mono bg-gradient-to-r from-terracotta-400 via-orange-400 to-terracotta-500 bg-clip-text text-transparent py-2 leading-normal">
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

const AnimatedDivider = () => (
  <div className="flex justify-center w-full my-4 opacity-60">
    <div className="h-[2px] w-full max-w-5xl bg-gradient-to-r from-transparent via-terracotta-500/50 to-transparent relative overflow-hidden">
      <motion.div
        animate={{ x: ["-100%", "300%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-80"
      />
    </div>
  </div>
);

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [memories, setMemories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-normal tracking-tight min-h-[120px] sm:min-h-[160px] flex items-center justify-center drop-shadow-xl">
            <TypewriterText texts={["Welcome to Apna Kashichak", "अपना काशीचक में आपका स्वागत है"]} />
          </h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/explore" className="btn-primary shadow-terracotta-600/20 shadow-lg"><Compass className="h-4 w-4" /> Explore</Link>
            <Link to="/upload" className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20"><UploadCloud className="h-4 w-4" /> Share Memory</Link>
          </motion.div>
        </div>
      </section>

      <AnimatedDivider />

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

      <AnimatedDivider />

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

      <AnimatedDivider />

      {/* Ad Placement */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AdBanner type="horizontal" slotId="home_middle" />
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

    </div>
  );
}
