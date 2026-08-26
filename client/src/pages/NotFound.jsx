import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-terracotta-400/30 blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Big 404 text */}
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-[120px] sm:text-[180px] font-bold leading-none bg-gradient-to-b from-terracotta-400 to-terracotta-700 bg-clip-text text-transparent select-none"
        >
          404
        </motion.p>

        {/* Spinning compass */}
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-2"
        >
          <Compass className="h-12 w-12 text-terracotta-500" />
        </motion.div>

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
      </motion.div>
    </div>
  );
}
