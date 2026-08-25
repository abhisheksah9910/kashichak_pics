import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6">
      <h1 className="text-center font-display text-3xl font-semibold">Join Apna Kashichak</h1>
      <p className="mt-2 text-center text-ink-950/60 dark:text-terracotta-50/60">Start preserving memories of the places you love.</p>
      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        <input type="password" required minLength={6} placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account…' : 'Sign up'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-950/60 dark:text-terracotta-50/60">
        Already have an account? <Link to="/login" className="font-medium text-terracotta-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
