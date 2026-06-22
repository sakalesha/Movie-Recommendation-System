import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MoviePoster from '../components/MoviePoster';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('/api/movies/trending');
        setTrending(res.data);
      } catch (err) {
        console.error('Failed to fetch trending movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop" 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Discover Your Next Favorite Movie
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Get personalized recommendations and see what people are saying with our AI-powered sentiment analysis.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#trending-section" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 shadow-xl shadow-indigo-600/30">
              <Play className="h-5 w-5 fill-current" />
              <span>Explore Now</span>
            </a>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div id="trending-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center space-x-3">
          <span className="bg-indigo-600 w-2 h-8 rounded-full inline-block"></span>
          <span>Trending Now</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[2/3] bg-gray-800 animate-pulse rounded-2xl"></div>
              </div>
            ))
          ) : (
            trending.map((movie) => (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20">
                <MoviePoster movieId={movie.id} title={movie.title} className="aspect-[2/3]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white line-clamp-1">{movie.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-1">
                    {movie.genres ? movie.genres.split(' ').join(', ') : 'Unknown'}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
