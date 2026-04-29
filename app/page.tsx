"use client"
import React, { useState } from 'react';
import { Search, Play, X, Loader2, Film } from 'lucide-react';

export default function TurtleStream() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeImdbId, setActiveImdbId] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);

  // Environment Variables
  const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const PLAYER_URL = process.env.NEXT_PUBLIC_STREAM_DOMAIN;

  // Step 1: Search for movies
  const searchMovies = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Get IMDb ID and Open Player
  const handleMovieClick = async (tmdbId: number) => {
    setPlayerLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_KEY}`
      );
      const data = await res.json();
      if (data.imdb_id) {
        setActiveImdbId(data.imdb_id);
      } else {
        alert("Video source not found for this title.");
      }
    } catch (error) {
      console.error("Detail Fetch Error:", error);
    } finally {
      setPlayerLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
      {/* Navigation / Search Bar */}
      <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <Film className="text-black" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tighter">TURTLE<span className="text-emerald-500">STREAM</span></h1>
          </div>

          <div className="flex w-full md:w-96 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-all">
            <input 
              type="text"
              className="bg-transparent w-full px-4 py-2 outline-none text-sm"
              placeholder="Search movies, shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchMovies()}
            />
            <button 
              onClick={searchMovies}
              className="px-4 bg-emerald-500 text-black hover:bg-emerald-400 transition"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content: Results Grid */}
      <main className="max-w-7xl mx-auto p-6">
        {movies.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-40 text-zinc-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p>Search for your favorite movie to start watching.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie: any) => (
            <div 
              key={movie.id}
              onClick={() => handleMovieClick(movie.id)}
              className="group relative cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-emerald-500/50 transition-all shadow-lg"
            >
              <div className="aspect-[2/3] relative">
                <img 
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white p-3 rounded-full text-black">
                    <Play fill="currentColor" size={24} />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">{movie.release_date?.split('-')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Video Player Modal */}
      {activeImdbId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10">
          <div className="relative w-full max-w-6xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)] border border-zinc-800">
            <button 
              onClick={() => setActiveImdbId(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full hover:bg-white hover:text-black transition"
            >
              <X size={24} />
            </button>
            
            <iframe 
              src={`${PLAYER_URL}/embed/${activeImdbId}`} 
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
              scrolling="no"
            />
          </div>
        </div>
      )}

      {/* Loading Overlay for Video Detail Fetch */}
      {playerLoading && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
      )}
    </div>
  );
}