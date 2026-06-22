const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');
// const axios = require('axios'); // For calling python microservice

// @route   GET /api/reviews/movie/:movieId
// @desc    Get all reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
                                .populate('userId', 'username')
                                .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/reviews
// @desc    Create a review for a movie (calls ML sentiment model)
router.post('/', auth, async (req, res) => {
  const { movieId, content } = req.body;

  try {
    const axios = require('axios');
    // Call Python microservice to get sentiment
    const ML_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';
    const mlResponse = await axios.post(`${ML_URL}/predict-sentiment`, { text: content });
    const sentiment = mlResponse.data.sentiment; // true (1) or false (0)
    
    const newReview = new Review({
      userId: req.user.id,
      movieId,
      content,
      sentiment
    });

    const review = await newReview.save();
    res.json(review);
  } catch (err) {
    console.error('Error saving review:', err.message);
    res.status(500).send('Server or ML Service Error');
  }
});

module.exports = router;
