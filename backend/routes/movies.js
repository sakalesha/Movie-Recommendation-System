const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// @route   GET /api/movies/search
// @desc    Search movies by title
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter q is required' });
    }
    const movies = await Movie.find({ title: { $regex: query, $options: 'i' } })
                              .limit(20)
                              .sort({ popularity: -1 });
    res.json(movies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/movies/trending
// @desc    Get top trending movies
router.get('/trending', async (req, res) => {
  try {
    const movies = await Movie.find()
                              .sort({ popularity: -1 })
                              .limit(10);
    res.json(movies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/movies/:id
// @desc    Get movie details by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ id: req.params.id });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/movies/:id/recommendations
// @desc    Get recommendations for a movie from ML service
router.get('/:id/recommendations', async (req, res) => {
  try {
    const axios = require('axios');
    const ML_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';
    const response = await axios.get(`${ML_URL}/recommend?movie_id=${req.params.id}`);
    const movieIds = response.data.recommendations;
    
    // Fetch the full movie objects from MongoDB
    const movies = await Movie.find({ id: { $in: movieIds } });
    
    // Maintain the order returned by the ML service
    const orderedMovies = movieIds.map(id => movies.find(m => m.id === id)).filter(m => m !== undefined);

    res.json(orderedMovies);
  } catch (err) {
    console.error('Error fetching recommendations:', err.message);
    res.status(500).send('ML Service Error');
  }
});

module.exports = router;
