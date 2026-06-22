const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // The ID from movies.csv
  title: { type: String, required: true, index: true },
  overview: { type: String },
  genres: { type: String },
  cast: { type: String },
  director: { type: String },
  release_date: { type: String },
  popularity: { type: Number },
  poster_path: { type: String }, // To be filled optionally
});

module.exports = mongoose.model('Movie', movieSchema);
