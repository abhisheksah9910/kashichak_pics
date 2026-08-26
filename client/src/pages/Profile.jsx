import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { CheckCircle2, Clock, XCircle, MapPin, LogOut, ShieldCheck, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      api.get('/users/my-uploads'),
      api.get('/users/profile'),
    ])
      .then(([uploadsRes, profileRes]) => {
        setMemories(uploadsRes.data.data.memories);
        setStats(profileRes.data.data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusIcon = { approved: CheckCircle2, pending: Clock, rejected: XCircle };
  const statusColor = {
    approved: 'text-green-600 dark:text-green-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    rejected: 'text-red-600 dark:text-red-400',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredMemories = activeFilter === 'all'
    ? memories
    : memories.filter((m) => m.status === activeFilter);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnableNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return toast.error('Push notifications are not supported by your browser.');
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return toast.error('Notification permission denied.');
      
      const vapidRes = await api.get('/push/vapid-public-key');
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidRes.data.publicKey)
      });

      await api.post('/push/subscribe', subscription);
      toast.success('Push notifications enabled!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to enable notifications.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-100 font-display text-2xl font-semibold text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">{user?.name}</h1>
            <p className="text-sm text-ink-950/50 dark:text-terracotta-50/50">{user?.email}</p>
          </div>
        </div>
        
        {/* Actions (mobile-friendly since they are hidden in main navbar) */}
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 rounded-lg bg-terracotta-100 px-4 py-2 text-sm font-medium text-terracotta-700 hover:bg-terracotta-200 dark:bg-terracotta-900/40 dark:text-terracotta-300 dark:hover:bg-terracotta-900/60 transition-colors">
              <ShieldCheck className="h-4 w-4" />
              Admin Dashboard
            </Link>
          )}
          <button 
            onClick={handleEnableNotifications}
            className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Bell className="h-4 w-4" />
            Enable Notifications
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-terracotta-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-terracotta-800 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total uploads', value: stats.totalUploads, icon: Clock },
            { label: 'Approved', value: stats.approvedUploads, icon: CheckCircle2 },
            { label: 'Pending', value: stats.pendingUploads, icon: Clock },
            { label: 'Rejected', value: stats.rejectedUploads, icon: XCircle },
          ].map((s, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              key={s.label} 
              className="card p-4 text-center"
            >
              <s.icon className="mx-auto h-5 w-5 text-terracotta-500" />
              <p className="mt-2 text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-ink-950/50 dark:text-terracotta-50/50">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* My Memories */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-xl font-semibold">My Memories</h2>
          <div className="flex gap-2">
            {['all', 'approved', 'pending', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition ${
                  activeFilter === f
                    ? 'bg-terracotta-600 text-white'
                    : 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : filteredMemories.length === 0 ? (
          <EmptyState
            title="No uploads yet"
            message="Once you share a memory, it will show up here with its review status."
          />
        ) : (
          <div className="space-y-3">
            {filteredMemories.map((m, i) => {
              const Icon = statusIcon[m.status] || Clock;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  key={m._id} 
                  className="card flex items-center gap-4 p-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-terracotta-100 dark:bg-terracotta-900/30">
                    <img
                      src={m.thumbnailUrl || m.mediaUrl}
                      alt={m.caption}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{m.caption}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-950/50 dark:text-terracotta-50/50">
                      <MapPin className="h-3 w-3" />
                      {m.place?.name || 'Unknown place'} · {new Date(m.dateCaptured).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium capitalize ${statusColor[m.status]}`}>
                    <Icon className="h-4 w-4" />
                    {m.status}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
