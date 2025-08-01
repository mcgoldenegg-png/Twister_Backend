const { Video, User, Rating, Like, Continent, Activity } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const { Sequelize } = require("sequelize");
const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set the FFmpeg path explicitly
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require("fs");
const path = require("path");


exports.uploadVideoLocal = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, "No file uploaded", 400);
    }

    // Verify user exists
    const user = await User.findByPk(req.user.id);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return ApiResponse.error(res, "User not found", 404);
    }

    // Validate required fields
    if (!req.body.continentId || !req.body.activityId) {
      fs.unlinkSync(req.file.path);
      return ApiResponse.error(res, "Continent ID and Activity ID are required", 400);
    }

    const inputPath = req.file.path;
    const watermarkedFilename = `watermarked_${req.file.filename}`;
    const outputPath = path.join('videos', watermarkedFilename);
    const watermarkPath = path.join('assets', 'mark.png');

    // Check if watermark exists
    if (!fs.existsSync(watermarkPath)) {
      fs.unlinkSync(inputPath);
      return ApiResponse.error(res, "Watermark image not found", 400);
    }

    // Process video with watermark
    // await new Promise((resolve, reject) => {
    //   ffmpeg(inputPath)
    //     .input(watermarkPath)
    //     .complexFilter([
    //       // First scale the watermark to 150x150
    //       {
    //         filter: 'scale',
    //         options: {
    //           w: 450,
    //           h: 150
    //         },
    //         inputs: '[1]',  // Apply to watermark (second input)
    //         outputs: 'scaled_wm'
    //       },
    //       // Then overlay the scaled watermark at top-right
    //       {
    //         filter: 'overlay',
    //         options: {
    //           x: 'main_w-overlay_w-30', // 10px from right
    //           y: 60                    // 10px from top
    //         },
    //         inputs: ['0', 'scaled_wm']
    //       }
    //     ])
    //     .on('start', (commandLine) => {
    //       console.log('Spawned FFmpeg with command: ' + commandLine);
    //     })
    //     .on('progress', (progress) => {
    //       // console.log(`Processing: ${JSON.stringify(progress)}% done`);
    //     })
    //     .on('error', (err) => {
    //       console.error('Error:', err);
    //       fs.unlinkSync(inputPath);
    //       reject(err);
    //     })
    //     .on('end', () => {
    //       console.log('Video processing finished');
    //       resolve();
    //     })
    //     .save(outputPath);
    // });
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .input(watermarkPath)
        .complexFilter([
          // Force watermark to a fixed width of 200px (adjust as needed), keeping aspect ratio
          {
            filter: 'scale',
            options: {
              w: 200,
              h: -1
            },
            inputs: '1',
            outputs: 'wm_scaled'
          },
          // Overlay at top-right corner with consistent margin
          {
            filter: 'overlay',
            options: {
              x: 'main_w-overlay_w-30', // 30px from right edge
              y: 40                      // 40px from top
            },
            inputs: ['0', 'wm_scaled']
          }
        ])
        .on('start', (commandLine) => {
          console.log('Spawned FFmpeg with command: ' + commandLine);
        })
        .on('error', (err) => {
          console.error('Error:', err);
          fs.unlinkSync(inputPath);
          reject(err);
        })
        .on('end', () => {
          console.log('Video processing finished');
          resolve();
        })
        .save(outputPath);
    });

    // Create video record in database
    const video = await Video.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      fileName: watermarkedFilename,
      filePath: outputPath,
      fileSize: fs.statSync(outputPath).size,
      mimeType: req.file.mimetype,
      fileUrl: `/videos/${watermarkedFilename}`,
      continentId: req.body.continentId,
      activityId: req.body.activityId,
      isPromotion: req.body.isPromotion || false,
    });

    // Clean up original file
    fs.unlinkSync(inputPath);

    return ApiResponse.created(res, "Video uploaded and watermarked successfully", video);
  } catch (error) {
    console.error("Upload error:", error);
    // Clean up any remaining files
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    return ApiResponse.error(res, "Failed to upload video", 500, error);
  }
};
// exports.uploadVideoLocal = async (req, res) => {
//   let outputPath; // Define outputPath at the start
//   let thumbnailPath; // Define thumbnailPath at the start
//   try {
//     if (!req.file) {
//       return ApiResponse.error(res, "No file uploaded", 400);
//     }

//     // Verify user exists
//     const user = await User.findByPk(req.user.id);
//     if (!user) {
//       fs.unlinkSync(req.file.path);
//       return ApiResponse.error(res, "User not found", 404);
//     }

//     // Validate required fields
//     if (!req.body.continentId || !req.body.activityId) {
//       fs.unlinkSync(req.file.path);
//       return ApiResponse.error(res, "Continent ID and Activity ID are required", 400);
//     }

