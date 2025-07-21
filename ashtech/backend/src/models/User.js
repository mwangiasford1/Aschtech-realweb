const { DataTypes } = require('sequelize');
const sequelize = require('../mysql');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  profileImage: { type: DataTypes.TEXT('long'), allowNull: true },
  bannerImage: { type: DataTypes.TEXT('long'), allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  birthday: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.STRING, allowNull: true },
  github: { type: DataTypes.STRING, allowNull: true },
  twitter: { type: DataTypes.STRING, allowNull: true },
  linkedin: { type: DataTypes.STRING, allowNull: true },
  twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  twoFactorSecret: { type: DataTypes.STRING, allowNull: true },
  passwordResetToken: { type: DataTypes.STRING, allowNull: true },
  passwordResetExpires: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true
});

module.exports = User; 