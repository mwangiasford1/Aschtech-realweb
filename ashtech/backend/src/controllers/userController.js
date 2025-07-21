// Get and update current user's profile
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const AuditLog = require('../models/AuditLog');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tutorial = require('../models/Tutorial');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    // For multipart/form-data, use req.body for text fields and req.files for images
    let { username, email, password, bio, phone, location, birthday, gender, github, twitter, linkedin } = req.body;
    console.log('updateProfile req.file:', req.file);
    console.log('updateProfile req.body.profileImage:', req.body.profileImage);
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      req.user.profileImage = req.files.profileImage[0].buffer.toString('base64');
    }
    if (req.files && req.files.bannerImage && req.files.bannerImage[0]) {
      req.user.bannerImage = req.files.bannerImage[0].buffer.toString('base64');
    }
    if (username) req.user.username = username;
    if (email) req.user.email = email;
    if (bio) req.user.bio = bio;
    if (phone) req.user.phone = phone;
    if (location) req.user.location = location;
    if (birthday) req.user.birthday = birthday;
    if (gender) req.user.gender = gender;
    if (github) req.user.github = github;
    if (twitter) req.user.twitter = twitter;
    if (linkedin) req.user.linkedin = linkedin;
    if (password) req.user.password = await bcrypt.hash(password, 10);
    await req.user.save();
    res.json({ message: 'Profile updated', user: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// Admin: List all users
exports.listUsers = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
};

// Admin: Promote user to admin
exports.promoteUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.role = 'admin';
  await user.save();
  await AuditLog.create({ action: 'promote_user', user: String(req.user._id || req.user.id), target: String(user.id), details: `Promoted user ${user.username}` });
  res.json(user);
};

// Admin: Demote user to regular
exports.demoteUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.role = 'user';
  await user.save();
  await AuditLog.create({ action: 'demote_user', user: String(req.user._id || req.user.id), target: String(user.id), details: `Demoted user ${user.username}` });
  res.json(user);
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Delete all answers by this user
  await Answer.destroy({ where: { author: user.id } });
  // Delete all questions by this user
  await Question.destroy({ where: { author: user.id } });
  await Tutorial.destroy({ where: { author: user.id } });

  await user.destroy();
  await AuditLog.create({ action: 'delete_user', user: String(req.user._id || req.user.id), target: String(user.id), details: `Deleted user ${user.username}` });
  res.json({ message: 'User deleted' });
};

// Admin: Update user details
exports.updateUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { username, email, role } = req.body;
  if (username) user.username = username;
  if (email) user.email = email;
  if (role) user.role = role;
  await user.save();
  await AuditLog.create({ action: 'update_user', user: String(req.user._id || req.user.id), target: String(user.id), details: `Updated user ${user.username}` });
  res.json(user);
};

// Enable 2FA: generate secret and QR code
exports.enable2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `AshTech (${req.user.email})` });
    req.user.twoFactorSecret = secret.base32;
    await req.user.save();
    const qr = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ otpauth_url: secret.otpauth_url, qr });
  } catch (err) {
    res.status(500).json({ message: 'Failed to enable 2FA', error: err.message });
  }
};

// Verify 2FA: check code and enable 2FA
exports.verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });
    if (!verified) return res.status(400).json({ message: 'Invalid 2FA code' });
    req.user.twoFactorEnabled = true;
    await req.user.save();
    res.json({ message: '2FA enabled', user: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify 2FA', error: err.message });
  }
};

// Disable 2FA: set twoFactorEnabled to false and clear secret
exports.disable2FA = async (req, res) => {
  try {
    req.user.twoFactorEnabled = false;
    req.user.twoFactorSecret = null;
    await req.user.save();
    res.json({ message: '2FA disabled', user: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to disable 2FA', error: err.message });
  }
}; 