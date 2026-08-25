import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Compass className="h-12 w-12 text-terracotta-400" />
      <h1 className="mt-4 font-display text-3xl font-semibold">This place couldn't be found</h1>
      <p className="mt-2 text-ink-950/60 dark:text-terracotta-50/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back home</Link>
    </div>
  );
}
