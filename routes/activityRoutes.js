const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require("../middleware/authMiddleware");
const { activityUpload } = require('../middleware/uploadMiddleware');

// Protect all video routes
router.use(authMiddleware);

router.post('/insertActivity', activityUpload.single("image"), activityController.insertActivity);

router.post('/updateActivity', activityUpload.single("image"), activityController.updateActivityImage);

router.get('/getAllActivity', activityController.getAllActivity);

module.exports = router;