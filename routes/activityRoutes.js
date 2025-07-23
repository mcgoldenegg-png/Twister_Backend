const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
// const authMiddleware = require("../middleware/authMiddleware");

// // Protect all video routes
// router.use(authMiddleware);

router.post('/insertActivity', activityController.insertActivity);

router.get('/getAllActivity', activityController.getAllActivity);

module.exports = router;