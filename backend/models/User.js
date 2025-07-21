const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: Number, enum: [0, 1, 2], required: true }, // 0: girl, 1: boy, 2: idk
  bio: { type: String, maxlength: 300, default: '' },
  hobbies: { type: [String], default: [] },
  profilePhoto: { type: String, default: '' },
  height: { type: Number, min: 100, max: 250, default: null }, // cm
  weight: { type: Number, min: 30, max: 300, default: null }, // kg
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  privacy: {
    questionCount: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' },
    likeCount: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' },
    followerCount: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' },
    followingCount: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' },
    mostAsked: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' },
    mostLiked: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' },
    mostFollowers: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' },
    height: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' },
    weight: { type: String, enum: ['everyone', 'followers', 'following', 'both', 'none'], default: 'everyone' }
  },
  stats: {
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    questions: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema); 