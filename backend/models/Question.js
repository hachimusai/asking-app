const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // null ise anonim
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  answer: { type: String, default: '' },
  answeredAt: { type: Date },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  reposts: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  comments: { type: [commentSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema); 