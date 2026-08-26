import { useEffect, useState } from 'react';
import { Search, LayoutGrid, List, MapPin } from 'lucide-react';
import api from '../services/api';
import PlaceCard from '../components/PlaceCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import AdBanner from '../components/AdBanner';

export default function Explore() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({ q: '', state: '', district: '', sort: 'newest' });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      api
        .get('/places', { params: { ...filters, limit: 24 } })
        .then((res) => setPlaces(res.data.data))
        .catch(() => setPlaces([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Explore Places</h1>
          <p className="mt-2 text-ink-950/60 dark:text-terracotta-50/60">
            Discover villages, towns, and landmarks preserved by the Apna Kashichak community.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-terracotta-200 dark:border-terracotta-800 shrink-0">
          <button onClick={() => setView('grid')} className={`p-2.5 ${view === 'grid' ? 'bg-terracotta-600 text-white' : ''}`} aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setView('list')} className={`p-2.5 ${view === 'list' ? 'bg-terracotta-600 text-white' : ''}`} aria-label="List view">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-6 bg-terracotta-50/50 dark:bg-terracotta-900/10 p-6 rounded-2xl border border-terracotta-100 dark:border-terracotta-900/40 h-fit">
          <h2 className="font-semibold text-lg">Filters</h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-ink-950/70 dark:text-terracotta-50/70">Search</label>
            <div className="flex items-center gap-2 rounded-xl border border-terracotta-200 dark:border-terracotta-800 bg-white dark:bg-ink-950/40 px-3 py-2">
              <Search className="h-4 w-4 text-terracotta-400" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Search places..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-ink-950/70 dark:text-terracotta-50/70">State</label>
            <input
              value={filters.state}
              onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
              placeholder="e.g. Bihar"
              className="input w-full rounded-xl py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-ink-950/70 dark:text-terracotta-50/70">District</label>
            <input
              value={filters.district}
              onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
              placeholder="e.g. Nawada"
              className="input w-full rounded-xl py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-ink-950/70 dark:text-terracotta-50/70">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="input w-full rounded-xl py-2"
            >
              <option value="newest">Newest Added</option>
              <option value="most_memories">Most Memories</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>

          <button
            onClick={() => setFilters({ q: '', state: '', district: '', sort: 'newest' })}
            className="w-full py-2 text-sm text-terracotta-600 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 rounded-xl transition"
          >
            Clear Filters
          </button>

          <div className="pt-4">
            <AdBanner type="square" slotId="explore_sidebar" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <GridSkeleton count={6} />
          ) : places.length === 0 ? (
            <EmptyState title="No places found" message="Try adjusting your filters or search query." />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {places.map((p) => <PlaceCard key={p._id} place={p} />)}
            </div>
          ) : (
            <div className="divide-y divide-terracotta-100 dark:divide-terracotta-900/40 rounded-2xl border border-terracotta-100 dark:border-terracotta-900/40">
              {places.map((p) => (
                <a key={p._id} href={`/places/${p.slug}`} className="flex items-center gap-4 p-4 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20">
                  <MapPin className="h-5 w-5 text-terracotta-400" />
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-ink-950/50 dark:text-terracotta-50/50">
                      {[p.area, p.district, p.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <span className="ml-auto text-sm text-ink-950/50 dark:text-terracotta-50/50">{p.memoryCount || 0} memories</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
