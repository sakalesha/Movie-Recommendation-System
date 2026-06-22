import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MoviePoster({ movieId, title, className }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const apiKey = import.meta.env.VITE_OMDB_API_KEY;
        if (!apiKey || apiKey === 'your_omdb_api_key_here') {
          setLoading(false);
          return;
        }
        
        // Use OMDb API with movie title
        const res = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
        if (res.data && res.data.Poster && res.data.Poster !== 'N/A') {
          setPosterUrl(res.data.Poster);
        }
      } catch (err) {
        console.error('Failed to fetch poster for', title);
      } finally {
        setLoading(false);
      }
    };
    
    if (title) {
      fetchPoster();
    }
  }, [title]);

  if (loading || !posterUrl) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center text-gray-500 ${className}`}>
        <span className="text-4xl">🎬</span>
      </div>
    );
  }

  return (
    <img 
      src={posterUrl} 
      alt={`${title} poster`} 
      className={`object-cover w-full h-full ${className}`} 
    />
  );
}
