import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Heart, MapPin } from 'lucide-react';

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
    }
  ];

  return (
    <footer className="mt-24 border-t border-terracotta-100 dark:border-terracotta-900/40 bg-white dark:bg-ink-950">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 flex flex-col items-center text-center">
        
        {/* Brand Section */}
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-terracotta-700 dark:text-terracotta-400 mb-4 transition-transform hover:scale-105">
          <MapPin className="h-7 w-7" />
          Apna Kashichak
        </Link>
        <p className="text-base text-ink-950/60 dark:text-terracotta-50/60 max-w-md mb-8">
          Hamara gaon, hamari yaadein. Ek chhoti si koshish gaon ki khoobsurati ko hamesha ke liye sanjone ki.
        </p>

        {/* Social Links (Badges) */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-lg">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <a 
                key={idx}
                href={badge.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-1 sm:flex-none justify-center items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold tracking-wider text-white transition hover:opacity-80 hover:scale-105 transform rounded-sm ${badge.color}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{badge.name}</span>
              </a>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-24 h-1 bg-terracotta-200 dark:bg-terracotta-900/50 rounded-full mb-12"></div>

        {/* Developer Credit */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <p className="text-sm font-medium text-ink-950/50 dark:text-terracotta-50/50 flex items-center gap-1.5">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" /> by
          </p>
          <a 
            href="https://www.instagram.com/its_abhisheek/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-terracotta-50/50 dark:bg-terracotta-900/10 px-6 py-2.5 rounded-full border border-terracotta-100/50 dark:border-terracotta-900/30 hover:border-terracotta-300 dark:hover:border-terracotta-700 transition-all duration-300"
          >
            <img 
              src="/profile.jpg" 
              alt="Abhishek Kumar" 
              className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-terracotta-400 transition-all"
            />
            <span className="text-sm font-bold text-terracotta-800 dark:text-terracotta-200 group-hover:text-terracotta-600 dark:group-hover:text-terracotta-400 transition-colors">
              Abhishek Kumar
            </span>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-ink-950/40 dark:text-terracotta-50/40">
          © {new Date().getFullYear()} Apna Kashichak. Sabhi adhikar surakshit hain.
        </p>

      </div>
    </footer>
  );
}
