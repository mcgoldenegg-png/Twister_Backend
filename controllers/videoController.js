const { Video, User, Rating, Like, Continent, Activity } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { uploadToS3, updateInS3 } = require("../middleware/s3Middleware");
const { compressVideo, processVideoWithWatermark, cleanTempFiles, isCloudFrontUrl } = require("../utils/videoService");


exports.uploadOnBucket = async (req, res) => {
  // Initialize all file paths
  let tempPaths = {
    original: req.file?.path || '',
    compressed: '',
    watermarked: ''
  };

  try {
    // 1. Validate request
    if (!req.file) {
      return ApiResponse.error(res, "No file uploaded", 400);
    }

    // 2. Verify user exists
    const user = await User.findByPk(req.user.id);
    if (!user) {
      cleanTempFiles(tempPaths);
      return ApiResponse.error(res, "User not found", 404);
    }

    // 3. Validate required fields
    if (!req.body.continentId || !req.body.activityId) {
      cleanTempFiles(tempPaths);
      return ApiResponse.error(res, "Continent ID and Activity ID are required", 400);
    }

    // 4. Prepare directories and paths
    const tempDir = path.join(__dirname, '../videos');
    const assetsDir = path.join(__dirname, '../assets');

    // Create directories if they don't exist
    [tempDir, assetsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // 5. Check watermark exists
    const watermarkPath = path.join(assetsDir, 'mark.png');
    if (!fs.existsSync(watermarkPath)) {
      cleanTempFiles(tempPaths);
      return ApiResponse.error(res, "Watermark image not found", 400);
    }

    // 6. Generate safe filenames
    const timestamp = Date.now();
    const ext = path.extname(req.file.originalname);
    const finalFilename = `vid_${timestamp}_wm${ext}`;


    // Set all temporary file paths
    tempPaths.compressed = path.join(tempDir, `${finalFilename}_compressed${ext}`);
    tempPaths.watermarked = path.join(tempDir, `${finalFilename}`);

    // 7. Process video (compression + watermark)
    await compressVideo(tempPaths.original, tempPaths.compressed);
    await processVideoWithWatermark(
      tempPaths.compressed,
      tempPaths.watermarked,
      watermarkPath
    );

    // 8. Verify processed file exists before upload
    if (!fs.existsSync(tempPaths.watermarked)) {
      throw new Error('Processed video file was not created');
    }

    // 9. Upload to S3
    const s3Key = `videos/user_${user.id}/${finalFilename}`;
    const uploadResult = await uploadToS3(
      tempPaths.watermarked,
      process.env.S3_BUCKET_NAME,
      s3Key,
      req.file.mimetype
    );

    // 10. Create database record
    const video = await Video.create({
      userId: user.id,
      originalName: req.file.originalname,
      fileName: finalFilename,
      filePath: s3Key,
      fileSize: fs.statSync(tempPaths.watermarked).size,
      mimeType: req.file.mimetype,
      fileUrl: uploadResult.Location,
      continentId: req.body.continentId,
      activityId: req.body.activityId,
      isPromotion: req.body.isPromotion || false,
      duration: req.body.duration || await getVideoDuration(tempPaths.watermarked)
    });

    // 11. Clean up
    cleanTempFiles(tempPaths);

    return ApiResponse.created(res, "Video uploaded successfully", video);

  } catch (error) {
    console.error("Upload error:", error);
    cleanTempFiles(tempPaths);

    return ApiResponse.error(res,
      error.message.includes('ENOENT')
        ? "File processing failed - temporary files not found"
        : "Video upload failed",
      500,
      error
    );
  }
};

exports.uploadVideoLocal = async (req, res) => {
  let compressedPath = '';
  let watermarkedPath = '';

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

    // ensureDirectoryExists(path.join(__dirname, '../videos'));
    // ensureDirectoryExists(path.join(__dirname, '../assets'));

    // Check if watermark exists
    const watermarkPath = path.join(__dirname, '../assets/mark.png');
    if (!fs.existsSync(watermarkPath)) {
      fs.unlinkSync(req.file.path);
      return ApiResponse.error(res, "Watermark image not found", 400);
    }

    // Generate short filename
    const timestamp = Date.now();
    const ext = path.extname(req.file.originalname);
    const finalFilename = `vid_${timestamp}_wm${ext}`;

    // Step 1: Compress video
    compressedPath = path.join(__dirname, `../videos/${finalFilename}_compressed${ext}`);
    await compressVideo(req.file.path, compressedPath);

    // Step 2: Add watermark
    watermarkedPath = path.join(__dirname, `../videos/${finalFilename}`);
    await processVideoWithWatermark(compressedPath, watermarkedPath, watermarkPath);

    // Get video duration
    const duration = req.body.duration || await getVideoDuration(watermarkedPath);

    // Create video record in database
    const video = await Video.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      fileName: finalFilename,
      filePath: watermarkedPath,
      fileSize: fs.statSync(watermarkedPath).size,
      mimeType: req.file.mimetype,
      fileUrl: `/videos/${finalFilename}`,
      continentId: req.body.continentId,
      activityId: req.body.activityId,
      isPromotion: req.body.isPromotion || false,
      duration: duration
    });

    // Clean up temporary files
    [req.file.path, compressedPath].forEach(filePath => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    return ApiResponse.created(res, "Video processed and uploaded successfully", video);

  } catch (error) {
    console.error("Upload error:", error);

    // Clean up any partial files
    const filesToClean = [
      req.file?.path,
      compressedPath,
      watermarkedPath
    ].filter(filePath => filePath && fs.existsSync(filePath));

    filesToClean.forEach(filePath => {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanError) {
        console.error("Error cleaning up file:", cleanError);
      }
    });

    return ApiResponse.error(res, "Failed to process video", 500, error);
  }
};

