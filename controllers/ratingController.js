const { Video, User, Rating, Like, Continent, Country, VideoContinentRating } = require("../models");
const sequelize = require("../config/database");
const ApiResponse = require("../utils/apiResponse");

exports.rateVideo = async (req, res) => {
  const { userId, videoId, continentId, stars } = req.body;
  try {
    // Check if the video exists
    const video = await Video.findByPk(videoId);
    if (!video) {
      return ApiResponse.error(res, "Video not found", 404);
    }

    if (stars < 1 || stars > 7) {
      return ApiResponse.error(res, 'Rating must be between 1 and 7 stars', 400);
    }

    // // Check if the user has already rated the video
    // const existingRating = await Rating.findOne({
    //   where: { videoId, userId }
    // });

    // if (existingRating) {
    //   existingRating.stars = stars;
    //   await existingRating.save();
    //   return ApiResponse.success(res, "Rating updated successfully", existingRating);
    // }

    // Create a new rating
    const newRating = await Rating.create({ videoId, userId, continentId, stars });
    await VideoContinentRating.findOrCreate({
      where: { videoId, continentId }
    });

    return ApiResponse.success(res, "Video rated successfully", newRating);
  } catch (error) {
    console.error("Error rating video:", error);
    return ApiResponse.error(
      res,
      "An error occurred while rating the video",
      500
    );
  }
};

exports.updateRating = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.id;
  const { rating } = req.body;

  try {
    // Check if the video exists
    const video = await Video.findByPk(videoId);
    if (!video) {
      return ApiResponse.error(res, "Video not found", 404);
    }

    // Check if the user has rated the video
    const existingRating = await Rating.findOne({
      where: { videoId, userId },
    });

    if (!existingRating) {
      return ApiResponse.error(res, "You have not rated this video", 400);
    }

    // Update the rating
    existingRating.rating = rating;
    await existingRating.save();

    return ApiResponse.success(
      res,
      "Video rating updated successfully",
      existingRating
    );
  } catch (error) {
    console.error("Error updating video rating:", error);
    return ApiResponse.error(
      res,
      "An error occurred while updating the video rating",
      500
    );
  }
};

exports.getVideoRating = async (req, res) => {
  const videoId = req.params.videoId;

  try {
    // Check if the video exists
    const video = await Video.findByPk(videoId);
    if (!video) {
      return ApiResponse.error(res, "Video not found", 404);
    }

    // Get the average rating for the video
    const ratings = await Rating.findAll({
      where: { videoId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      ],
    });

    const averageRating = ratings[0].get("averageRating") || 0;

    return ApiResponse.success(res, "Video rating retrieved successfully", {
      averageRating,
    });
  } catch (error) {
    console.error("Error retrieving video rating:", error);
    return ApiResponse.error(
      res,
      "An error occurred while retrieving the video rating",
      500
    );
  }
};
