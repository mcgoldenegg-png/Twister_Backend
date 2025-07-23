const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        countryCode: {
            type: DataTypes.STRING(5),
            allowNull: false,
            defaultValue: "+1",
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verificationCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        verificationCodeExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

User.associate = (models) => {
    User.hasMany(models.Video, {
        foreignKey: "userId",
        as: "video",
    });

    User.hasMany(models.Rating, {
        foreignKey: "userId",
        as: "ratings",
    });

    User.hasMany(models.Like, {
        foreignKey: "userId",
        as: "likes",
    });

    User.hasMany(models.Report, {
        foreignKey: "userId",
        as: "reports",
    });
};

module.exports = User;