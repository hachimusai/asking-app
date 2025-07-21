const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // null ise sistem bildirimi
  type: { 
    type: String, 
    enum: ['follow', 'question', 'like', 'answer', 'mention'], 
    required: true 
  },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: false },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema); 