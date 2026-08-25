import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, PlusSquare, User, Archive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Home / होम', path: '/', icon: Home },
    { label: 'Explore / खोजें', path: '/explore', icon: Compass },
    { label: 'History / इतिहास', path: '/history', icon: Archive },
    { label: 'Add / जोड़ें', path: '/upload', icon: PlusSquare },
    { label: 'Profile / प्रोफ़ाइल', path: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-terracotta-100 dark:border-terracotta-900/40 bg-white/90 dark:bg-ink-950/90 backdrop-blur-md pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-6 py-3">
        {navItems.map((item) => {
          // Strict exact match for Home, otherwise just exact match
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-1 transition-colors ${
                isActive ? 'text-terracotta-600 dark:text-terracotta-400' : 'text-ink-950/50 dark:text-terracotta-50/50 hover:text-ink-950/80 dark:hover:text-terracotta-50/80'
              }`}
            >
              <div className={`relative flex items-center justify-center p-1 rounded-full transition-all ${isActive ? 'bg-terracotta-100 dark:bg-terracotta-900/40' : ''}`}>
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] tracking-wide transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
