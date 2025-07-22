const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  profileImage: String,
  bannerImage: String,
  bio: String,
  phone: String,
  location: String,
  birthday: String,
  gender: String,
  github: String,
  twitter: String,
  linkedin: String,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
