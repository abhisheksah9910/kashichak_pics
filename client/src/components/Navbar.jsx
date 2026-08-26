import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Landmark, Menu, X, Sun, Moon, Upload, User, LogOut, ShieldCheck, Bell, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(res => setNotifications(res.data.data)).catch(console.error);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
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
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-terracotta-100 bg-white p-4 shadow-xl dark:border-terracotta-900/40 dark:bg-ink-950 z-50">
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
                  <p className="text-sm">{n.message}</p>
                  <p className="text-[10px] text-ink-950/40 dark:text-terracotta-50/40 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
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

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-terracotta-100 dark:border-terracotta-900/40 bg-white/70 dark:bg-ink-950/70 backdrop-blur-lg shadow-sm transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-terracotta-700 dark:text-terracotta-300">
          <Landmark className="h-6 w-6" />
          Apna Kashichak
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

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick} 
              className="flex items-center gap-1 rounded-full bg-terracotta-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-terracotta-700 transition-colors"
            >
              <Download className="h-4 w-4" /> Install App
            </button>
          )}
          
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
    </header>
  );
}
