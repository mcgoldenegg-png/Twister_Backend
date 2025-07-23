const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Activitie = sequelize.define(
  "Activities",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

Activitie.associate = (models) => {
  Activitie.hasMany(models.Video, {
    foreignKey: "activityId",
    as: "videos",
  });
};

module.exports = Activitie;
