// models/report.js
'use strict';
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved'),
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

Report.associate = (models) => {
  Report.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });

  Report.belongsTo(models.Video, {
    foreignKey: "videoId",
    as: "video",
  });
};

module.exports = Report;