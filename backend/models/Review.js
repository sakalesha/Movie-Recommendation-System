const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true }, // Referencing the movie ID from movies.csv (or Movie schema id)
  content: { type: String, required: true },
  sentiment: { type: Boolean }, // true = Positive, false = Negative
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