//     const inputPath = req.file.path;
//     const watermarkedFilename = `watermarked_${req.file.filename}`;
//     outputPath = path.join('videos', watermarkedFilename); // Assign outputPath
//     const watermarkPath = path.join('assets', 'mark.png');
//     const thumbnailFilename = `thumb_${req.file.filename.replace(/\.[^/.]+$/, '')}.jpg`;
//     thumbnailPath = path.join('thumbnails', thumbnailFilename); // Assign thumbnailPath

//     // Check if watermark exists
//     if (!fs.existsSync(watermarkPath)) {
//       fs.unlinkSync(inputPath);
//       return ApiResponse.error(res, "Watermark image not found", 400);
//     }

//     // Ensure thumbnails directory exists
//     if (!fs.existsSync('thumbnails')) {
//       fs.mkdirSync('thumbnails', { recursive: true });
//     }

//     // Process video with watermark and generate thumbnail with watermark
//     await new Promise((resolve, reject) => {
//       ffmpeg(inputPath)
//         .input(watermarkPath)
//         .complexFilter([
//           // Scale the watermark to 450x150 for video
//           {
//             filter: 'scale',
//             options: {
//               w: 450,
//               h: 150
//             },
//             inputs: '[1]', // Apply to watermark (second input)
//             outputs: 'scaled_wm_video'
//           },
//           // Overlay the scaled watermark on the video at top-right
//           {
//             filter: 'overlay',
//             options: {
//               x: 'main_w-overlay_w-30', // 10px from right
//               y: 60                    // 10px from top
//             },
//             inputs: ['0', 'scaled_wm_video'],
//             outputs: 'watermarked'
//           },
//           // Scale the main video to 300x300 for thumbnail
//           {
//             filter: 'scale',
//             options: {
//               w: 300,
//               h: 300
//             },
//             inputs: '[0]', // Use main video input
//             outputs: 'thumb_scaled'
//           },
//           // Scale the watermark to 150x50 for thumbnail
//           {
//             filter: 'scale',
//             options: {
//               w: 150,
//               h: 50
//             },
//             inputs: '[1]', // Apply to watermark (second input)
//             outputs: 'scaled_wm_thumb'
//           },
//           // Overlay the scaled watermark on the thumbnail
//           {
//             filter: 'overlay',
//             options: {
//               x: 'main_w-overlay_w-10', // 10px from right
//               y: 10                    // 10px from top
//             },
//             inputs: ['thumb_scaled', 'scaled_wm_thumb'],
//             outputs: 'thumb'
//           }
//         ])
//         .output(thumbnailPath)
//         .outputOptions([
//           '-map [thumb]', // Map the watermarked thumbnail output
//           '-vframes 1',   // Extract one frame
//           '-ss 5'         // At 5 seconds
//         ])
//         .output(outputPath)
//         .outputOptions([
//           '-map [watermarked]' // Map the watermarked video output
//         ])
//         .on('start', (commandLine) => {
//           console.log('Spawned FFmpeg with command: ' + commandLine);
//         })
//         .on('progress', (progress) => {
//           // console.log(`Processing: ${JSON.stringify(progress)}% done`);
//         })
//         .on('error', (err) => {
//           console.error('Error:', err);
//           fs.unlinkSync(inputPath);
//           reject(err);
//         })
//         .on('end', () => {
//           console.log('Video processing and thumbnail generation finished');
//           resolve();
//         })
//         .run();
//     });

//     // Create video record in database
//     const video = await Video.create({
//       userId: req.user.id,
//       originalName: req.file.originalname,
//       fileName: watermarkedFilename,
//       filePath: outputPath,
//       fileSize: fs.statSync(outputPath).size,
//       mimeType: req.file.mimetype,
//       fileUrl: `/videos/${watermarkedFilename}`,
//       thumbnailPath: `/thumbnails/${thumbnailFilename}`,
//       continentId: req.body.continentId,
//       activityId: req.body.activityId,
//     });

//     // Clean up original file
//     fs.unlinkSync(inputPath);

//     return ApiResponse.created(res, "Video uploaded, watermarked, and thumbnail generated successfully", video);
//   } catch (error) {
//     console.error("Upload error:", error);
//     // Clean up any remaining files
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
//     if (outputPath && fs.existsSync(outputPath)) {
//       fs.unlinkSync(outputPath);
//     }
//     if (thumbnailPath && fs.existsSync(thumbnailPath)) {
//       fs.unlinkSync(thumbnailPath);
//     }
//     return ApiResponse.error(res, "Failed to upload video", 500, error);
//   }
// };

