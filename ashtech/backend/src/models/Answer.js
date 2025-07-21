const { DataTypes } = require('sequelize');
const sequelize = require('../mysql');
const User = require('./User');

const Answer = sequelize.define('Answer', {
  body: { type: DataTypes.TEXT, allowNull: false },
  author: { type: DataTypes.INTEGER, allowNull: false }, // user id
  questionId: { type: DataTypes.INTEGER, allowNull: false }, // foreign key
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: true
});

Answer.belongsTo(User, { foreignKey: 'author', as: 'authorUser' });

module.exports = Answer; 