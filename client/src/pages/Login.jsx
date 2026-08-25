import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6">
      <h1 className="text-center font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-center text-ink-950/60 dark:text-terracotta-50/60">Log in to continue preserving memories.</p>
      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        <input type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-950/60 dark:text-terracotta-50/60">
        Don't have an account? <Link to="/signup" className="font-medium text-terracotta-600 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
