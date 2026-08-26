import { useState, useEffect } from 'react';
import { getAnnouncement } from '../services/api';
import { Megaphone, X } from 'lucide-react';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await getAnnouncement();
        if (data && data.isActive) {
          setAnnouncement(data);
        }
      } catch (err) {
        console.error("Failed to load announcement:", err);
      }
    };
    fetchAnnouncement();
  }, []);

  if (!announcement || !isVisible) return null;

  const content = (
    <div className={`relative px-4 py-3 text-white text-center flex items-center justify-center gap-2 ${announcement.backgroundColor} shadow-md z-50`}>
      <Megaphone className="h-4 w-4 animate-pulse" />
      <span className="text-sm font-medium">{announcement.message}</span>
      <button 
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(false);
        }} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  if (announcement.link) {
    return (
      <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="block w-full">
        {content}
      </a>
    );
  }

  return <div className="block w-full">{content}</div>;
}
