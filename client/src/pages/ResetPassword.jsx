import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Landmark, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirmPassword) {
      return toast.error("Passwords don't match!");
    }
    if (passwords.password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const res = await api.patch(`/auth/reset-password/${token}`, { password: passwords.password });
      
      localStorage.setItem('token', res.data.data.token);
      await loadUser(); // Reload user context since they are now logged in
      
      toast.success(res.data.message || 'Password successfully reset! You are now logged in.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-ink-950 p-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-1/4 -left-1/4 w-2/3 h-2/3 rounded-full bg-terracotta-600/30 blur-[120px]"
          />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white">
            <Landmark className="h-8 w-8 text-terracotta-400" />
            <span className="font-display text-2xl font-semibold">Kashichak</span>
          </Link>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-display text-4xl font-bold text-white leading-snug">
              Set a new<br />
              <span className="text-terracotta-400">password.</span>
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-terracotta-50/30">
            © {new Date().getFullYear()} Kashichak. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-16 sm:px-12 lg:px-20 bg-white dark:bg-ink-950">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-sm"
        >
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10 text-terracotta-700 dark:text-terracotta-300">
            <Landmark className="h-6 w-6" />
            <span className="font-display text-lg font-semibold">Kashichak</span>
          </Link>

          <h1 className="font-display text-3xl font-bold">Reset password</h1>
          <p className="mt-2 text-ink-950/50 dark:text-terracotta-50/50">
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-terracotta-400" />
              <input
                type="password"
                required
                placeholder="New password (min 6 chars)"
                value={passwords.password}
                onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                className="input pl-11"
                minLength={6}
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-terracotta-400" />
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="input pl-11"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base group"
            >
              {loading ? 'Saving…' : (
                <>
                  Reset and Log in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