exports.editVideo = async (req, res) => {
  let tempFilePath = '';

  try {
    const { videoId } = req.body;
    const video = await Video.findByPk(videoId);

    if (!video) {
      return ApiResponse.error(res, "Video not found", 404);
    }

    // Verify ownership
    if (video.userId !== req.user.id) {
      return ApiResponse.error(res, "Unauthorized", 403);
    }

    const updates = {};
    // Update other fields (continentId, activityId, etc.)

    if (req.file) {
      // Process the new file (watermark, compression, etc.)
      const ext = path.extname(req.file.originalname);
      tempFilePath = path.join('videos', `processed_${Date.now()}${ext}`);

      await processVideoWithWatermark(
        req.file.path,
        tempFilePath,
        path.join('assets', 'mark.png')
      );

      // Determine if this was originally an S3 video
      const isS3 = isCloudFrontUrl(video.fileUrl);
      console.log('isS3: ', isS3);

      if (isS3) {
        const newKey = `videos/user_${req.user.id}/${Date.now()}${ext}`;

        const result = await updateInS3(
          tempFilePath,
          process.env.S3_BUCKET_NAME,
          newKey,
          req.file.mimetype,
          video.filePath
        );

        updates.filePath = result.Key;
        updates.fileUrl = result.Location;
        updates.fileName = path.basename(newKey);
        updates.fileSize = fs.statSync(tempFilePath).size;
        updates.mimeType = req.file.mimetype;
      } else {
        // Handle local file update
        const newFilePath = path.join('videos', `processed_${Date.now()}${ext}`);
        fs.renameSync(tempFilePath, newFilePath);

        // Delete old local file if exists
        if (video.filePath && fs.existsSync(video.filePath)) {
          fs.unlinkSync(video.filePath);
        }

        updates.filePath = newFilePath;
        updates.fileUrl = `/videos/${path.basename(newFilePath)}`;
        updates.fileName = path.basename(newFilePath);
        updates.fileSize = fs.statSync(newFilePath).size;
        updates.mimeType = req.file.mimetype;
      }

      // Clean up processed file
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      // Clean up original upload
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    await video.update(updates);
    return ApiResponse.success(res, "Video updated", video);

  } catch (error) {
    // Clean up any temporary files
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Edit error:", error);
    return ApiResponse.error(res, "Failed to update video", 500, error);
  }
};

exports.getUserVideos = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return ApiResponse.error(res, "User ID is required", 400);
    }

    let order = [['createdAt', 'DESC']];

    const videoWhere = { userId };
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

    return ApiResponse.success(res, "User videos fetched successfully", {
      videos: videosWithUrls,
    });
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return ApiResponse.error(res, "Failed to fetch user videos", 500, error);
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
