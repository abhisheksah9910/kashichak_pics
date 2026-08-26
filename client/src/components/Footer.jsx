import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Compass, PlusSquare, MapPin } from 'lucide-react';

export default function Footer() {
  const badges = [
    { name: 'INSTAGRAM', icon: Instagram, color: 'bg-[#e1306c]', href: 'https://www.instagram.com/kashichak_pics/' },
    { name: 'FACEBOOK', icon: Facebook, color: 'bg-[#1877F2]', href: 'https://www.facebook.com/share/1EuLPGp3oM/' },
    { name: 'YOUTUBE', icon: Youtube, color: 'bg-[#FF0000]', href: 'https://www.youtube.com/@kashichakpics' },
    { 
      name: 'WHATSAPP', 
      icon: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
      ), 
      color: 'bg-[#25D366]', 
      href: 'https://whatsapp.com/channel/0029VbDVZoFKLaHuZfj9mV1U' 
    },
  ];

  return (
    <footer className="mt-24 border-t border-terracotta-100 dark:border-terracotta-900/40 bg-terracotta-50/50 dark:bg-ink-950 pb-8">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left items-center md:items-start">
        
        {/* Brand & Socials */}
        <div className="flex flex-col items-center md:items-start gap-6">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-terracotta-700 dark:text-terracotta-300">
            <MapPin className="h-6 w-6" />
            Apna Kashichak
          </Link>
          <p className="text-sm text-ink-950/60 dark:text-terracotta-50/60 max-w-xs">
            Every place has a story. Join us in preserving the memories of our village for generations to come.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <a 
                key={idx}
                href={badge.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-1 sm:flex-none justify-center items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold tracking-wider text-white transition hover:opacity-80 hover:scale-105 transform rounded-sm ${badge.color} ${badge.text || ''}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{badge.name}</span>
              </a>
            );
          })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <h4 className="font-semibold text-terracotta-900 dark:text-terracotta-100">Quick Links</h4>
          <nav className="flex flex-col gap-2">
            <Link to="/explore" className="text-sm text-ink-950/70 dark:text-terracotta-50/70 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors flex items-center gap-2">
              <Compass className="h-4 w-4" /> Explore Places
            </Link>
            <Link to="/upload" className="text-sm text-ink-950/70 dark:text-terracotta-50/70 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors flex items-center gap-2">
              <PlusSquare className="h-4 w-4" /> Share a Memory
            </Link>
            <a href="https://github.com/abhisheksah9910/kashichak_pics" target="_blank" rel="noopener noreferrer" className="text-sm text-ink-950/70 dark:text-terracotta-50/70 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors flex items-center gap-2">
              Source Code
            </a>
          </nav>
        </div>

        {/* Developer Info */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <h4 className="font-semibold text-terracotta-900 dark:text-terracotta-100">Created By</h4>
          <a 
            href="https://www.instagram.com/its_abhisheek/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white dark:bg-terracotta-900/20 px-5 py-2 rounded-full border border-terracotta-100 dark:border-terracotta-900/40 shadow-sm transition hover:scale-105 hover:shadow-md cursor-pointer"
          >
            <img 
              src="/profile.jpg" 
              alt="Developer" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-medium text-ink-950/50 dark:text-terracotta-50/50 uppercase tracking-widest">Developer</span>
              <span className="text-sm font-bold text-terracotta-700 dark:text-terracotta-300">Abhishek Kumar</span>
            </div>
          </a>
        </div>

      </div>
        
      {/* Copyright */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="w-full mt-12 pt-6 border-t border-terracotta-100 dark:border-terracotta-900/40 flex justify-center">
          <p className="text-center text-xs text-ink-950/40 dark:text-terracotta-50/40">
            © {new Date().getFullYear()} Apna Kashichak. Every place has a story.
          </p>
        </div>
      </div>
    </footer>
  );
}
