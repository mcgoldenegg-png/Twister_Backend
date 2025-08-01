const { Video, User, Rating, Like, Continent, VideoContinentRating } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const sequelize = require("../config/database");

// exports.likeUnlikeVideo = async (req, res) => {
//   const { videoId, userId } = req.body;
//   const transaction = await sequelize.transaction(); 

//   try {
//     // Check if user exists
//     const user = await User.findByPk(userId, { transaction });
//     if (!user) {
//       await transaction.rollback();
//       return ApiResponse.error(res, "User not found", 404);
//     }

//     // Check if video exists
//     const video = await Video.findByPk(videoId, { transaction });
//     if (!video) {
//       await transaction.rollback();
//       return ApiResponse.error(res, "Video not found", 404);
//     }

//     // Check if like already exists
//     const existingLike = await Like.findOne({
//       where: { videoId, userId },
//       transaction
//     });

//     if (existingLike) {
//       // Remove like
//       await existingLike.destroy({ transaction });

//       // Ensure activityIndex never goes below 0
//       const newValue = Math.max(0, video.activityIndex - 1);
//       await Video.update(
//         { activityIndex: newValue },
//         {
//           where: { id: videoId },
//           transaction
//         }
//       );

//       await transaction.commit();
//       return ApiResponse.success(res, "Like removed successfully");
//     } else {
//       // Create like
//       await Like.create({ videoId, userId }, { transaction });

//       await Video.update(
//         { activityIndex: sequelize.literal('activityIndex + 1') },
//         {
//           where: { id: videoId },
//           transaction
//         }
//       );

//       await transaction.commit();
//       return ApiResponse.success(res, "Video liked successfully");
//     }
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error toggling like:", error);
//     return ApiResponse.error(
//       res,
//       "An error occurred while liking/unliking the video",
//       500
//     );
//   }
// };

exports.likeUnlikeVideo = async (req, res) => {
  const { videoId, userId, continentId } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Check if user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return ApiResponse.error(res, "User not found", 404);
    }

    // Check if video exists
    const video = await Video.findByPk(videoId, { transaction });
    if (!video) {
      await transaction.rollback();
      return ApiResponse.error(res, "Video not found", 404);
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
      where: { videoId, userId },
      transaction
    });

    if (existingLike) {
      await transaction.rollback();
      return ApiResponse.success(res, "User has already liked this video");
    } else {
      // Create like
      await Like.create({ videoId, userId }, { transaction });

      // Add 1-star rating when liking
      const existingRating = await Rating.findOne({
        where: { videoId, userId },
        transaction
      });

      if (!existingRating) {
        await Rating.create({
          videoId,
          userId,
          continentId,
          stars: 1
        }, { transaction });

        await VideoContinentRating.findOrCreate({
          where: { videoId, continentId },
          transaction
        });
      }

      await transaction.commit();
      return ApiResponse.success(res, "Video liked and rated successfully");
    }
  } catch (error) {
    await transaction.rollback();
    console.error("Error toggling like:", error);
    return ApiResponse.error(
      res,
      "An error occurred while liking/unliking the video",
      500
    );
  }
};

exports.getLikesByVideoId = async (req, res) => {
  const { videoId } = req.body;
  try {
    // Check if video exists
    const checkVideo = await Video.findByPk(videoId);
    if (!checkVideo) {
      return ApiResponse.error(res, "Video not found", 404);
    }
    // Find the video by ID
    const video = await Video.findByPk(videoId, {
      include: [
        {
          model: Like,
          as: "likes",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!video) {
      return ApiResponse.error(res, "Video not found", 404);
    }

    // Return the likes associated with the video
    return ApiResponse.success(
      res,
      "Likes retrieved successfully",
      video.likes
    );
  } catch (error) {
    console.error("Error retrieving likes:", error);
    return ApiResponse.error(
      res,
      "An error occurred while retrieving likes",
      500
    );
  }
};

exports.getVideoLikeCount = async (req, res) => {
  const { videoId } = req.body;

  try {
    // Get like count
    const likeCount = await Like.count({
      where: { videoId },
    });

    // Get rating continents information
    const ratingContinents = await Rating.findAll({
      where: { videoId },
      attributes: [
        'continentId',
        [sequelize.fn('COUNT', sequelize.col('Rating.id')), 'ratingCount'],
        [sequelize.fn('AVG', sequelize.col('Rating.stars')), 'averageRating']
      ],
      include: [{
        model: Continent,
        as: 'ratingContinent',
        attributes: ['id', 'name']
      }],
      group: ['Rating.continentId'],
      order: [[sequelize.fn('COUNT', sequelize.col('Rating.id')), 'DESC']],
      raw: true
    });

    // Format the response
    const response = {
      videoId,
      likeCount,
      ratingContinents: ratingContinents.map(item => ({
        continentId: item.continentId,
        name: item['ratingContinent.name'],
        ratingCount: item.ratingCount,
        averageRating: parseFloat(item.averageRating).toFixed(2)
      }))
    };

    return ApiResponse.success(res, "Video statistics fetched successfully", response);
  } catch (error) {
    console.error("Error fetching video statistics:", error);
    return ApiResponse.error(res, "Failed to fetch data", 500);
  }
};