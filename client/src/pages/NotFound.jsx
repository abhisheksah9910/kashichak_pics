import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-terracotta-400/30 blur-[120px]"
        />
      </div>

      <div
        className="relative z-10 flex flex-col items-center"
      >
        {/* Big 404 text */}
        <p
          className="font-display text-[120px] sm:text-[180px] font-bold leading-none bg-gradient-to-b from-terracotta-400 to-terracotta-700 bg-clip-text text-transparent select-none"
        >
          404
        </p>

        {/* Spinning compass */}
        <div
          className="mt-2"
        >
          <Compass className="h-12 w-12 text-terracotta-500" />
        </div>

        <h1 className="mt-6 font-display text-2xl sm:text-3xl font-semibold">
          This place couldn't be found
        </h1>
        <p className="mt-3 max-w-sm text-ink-950/50 dark:text-terracotta-50/50 text-base">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/" className="btn-primary">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link to="/explore" className="btn-secondary">
            <Compass className="h-4 w-4" />
            Explore Places
          </Link>
        </div>
      </div>
    </div>
  );
}
