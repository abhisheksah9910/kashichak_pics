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
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/apna_kashichak/', hoverClass: 'hover:bg-pink-100 hover:text-pink-600 dark:hover:bg-pink-900/30 dark:hover:text-pink-400' },
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/kashichak/', hoverClass: 'hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400' },
    { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@apnakashichak', hoverClass: 'hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400' }
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

        {/* Social Links */}
        <div className="flex gap-4 mb-12">
          {socialLinks.map((social, idx) => {
            const Icon = social.icon;
            return (
              <a 
                key={idx} 
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={social.name}
                className={`p-3 rounded-2xl bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 transition-all duration-300 ${social.hoverClass}`}
              >
                <Icon className="h-5 w-5" />
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
