const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Rating = sequelize.define(
  "Rating",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    continentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Continents",
        key: "id",
      },
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 7,
      },
    },
  },
  {
    timestamps: true,
  }
);

Rating.associate = (models) => {
  Rating.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });

  Rating.belongsTo(models.Video, {
    foreignKey: "videoId",
    as: "video",
  });
};

module.exports = Rating;