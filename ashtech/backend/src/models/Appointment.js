const { DataTypes } = require('sequelize');
const sequelize = require('../mysql');

const Appointment = sequelize.define('Appointment', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  datetime: { type: DataTypes.DATE, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false
});

module.exports = Appointment; 