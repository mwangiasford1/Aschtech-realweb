const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  profileImage: { type: String },
  bannerImage: { type: String },
  bio: { type: String },
  phone: { type: String },
  location: { type: String },
  birthday: { type: String },
  gender: { type: String },
  github: { type: String },
  twitter: { type: String },
  linkedin: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 