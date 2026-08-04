'use client';
import { useState, useEffect, useCallback } from 'react';
import { listingsApi, Listing, ListingCategory } from '@/lib/api';
import { CATEGORIES, SORT_OPTIONS } from '@/lib/utils';
import ListingCard from '@/components/ListingCard';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Sprout, Loader2 } from 'lucide-react';
import { useWebSocket } from '@/lib/useWebSocket';

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState('');
  const [liveQ, setLiveQ] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 12;
  const totalPages = Math.ceil(total / pageSize);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listingsApi.getAll({
        q: q || undefined,
        category: category || undefined,
        location: location || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sort,
        page,
        pageSize,
      });
      setListings(data.items);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [q, category, location, minPrice, maxPrice, sort, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // ── WebSocket Real-Time Listener for Homepage ──────────
  const handleWebSocketMessage = useCallback((data: any) => {
    // When a farmer creates a new listing, updates, or deletes one, refresh the current page feed
    if (data.type === 'NEW_LISTING' || data.type === 'UPDATE_LISTING' || data.type === 'DELETE_LISTING') {
      fetchListings();
    }
  }, [fetchListings]);

  useWebSocket(handleWebSocketMessage);
  // ───────────────────────────────────────────────────────

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(liveQ);
    setPage(1);
  }

  function clearFilters() {
    setQ(''); setLiveQ(''); setCategory(''); setLocation('');
    setMinPrice(''); setMaxPrice(''); setSort('newest'); setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-green-700 to-green-500 rounded-3xl px-8 py-12 mb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'20\' fill=\'white\'/%3E%3C/svg%3E')]" />
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="w-5 h-5 text-green-200" />
            <span className="text-green-100 text-sm font-medium">Fresh from Nigerian farms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Discover Fresh Produce,<br />Straight from the Farm
          </h1>
          <p className="text-green-100 mb-6 text-base">
            Browse listings from farmers across Nigeria. Order tomatoes from Abia, yam from Benue, or fruits from Plateau — all in one place.
          </p>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={liveQ}
                onChange={e => setLiveQ(e.target.value)}
                placeholder="Search tomatoes, yam, plantain…"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-sm text-gray-900 placeholder-gray-400 outline-none shadow-sm"
              />
            </div>
            <button type="submit" className="bg-green-900/80 hover:bg-green-900 px-5 py-3 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-gray-500">
          {loading ? 'Loading…' : `${total} listing${total !== 1 ? 's' : ''} found`}
        </p>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-500"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:border-green-400 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-500">
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input type="text" placeholder="e.g. Abia" value={location}
              onChange={e => { setLocation(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min price (₦)</label>
            <input type="number" placeholder="0" value={minPrice}
              onChange={e => { setMinPrice(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max price (₦)</label>
            <input type="number" placeholder="Any" value={maxPrice}
              onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>
          <div className="col-span-2 sm:col-span-4 flex justify-end">
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 transition-colors underline">
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24">
          <Sprout className="w-12 h-12 text-green-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No listings found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-green-700 underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-green-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-green-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}