exports.editVideo = async (req, res) => {
  try {
    const { id, title, description, continentId, activityId } = req.body;
    const userId = req.user.id;
    const video = await Video.findOne({
      where: {
        id,
        userId
      }
    });

    if (!video) {
      return ApiResponse.error(res, "Video not found or unauthorized", 404);
    }

    const updatableFields = {};
    if (title) updatableFields.title = title;
    if (description) updatableFields.description = description;
    if (continentId) updatableFields.continentId = continentId;
    if (activityId) updatableFields.activityId = activityId;

    if (Object.keys(updatableFields).length > 0) {
      await video.update(updatableFields);
      return ApiResponse.success(res, "Video updated successfully", video);
    }

    return ApiResponse.error(res, "No valid fields provided for update", 400);

  } catch (error) {
    console.error("Edit video error:", error);
    return ApiResponse.error(res, "Failed to update video", 500, error);
  }
};

exports.getUserVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({
      where: { userId: req.user.id },
      attributes: ["id", "title", "description", "fileName"],
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Continent, as: "continent", attributes: ["id", "name"] },
        {
          model: Rating,
          as: "ratings",
          attributes: ["id", "stars", "createdAt"],
          include: [{ model: User, as: "user", attributes: ["id", "name"] }],
        },
        {
          model: Like,
          as: "likes",
          attributes: ["id", "createdAt"],
          include: [{ model: User, as: "user", attributes: ["id", "name"] }],
        },
      ],
    });

    // Map through videos and add URL to each
    const videosWithUrls = videos.map((video) => ({
      ...video.get({ plain: true }),
      url: `/videos/${video.fileName}`,
    }));
    return ApiResponse.success(
      res,
      "User videos fetched successfully",
      videos
    );
  } catch (error) {
    console.error("Error fetching videos:", error);
    return ApiResponse.error(res, "Failed to fetch videos", 500, error);
  }
};

// In your video controller file
exports.getPromotionVideos = async (req, res) => {
  try {
    const { userId } = req.body; 

    // Validate input
    if (!userId) {
      return ApiResponse.error(res, "User ID is required", 400);
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    // Get all promotion videos for this user
    const promotionVideos = await Video.findAll({
      where: {
        userId,
        isPromotion: true
      },
      include: [
        // {
        //   model: User,
        //   as: 'user',
        //   attributes: ['id', 'username', 'profilePicture']
        // },
        {
          model: Continent,
          as: 'continent',
          attributes: ['id', 'name']
        },
        {
          model: Activity,
          as: 'activity',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return ApiResponse.success(res, "Promotion videos retrieved successfully", promotionVideos);
  } catch (error) {
    console.error("Error getting promotion videos:", error);
    return ApiResponse.error(
      res,
      "An error occurred while getting promotion videos",
      500
    );
  }
};

// exports.getAllVideos = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     const sort = req.query.sort || 'latest';
//     const continentId = req.query.continentId;
//     const activityId = req.query.activityId;

//     let order = [['createdAt', 'DESC']]; // Default sort: latest
//     if (sort === 'popular') {
//       order = [['viewCount', 'DESC']];
//     }

//     // Build where clause dynamically
//     const where = {};
//     if (continentId) where.continentId = continentId;
//     if (activityId) where.activityId = activityId;

//     const { count, rows: videos } = await Video.findAndCountAll({
//       where,
//       attributes: {
//         include: [
//           [
//             Sequelize.literal(`(
//               SELECT COUNT(*) FROM Likes AS likes
//               WHERE likes.videoId = Video.id
//             )`),
//             "likeCount",
//           ],
//         ],
//         exclude: ["filePath", "fileSize", "mimeType", "originalName"],
//       },
//       include: [
//         { model: User, as: "user", attributes: ["id", "name", "profileImage"] },
//         { model: Continent, as: "continent", attributes: ["id", "name"] },
//         {
//           model: Rating,
//           as: "ratings",
//           attributes: ["id", "stars"],
//           include: [{ model: User, as: "user", attributes: ["id", "name"] }],
//         },
//         {
//           model: Like,
//           as: "likes",
//           attributes: [],
//         },
//         {
//           model: Continent,
//           as: "ratingContinents",
//           attributes: ["id", "name"]
//         }
//       ],
//       order,
//       limit,
//       offset,
//       subQuery: false,
//     });

//     // Map through videos and add URL to each
//     const videosWithUrls = videos.map((video) => ({
//       ...video.get({ plain: true }),
//       url: `/videos/${video.fileName}`,
//     }));

//     return ApiResponse.success(res, "All videos fetched successfully", {
//       total: count,
//       page,
//       totalPages: Math.ceil(count / limit),
//       videos: videosWithUrls,
//     });
//   } catch (error) {
//     console.error("Error fetching all videos:", error);
//     return ApiResponse.error(res, "Failed to fetch videos", 500, error);
//   }
// };
exports.getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sort = req.query.sort || 'latest';
    const continentId = req.query.continentId;
    const activityId = req.query.activityId;

    let order = [['createdAt', 'DESC']];
    if (sort === 'popular') {
      order = [['viewCount', 'DESC']];
    }

    // Build where clause for videos
    const videoWhere = {};
    if (continentId) videoWhere.continentId = continentId;
    if (activityId) videoWhere.activityId = activityId;

    // Get total count of videos with their ratings (including duplicates)
    const totalCount = await Video.count({
      where: videoWhere,
      include: [{
        model: Rating,
        as: 'ratings',
        required: true,
        attributes: [],
        duplicating: false
      }],
      distinct: true
    });

    // Get paginated videos with all their ratings
    const videos = await Video.findAll({
      where: videoWhere,
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*) FROM Likes AS likes
              WHERE likes.videoId = Video.id
            )`),
            "likeCount",
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*) FROM Ratings AS ratings
              WHERE ratings.videoId = Video.id
            )`),
            "ratingCount",
          ],
        ],
        exclude: ["filePath", "fileSize", "mimeType", "originalName"],
      },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "profileImage"] },
        { model: Continent, as: "continent", attributes: ["id", "name"] },
        // {
        //   model: Rating,
        //   as: "ratings",
        //   attributes: ["id", "stars", "userId", "createdAt"],
        //   include: [{ model: User, as: "user", attributes: ["id", "name"] }],
        // },
        {
          model: Like,
          as: "likes",
          attributes: [],
        },
        {
          model: Continent,
          as: "ratingContinents",
          attributes: ["id", "name"]
        }
      ],
      order,
      limit,
      offset,
      subQuery: false,
    });

    // Process videos
    const videosWithUrls = videos.map((video) => {
      const plainVideo = video.get({ plain: true });
      return {
        ...plainVideo,
        url: `/videos/${video.fileName}`,
      };
    });

    return ApiResponse.success(res, "All videos fetched successfully", {
      page,
      totalPages: Math.ceil(totalCount / limit),
      videos: videosWithUrls,
    });
  } catch (error) {
    console.error("Error fetching all videos:", error);
    return ApiResponse.error(res, "Failed to fetch videos", 500, error);
  }
};

exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      where: { id: req.body.id },
    });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    return ApiResponse.success(res, "video fetched successfully", {
      id: video.id,
      title: video.title,
      originalName: video.originalName,
      size: video.fileSize,
      createdAt: video.createdAt,
      url: video.filePath ? `/videos/${video.fileName}` : video.fileUrl,
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return ApiResponse.success(res, "Failed to fetch video", 500, error);
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // For S3 videos
    if (video.fileUrl) {
      return res.redirect(video.fileUrl);
    }

    // For local videos
    const videoPath = path.join(__dirname, "..", video.filePath);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle partial content (streaming)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": video.mimeType,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Handle full video download
      const head = {
        "Content-Length": fileSize,
        "Content-Type": video.mimeType,
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Streaming error:", error);
    res.status(500).json({ error: "Failed to stream video" });
  }
};


// // FFmpeg command to overlay watermark at bottom right
// // const cmd = `ffmpeg -i "${videoPath}" -i "${watermarkPath}" -filter_complex "overlay=W-w-10:H-h-10" -codec:a copy "${outputPath}"`;
// const cmd = `ffmpeg -i "${videoPath}" -i "${watermarkPath}" -filter_complex "[1]scale=100:-1[wm];[0][wm]overlay=10:10" -codec:a copy "${outputPath}"`;


// exec(cmd, (error, stdout, stderr) => {
//   if (error) {
//     // Only send response once
//     if (!res.headersSent) {
//       return res.status(500).send('Error processing video');
//     }
//     return;
//   }

//   // Ensure the file exists before trying to download
//   fs.access(outputPath, fs.constants.F_OK, (err) => {
//     if (err) {
//       if (!res.headersSent) {
//         return res.status(500).send('Watermarked video not found');
//       }
//       return;
//     }

//     return res.status(200).json({
//       outputPath
//     });
//     // // res.download has a callback for errors
//     // res.download(outputPath, (err) => {
//     //   if (err && !res.headersSent) {
//     //     return res.status(500).send('Error sending file');
//     //   }
//     //   // Optionally, clean up files after download
//     //   fs.unlinkSync(videoPath);
//     //   fs.unlinkSync(outputPath);
//     // });
//   });
// });

//  const videoPath = req.file.path;
//   const outputPath = path.join('videos', `watermarked_${req.file.filename}`);
//   const watermarkPath = path.join('assets', 'logo.png');
//   // FFmpeg command to overlay watermark at bottom right
//   const cmd = `ffmpeg -i ${videoPath} -i ${watermarkPath} -filter_complex "overlay=W-w-10:H-h-10" -codec:a copy ${outputPath}`;

//   exec(cmd, (error, stdout, stderr) => {
//     if (error) {
//       return res.status(500).send('Error processing video');
//     }
//     res.download(outputPath);
//   });