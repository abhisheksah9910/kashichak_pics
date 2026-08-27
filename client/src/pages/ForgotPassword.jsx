import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Landmark, Mail, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left branding panel — hidden on mobile */}
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
              Recover your<br />
              <span className="text-terracotta-400">account.</span>
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

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-ink-950/50 dark:text-terracotta-50/50 hover:text-terracotta-600 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to log in
          </Link>

          <h1 className="font-display text-3xl font-bold">Forgot password</h1>
          <p className="mt-2 text-ink-950/50 dark:text-terracotta-50/50">
            {submitted 
              ? "Check your email for a link to reset your password."
              : "No worries, we'll send you reset instructions."
            }
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-terracotta-400" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base group"
              >
                {loading ? 'Sending…' : (
                  <>
                    Reset password
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="mt-10">
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-sm font-semibold text-terracotta-600 hover:underline"
              >
                Didn't receive the email? Click to resend
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
