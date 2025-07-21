const { DataTypes } = require('sequelize');
const sequelize = require('../mysql');
const User = require('./User');

const Tutorial = sequelize.define('Tutorial', {
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  tags: { type: DataTypes.STRING }, // comma-separated string
  author: { type: DataTypes.INTEGER, allowNull: false }, // user id
  link: { type: DataTypes.STRING }, // tutorial link
  thumbnail: { type: DataTypes.STRING }, // thumbnail URL or path
  caption: { type: DataTypes.STRING }, // caption or description
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: true
});

Tutorial.belongsTo(User, { foreignKey: 'author', as: 'authorUser' });

module.exports = Tutorial; 