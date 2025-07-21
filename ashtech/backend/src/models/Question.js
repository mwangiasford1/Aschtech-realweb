const { DataTypes } = require('sequelize');
const sequelize = require('../mysql');
const Answer = require('./Answer');
const User = require('./User');

const Question = sequelize.define('Question', {
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  tags: { type: DataTypes.STRING }, // comma-separated string
  author: { type: DataTypes.INTEGER, allowNull: false }, // user id
  image: { type: DataTypes.STRING, allowNull: true }, // image file path
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: true
});

Question.hasMany(Answer, { foreignKey: 'questionId', as: 'answers', onDelete: 'CASCADE' });
Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });
Question.belongsTo(User, { foreignKey: 'author', as: 'authorUser' });

module.exports = Question; 