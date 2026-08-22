const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  major: {
    type: String,
    required: true,
    trim: true
  },
  currentRole: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  linkedIn: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alumni', AlumniSchema);
