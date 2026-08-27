import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Landmark, Menu, X, Sun, Moon, Upload, User, LogOut, ShieldCheck, Bell, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(res => setNotifications(res.data.data)).catch(() => {});
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative rounded-full p-2 text-ink-950/70 hover:bg-terracotta-50 dark:text-terracotta-50/70 dark:hover:bg-terracotta-900/30">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)}></div>
          <div className="fixed left-4 right-4 top-16 z-50 mt-2 rounded-xl border border-terracotta-100 bg-white p-4 shadow-xl dark:border-terracotta-900/40 dark:bg-ink-950 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-xs text-terracotta-600 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-ink-950/50 dark:text-terracotta-50/50 text-center py-4">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n._id} onClick={() => handleMarkAsRead(n._id)} className={`p-3 rounded-lg cursor-pointer transition ${n.isRead ? 'opacity-60' : 'bg-terracotta-50 dark:bg-terracotta-900/20'}`}>
                  <p className="text-sm break-words">{n.message}</p>
                  <p className="mt-1 text-[10px] text-ink-950/40 dark:text-terracotta-50/40">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition hover:text-terracotta-600 dark:hover:text-terracotta-300 ${isActive ? 'text-terracotta-600 dark:text-terracotta-300' : 'text-ink-950/70 dark:text-terracotta-50/70'
  }`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      toast('अभी इंस्टॉल के लिए तैयार नहीं है! कृपया ब्राउज़र मेनू (3 dots) से "Install App" चुनें या पेज रिफ्रेश करें।', { icon: 'ℹ️', duration: 5000 });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-terracotta-100 dark:border-terracotta-900/40 bg-white/70 dark:bg-ink-950/70 backdrop-blur-lg shadow-sm transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-terracotta-700 dark:text-terracotta-300">
          <Landmark className="h-6 w-6" />
          Kashichak
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
          <NavLink to="/history" className={navLinkClass}>History</NavLink>
          <NavLink to="/upload" className={navLinkClass}>Share a Memory</NavLink>
          {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </nav>

        {/* Desktop User Actions & Mobile Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin Dashboard (Mobile & Desktop) */}
          {isAdmin && (
            <Link to="/admin" aria-label="Admin Dashboard" className="rounded-full p-2 text-terracotta-600 hover:bg-terracotta-50 dark:text-terracotta-400 dark:hover:bg-terracotta-900/30 transition-colors">
              <ShieldCheck className="h-5 w-5" />
            </Link>
          )}

          {/* Notifications (Mobile & Desktop) */}
          {user && <NotificationBell user={user} />}

          {/* Theme Toggle (Mobile & Desktop) */}
          <button onClick={toggleTheme} aria-label="Toggle dark mode" className="rounded-full p-2 text-ink-950/70 hover:bg-terracotta-50 dark:text-terracotta-50/70 dark:hover:bg-terracotta-900/30 transition-colors">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* PWA Install Button (Permanent on web, hidden in PWA) */}
          {!isStandalone && (
            <button 
              onClick={handleInstallClick} 
              className="hidden md:flex items-center gap-1 rounded-full bg-terracotta-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-terracotta-700 transition-colors"
            >
              <Download className="h-4 w-4" /> Install
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden rounded-full p-2 text-ink-950/70 hover:bg-terracotta-50 dark:text-terracotta-50/70 dark:hover:bg-terracotta-900/30 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          {/* Desktop Only Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-terracotta-600">
                  <User className="h-4 w-4" /> {user.name.split(' ')[0]}
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="rounded-full p-2 text-ink-950/60 hover:bg-terracotta-50 dark:text-terracotta-50/60 dark:hover:bg-terracotta-900/30" aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-terracotta-600">Log in</Link>
                <Link to="/signup" className="btn-primary py-2 px-5 text-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-terracotta-100 dark:border-terracotta-900/40 bg-white dark:bg-ink-950 absolute w-full left-0 shadow-lg">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-ink-950/70 dark:text-terracotta-50/70">Home</Link>
            <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-ink-950/70 dark:text-terracotta-50/70">Explore</Link>
            <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-ink-950/70 dark:text-terracotta-50/70">History</Link>
            <Link to="/upload" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-ink-950/70 dark:text-terracotta-50/70">Share a Memory</Link>
            {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-terracotta-600 dark:text-terracotta-400">Admin Dashboard</Link>}
            
            {!isStandalone && (
              <button 
                onClick={() => { handleInstallClick(); setMobileMenuOpen(false); }} 
                className="flex w-max items-center gap-2 rounded-full bg-terracotta-600 px-4 py-2 text-xs font-semibold text-white shadow"
              >
                <Download className="h-4 w-4" /> Install App
              </button>
            )}

            <div className="pt-4 border-t border-terracotta-100 dark:border-terracotta-900/40 flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Profile</Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }} className="text-sm font-medium text-red-500">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Log in</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-terracotta-600">Sign up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
