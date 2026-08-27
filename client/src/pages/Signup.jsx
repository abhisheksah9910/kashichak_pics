import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Landmark, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential);
      toast.success('Signed in with Google!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Google Sign Up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to the community.');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-ink-950 p-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-1/4 -left-1/4 w-2/3 h-2/3 rounded-full bg-terracotta-600/30 blur-[120px]"
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 rounded-full bg-orange-500/20 blur-[150px]"
          />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white">
            <Landmark className="h-8 w-8 text-terracotta-400" />
            <span className="font-display text-2xl font-semibold">Kashichak</span>
          </Link>
        </div>

        <div className="relative z-10">
          <div>
            <p className="font-display text-4xl font-bold text-white leading-snug">
              Become part of<br />
              <span className="text-terracotta-400">our community.</span>
            </p>
            <p className="mt-4 text-terracotta-100/60 text-lg">
              Share your memories, discover stories, and help preserve your village's heritage.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-terracotta-50/30">
            © {new Date().getFullYear()} Kashichak. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-16 sm:px-12 lg:px-20 bg-white dark:bg-ink-950">
        <div
          className="mx-auto w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10 text-terracotta-700 dark:text-terracotta-300">
            <Landmark className="h-6 w-6" />
            <span className="font-display text-lg font-semibold">Kashichak</span>
          </Link>

          <h1 className="font-display text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-ink-950/50 dark:text-terracotta-50/50">
            Join the community. It's free.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-terracotta-400" />
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input pl-11"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-terracotta-400" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input pl-11"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-terracotta-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pl-11"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base group"
            >
              {loading ? 'Creating account…' : (
                <>
                  Sign up
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <span className="text-sm text-ink-950/40 dark:text-terracotta-50/40">or</span>
          </div>

          <div className="mt-6 flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign Up Failed')}
              useOneTap
              theme="outline"
              size="large"
              shape="pill"
              text="signup_with"
            />
          </div>

          <p className="mt-6 text-center text-sm text-ink-950/50 dark:text-terracotta-50/50">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-terracotta-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
