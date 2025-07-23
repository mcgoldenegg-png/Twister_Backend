const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VideoContinentRating = sequelize.define(
  "VideoContinentRating",
  {
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Videos",
        key: "id",
      },
    },
    continentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Continents",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["videoId", "continentId"],
      },
    ],
  }
);

module.exports = VideoContinentRating;
