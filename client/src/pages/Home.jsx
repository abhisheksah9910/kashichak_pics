import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, UploadCloud, MapPin, Camera, PenLine, Archive, Trophy, Download, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import PlaceCard from '../components/PlaceCard';
import MemoryCard from '../components/MemoryCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import AdBanner from '../components/AdBanner';



export default function Home() {
  const [places, setPlaces] = useState([]);
  const [memories, setMemories] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [featuredReel, setFeaturedReel] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      );
    };
    setIsStandalone(checkStandalone());

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast('Install not ready! Please use the browser menu (3 dots) -> "Install App" or refresh the page.', { icon: 'ℹ️', duration: 5000 });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get('/places', { params: { sort: 'most_memories', limit: 6 } }),
      api.get('/memories', { params: { sort: 'newest', limit: 8 } }),
      api.get('/settings/featured_reel').catch(() => null),
    ]).then(([placesRes, memoriesRes, reelRes]) => {
      if (placesRes.status === 'fulfilled') setPlaces(placesRes.value.data.data);
      if (memoriesRes.status === 'fulfilled') {
        const list = memoriesRes.value.data.data;
        setMemories(list);
        setFeatured(list.find((m) => m.isFeatured) || list[0] || null);
      }
      if (reelRes.status === 'fulfilled' && reelRes.value?.data?.data) {
        setFeaturedReel(reelRes.value.data.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink-950 text-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4 text-terracotta-400">
            अपना काशीचक<br />में आपका स्वागत है
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Explore photos, videos, and memories of our village. Connect with your roots and share your Kashichak moments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/explore" className="btn-primary py-3 px-8 text-lg w-full sm:w-auto">
              गाँव की तस्वीरें देखें
            </Link>
            <Link to="/upload" className="btn-secondary bg-white/10 hover:bg-white/20 text-white py-3 px-8 text-lg w-full sm:w-auto border-transparent">
              फोटो / वीडियो जोड़ें
            </Link>
            {!isStandalone && (
              <button 
                onClick={handleInstallClick} 
                className="btn-primary shadow-terracotta-600/20 shadow-lg bg-terracotta-500 hover:bg-terracotta-600 animate-pulse border-none w-full sm:w-auto flex justify-center"
              >
                <Download className="h-4 w-4" /> Install App
              </button>
            )}
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

      {/* Featured Reel Section */}
      {featuredReel && featuredReel.videoUrl && featuredReel.instaUrl && (
        <section className="bg-ink-950 py-16 text-white overflow-hidden relative">
          <div className="absolute inset-0 z-0">
            {/* Background Blur */}
            <video 
              src={featuredReel.videoUrl} 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="font-display text-3xl font-bold sm:text-4xl text-terracotta-400">Latest from Instagram</h2>
              <p className="text-lg text-white/80 max-w-md">
                Catch up on our latest reel and explore the beauty of Kashichak right on your feed!
              </p>
              <a 
                href={featuredReel.instaUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn-primary shadow-terracotta-600/20 shadow-lg inline-flex items-center gap-2"
              >
                <Play className="h-4 w-4" /> Watch on Instagram
              </a>
            </div>
            <div className="flex-1 flex justify-center md:justify-end">
              <a 
                href={featuredReel.instaUrl}
                target="_blank"
                rel="noreferrer"
                className="relative block rounded-3xl overflow-hidden border-[6px] border-white/10 shadow-2xl group w-64 md:w-80 aspect-[9/16] bg-ink-900"
              >
                <video 
                  src={featuredReel.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>
      )}



    </div>
  );
}
