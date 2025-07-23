const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Continent = sequelize.define(
  "Continents",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    timestamps: true,
  }
);

Continent.associate = (models) => {
  Continent.hasMany(models.Country, {
    foreignKey: "continentId",
    as: "countries",
  });
  Continent.hasMany(models.Video, {
    foreignKey: "continentId",
    as: "videos",
  });
  Continent.belongsToMany(models.Video, {
    through: "VideoContinentRating",
    foreignKey: "continentId",
    otherKey: "videoId",
    as: "ratedVideos",
  });

};


module.exports = Continent;
