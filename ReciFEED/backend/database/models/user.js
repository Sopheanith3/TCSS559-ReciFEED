// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for population
const userSchema = new mongoose.Schema({
  city: { type: String, required: true },
  population: { type: Number, default: 0, min: 0 },
  populationDensity: { type: Number, default: 0, min: 0 },
  populationRank: { type: Number, default: 0, min: 0 },
  populationDensityRank: { type: Number, default: 0, min: 0 },
  landArea: { type: Number, default: 0, min: 0 },
}, { collection: 'population'});

const Population = mongoose.model('Population', populationSchema);

module.exports = Population;