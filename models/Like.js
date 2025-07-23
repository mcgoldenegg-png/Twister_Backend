// models/like.js
'use strict';
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Like = sequelize.define(
  "Like",
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
    timestamps: true,
  }
);

Like.associate = (models) => {
  Like.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });

  Like.belongsTo(models.Video, {
    foreignKey: "videoId",
    as: "video",
  });
};

module.exports = Like;