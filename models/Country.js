const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Country = sequelize.define(
    "Countries",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        emoji: {
            type: DataTypes.STRING, // e.g., "🇺🇸"
            allowNull: false,
        },
        dial_code: {
            type: DataTypes.STRING, // e.g., "+1"
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
    },
    {
        timestamps: true,
        indexes: [
            { fields: ["name"] },
            { fields: ["continentId"] },
        ],
    }
);

Country.associate = (models) => {
    Country.belongsTo(models.Continent, {
        foreignKey: "continentId",
        as: "continent",
    });

    Country.hasMany(models.Video, {
        foreignKey: "countryId",
        as: "videos",
    });
};

module.exports = Country;