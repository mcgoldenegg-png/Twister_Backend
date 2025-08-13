const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');
const authMiddleware = require("../middleware/authMiddleware");

// Protect all video routes
router.use(authMiddleware);

// Create Help
router.post('/createHelp', helpController.createHelp);

// Get All Help Items
router.get('/getAllHelp', helpController.getAllHelp);

module.exports = router;