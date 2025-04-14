const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Bucket Schema
const BucketSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Bucket name is required'],
    enum: ['Feature', 'Bug', 'Change', 'Capability'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  color: {
    type: String,
    default: '#3498db' // Default blue color
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bucket', BucketSchema);
