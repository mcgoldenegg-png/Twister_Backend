const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Video = sequelize.define(
  "Video",
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
    continentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Continents",
        key: "id",
      },
    },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Activities",
        key: "id",
      },
    },
    // countryId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "Countries",
    //     key: "id",
    //   },
    // },
    isWorldStar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isShared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isPromotion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    thumbnailPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define associations
Video.associate = (models) => {
  // A Video belongs to a User
  Video.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });

  // A Video belongs to a Continent
  Video.belongsTo(models.Continent, {
    foreignKey: "continentId",
    as: "continent",
  });

  // A Video belongs to an Activity
  Video.belongsTo(models.Activity, {
    foreignKey: "activityId",
    as: "activity",
  });

  // Video.belongsTo(models.Country, {
  //   foreignKey: "countryId",
  //   as: "countries",
  // });

  // A Video can have many Ratings
  Video.hasMany(models.Rating, {
    foreignKey: "videoId",
    as: "ratings",
  });

  // A Video can have many Likes
  Video.hasMany(models.Like, {
    foreignKey: "videoId",
    as: "likes",
  });

  // A Video can have many Reports
  Video.hasMany(models.Report, {
    foreignKey: "videoId",
    as: "reports",
  });

  Video.belongsToMany(models.Continent, {
    through: "VideoContinentRating",
    foreignKey: "videoId",
    otherKey: "continentId",
    as: "ratingContinents",
  });

};

module.exports = Video;
