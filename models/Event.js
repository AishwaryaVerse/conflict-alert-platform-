const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['drone', 'explosion', 'missile', 'conflict'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  credibilityScore: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['Unverified', 'Developing', 'High Confidence'],
    default: 'Unverified'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);