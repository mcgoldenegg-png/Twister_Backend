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
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
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
  Continent.hasMany(models.Video, {
    foreignKey: "continentId",
    as: "user",
  });
  Continent.belongsToMany(models.Video, {
    through: "VideoContinentRating",
    foreignKey: "continentId",
    otherKey: "videoId",
    as: "ratedVideos",
  });

};


module.exports = Continent;
