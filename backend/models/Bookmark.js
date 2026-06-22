const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true },
}, { timestamps: true });

// Prevent duplicate bookmarks for same user and movie
bookmarkSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
