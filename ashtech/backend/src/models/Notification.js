const { DataTypes } = require('sequelize');
const sequelize = require('../mysql');
const User = require('./User');

const Notification = sequelize.define('Notification', {
  message: { type: DataTypes.STRING, allowNull: false },
  sender: { type: DataTypes.INTEGER, allowNull: true }, // user id
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: true
});

Notification.belongsTo(User, { foreignKey: 'sender', as: 'senderUser' });

module.exports = Notification; 