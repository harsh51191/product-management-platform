const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Squad Schema
const SquadSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Squad name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  capacity: {
    type: Number,
    default: 50, // Default capacity in man-days per sprint
    min: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Squad', SquadSchema);
