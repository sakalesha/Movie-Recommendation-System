import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, MessageSquare } from 'lucide-react';
import axios from 'axios';
import MoviePoster from '../components/MoviePoster';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Movie Details
        const movieRes = await axios.get(`/api/movies/${id}`);
        setMovie(movieRes.data);
        
        // Fetch Recommendations from ML microservice (via backend)
        const recsRes = await axios.get(`/api/movies/${id}/recommendations`);
        setRecommendations(recsRes.data);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    
    setSubmitting(true);
    try {
      // Create review (assuming backend endpoint exists for this or just calling ML direct for demo)
      const res = await axios.post('http://127.0.0.1:8000/predict-sentiment', {
        text: reviewText
      });
      setSentiment(res.data.sentiment);
      // In a real app, we'd also post to backend DB here:
      // await axios.post(`/api/reviews`, { movieId: id, text: reviewText, rating: res.data.sentiment === 'positive' ? 5 : 1 });
    } catch (err) {
      console.error('Sentiment analysis failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!movie) {
    return <div className="text-center py-16 text-gray-400">Movie not found</div>;
  }

  const parseGenres = (genresStr) => {
    if (!genresStr) return 'Unknown';
    try {
      return genresStr.split(' ').join(', ');
    } catch {
      return genresStr;
    }
  };

  const parseCast = (castStr) => {
    if (!castStr) return 'Unknown';
    try {
      return castStr;
    } catch {
      return castStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Movie Details Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-16">
        <div className="w-full md:w-1/3 flex-shrink-0">
          <MoviePoster movieId={movie.id} title={movie.title} className="aspect-[2/3] rounded-2xl shadow-2xl shadow-indigo-500/10" />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {movie.release_date || 'N/A'}</span>
            <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500" /> Popularity: {movie.popularity}</span>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
            <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <div>
              <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Director</h4>
              <p className="text-white font-medium">{movie.director || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Genres</h4>
              <p className="text-white font-medium">{parseGenres(movie.genres)}</p>
            </div>
            <div className="col-span-2">
              <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Top Cast</h4>
              <p className="text-white font-medium">{parseCast(movie.cast)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review & Sentiment Section */}
      <div className="mb-16 bg-gray-800/30 p-8 rounded-3xl border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <MessageSquare className="w-6 h-6 mr-3 text-indigo-400" />
          Leave a Review (AI Sentiment Analysis)
        </h2>
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            rows="4"
            placeholder="What did you think of this movie?"
          ></textarea>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? 'Analyzing...' : 'Submit Review'}
          </button>
        </form>
        {sentiment && (
          <div className={`mt-6 p-4 rounded-xl flex items-center space-x-3 ${sentiment === 'positive' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <span className="text-2xl">{sentiment === 'positive' ? '👍' : '👎'}</span>
            <div>
              <p className="font-semibold">AI Sentiment Analysis Result</p>
              <p className="text-sm opacity-80">This review was classified as {sentiment.toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-8 flex items-center space-x-3">
            <span className="bg-indigo-600 w-2 h-8 rounded-full inline-block"></span>
            <span>You Might Also Like</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommendations.map((rec) => (
              <Link to={`/movie/${rec.id}`} key={rec.id} className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20">
                <MoviePoster movieId={rec.id} title={rec.title} className="aspect-[2/3]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white line-clamp-1">{rec.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
