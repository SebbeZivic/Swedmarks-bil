const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  fuel: {
    type: String,
    enum: ['Bensin', 'Diesel', 'El', 'Hybrid'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['Manuell', 'Automatisk'],
    required: true
  },
  bodyType: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  vin: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Car', carSchema);