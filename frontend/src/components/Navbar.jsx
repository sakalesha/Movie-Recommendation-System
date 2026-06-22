import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search } from 'lucide-react';
import axios from 'axios';
import MoviePoster from './MoviePoster';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim().length > 2) {
        try {
          const res = await axios.get(`/api/movies/search?q=${query}`);
          setResults(res.data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Error searching movies:", error);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleResultClick = (id) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/movie/${id}`);
  };

  return (
    <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-500 transition-colors">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">MovieRecommender</span>
          </Link>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={dropdownRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-gray-800/50 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-gray-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="Search for movies..."
              />
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && results.length > 0 && (
              <div className="absolute mt-12 w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto">
                {results.map((movie) => (
                  <div 
                    key={movie.id}
                    onClick={() => handleResultClick(movie.id)}
                    className="flex items-center p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700/50 last:border-0"
                  >
                    <div className="w-12 h-16 flex-shrink-0 mr-4 rounded bg-gray-900 overflow-hidden">
                      <MoviePoster movieId={movie.id} title={movie.title} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm line-clamp-1">{movie.title}</h4>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                        {movie.genres ? movie.genres.split(' ').join(', ') : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Auth options removed per user request */}
          </div>
        </div>
      </div>
    </nav>
  );
}
