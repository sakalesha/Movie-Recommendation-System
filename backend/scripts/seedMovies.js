const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Movie = require('../models/Movie');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/movie_recommendation')
.then(async () => {
  console.log('Connected to MongoDB. Seeding data...');
  
  // Clear existing movies
  await Movie.deleteMany({});
  
  const results = [];
  const path = require('path');
  const filepath = path.join(__dirname, '../../ml/data/movies.csv');

  fs.createReadStream(filepath)
    .pipe(csv())
    .on('data', (data) => {
      // Parse data and handle potential formatting issues
      results.push({
        id: parseInt(data.id) || 0,
        title: data.title,
        overview: data.overview,
        genres: data.genres,
        cast: data.cast,
        director: data.director,
        release_date: data.release_date,
        popularity: parseFloat(data.popularity) || 0,
        poster_path: ''
      });
    })
    .on('end', async () => {
      try {
        console.log(`Parsed ${results.length} movies. Inserting into DB...`);
        // Insert in batches to avoid memory overload
        const batchSize = 500;
        for (let i = 0; i < results.length; i += batchSize) {
          const batch = results.slice(i, i + batchSize);
          await Movie.insertMany(batch);
          console.log(`Inserted batch ${i / batchSize + 1}`);
        }
        console.log('Seeding completed successfully!');
        mongoose.connection.close();
      } catch (err) {
        console.error('Error inserting data:', err);
        mongoose.connection.close();
      }
    });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
