import { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { getAds } from '../services/api';

export default function AdBanner({ type = "horizontal", slotId = "general" }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await getAds();
        const activeAds = response.data || [];
        
        // Find an ad that matches the specific slot, or fallback to 'general'
        let matchedAd = activeAds.find(a => a.slot === slotId);
        if (!matchedAd) {
          matchedAd = activeAds.find(a => a.slot === 'general');
        }

        if (matchedAd) {
          setAd(matchedAd);
        }
      } catch (err) {
        console.error("Failed to load ad:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [slotId]);

  if (loading || !ad) return null; // Don't show anything if no ad exists

  const AdContent = () => (
    <div className={`w-full bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex ${type === 'horizontal' ? 'flex-row h-28 sm:h-32' : 'flex-col'}`}>
      
      {/* Ad Image */}
      <div className={`relative ${type === 'horizontal' ? 'w-1/3 sm:w-1/4 h-full' : 'w-full h-40'}`}>
        <img 
          src={ad.imageUrl} 
          alt={ad.caption} 
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-widest flex items-center gap-1">
          <Megaphone className="h-3 w-3" /> Ad
        </div>
      </div>

      {/* Ad Details */}
      <div className={`flex flex-col justify-center p-4 ${type === 'horizontal' ? 'flex-1' : 'w-full'}`}>
        <p className="font-semibold text-ink-950 dark:text-terracotta-50 group-hover:text-terracotta-600 transition-colors line-clamp-2">
          {ad.caption}
        </p>
        {ad.link && (
          <span className="text-terracotta-500 text-xs font-medium mt-2 group-hover:underline">
            Visit Link &rarr;
          </span>
        )}
      </div>
    </div>
  );

  if (ad.link) {
    return (
      <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full">
        <AdContent />
      </a>
    );
  }

  return <AdContent />;
}
