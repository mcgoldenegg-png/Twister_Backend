const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const likeController = require("../controllers/likeController");
const ratingController = require("../controllers/ratingController");
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// Protect all video routes
router.use(authMiddleware);

// Upload video endpoint
router.post(
  "/upload",
  upload.single("video"),
  videoController.uploadVideoLocal
  // videoController.uploadOnBucket
);

// Get all videos for authenticated user
router.get("/getUserVideos", videoController.getUserVideos);

router.get('/getAllVideos', videoController.getAllVideos); // Use ?page=2&limit=20
router.post('/getPromotionVideos', videoController.getPromotionVideos);

// Get single video
router.post("/getVideo", videoController.getVideo);
router.get("/stream/:id", videoController.streamVideo);
router.post("/editVideo", upload.single("video"), videoController.editVideo);

// likeUnlikeVideo video
router.post("/likeUnlikeVideo", likeController.likeUnlikeVideo);
// get all likes for a video
router.post("/getVideoLikeCount", likeController.getVideoLikeCount);

// rate video
router.post("/rateVideo", ratingController.rateVideo);

// report to Video
router.post("/reportVideo", reportController.reportVideo);

module.exports = router;
