"use client";

import React, { useState } from 'react';
import { Search, Play, X, Loader2, Film, Tv } from 'lucide-react';

export default function TurtleStream() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ id: string; type: 'movie' | 'tv' } | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie');

  // Environment Variables
  const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  // If your custom domain isn't verified yet, you can use 'https://vidsrc.to' as a fallback
  const PLAYER_URL = process.env.NEXT_PUBLIC_STREAM_DOMAIN || 'https://vidsrc.to';

  const searchMedia = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/${searchType}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaClick = async (id: number) => {
    setPlayerLoading(true);
    try {
      // For Movies, we need the IMDb ID. For TV, the TMDB ID usually works directly.
      if (searchType === 'movie') {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`);
        const data = await res.json();
        if (data.imdb_id) {
          setActiveMedia({ id: data.imdb_id, type: 'movie' });
        } else {
          alert("IMDb ID not found for this movie.");
        }
      } else {
        // TV Show direct use of TMDB ID
        setActiveMedia({ id: id.toString(), type: 'tv' });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setPlayerLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Film className="text-black" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tighter uppercase">
              Turtle<span className="text-emerald-500">Stream</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Toggle Movie/TV */}
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
              <button 
                onClick={() => setSearchType('movie')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${searchType === 'movie' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500'}`}
              >
                Movies
              </button>
              <button 
                onClick={() => setSearchType('tv')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${searchType === 'tv' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500'}`}
              >
                TV Shows
              </button>
            </div>

            <div className="flex flex-1 md:w-96 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-all">
              <input 
                type="text"
                className="bg-transparent w-full px-4 py-2 outline-none text-sm"
                placeholder={`Search ${searchType === 'movie' ? 'movies' : 'series'}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchMedia()}
              />
              <button 
                onClick={searchMedia}
                className="px-4 bg-emerald-500 text-black hover:bg-emerald-400 transition"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Grid */}
      <main className="max-w-7xl mx-auto p-6">
        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-40 text-zinc-500">
            <Film size={48} className="mb-4 opacity-10" />
            <p className="text-zinc-400">Search for your favorite {searchType === 'movie' ? 'movies' : 'shows'} to start watching.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((item: any) => (
            <div 
              key={item.id}
              onClick={() => handleMediaClick(item.id)}
              className="group relative cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-emerald-500/50 transition-all shadow-lg"
            >
              <div className="aspect-[2/3] relative">
                <img 
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
                  alt={item.title || item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-emerald-500 p-3 rounded-full text-black scale-90 group-hover:scale-100 transition-transform">
                    <Play fill="currentColor" size={24} />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-t from-zinc-950 to-zinc-900">
                <h3 className="text-sm font-semibold truncate">{item.title || item.name}</h3>
                <p className="text-xs text-zinc-500 mt-1 flex items-center justify-between">
                  <span>{(item.release_date || item.first_air_date)?.split('-')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 border border-zinc-700 rounded uppercase">{searchType}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Player Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 p-0 md:p-6 lg:p-12">
          <div className="relative w-full max-w-7xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.15)] border border-zinc-800">
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
              <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">STREAMING ACTIVE</span>
              <button 
                onClick={() => setActiveMedia(null)}
                className="bg-white/10 backdrop-blur-md p-2 rounded-full hover:bg-white hover:text-black transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <iframe 
              src={`${PLAYER_URL}/embed/${activeMedia.type === 'movie' ? 'movie' : 'tv'}/${activeMedia.id}`} 
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
              scrolling="no"
            />
          </div>
        </div>
      )}

      {/* Fullscreen Loading */}
      {playerLoading && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="animate-spin text-emerald-500" size={64} />
            <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse"></div>
          </div>
          <p className="mt-4 text-emerald-500 font-mono text-sm tracking-widest animate-pulse">ESTABLISHING LINK...</p>
        </div>
      )}
    </div>
  );
}