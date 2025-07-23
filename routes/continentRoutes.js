const express = require('express');
const router = express.Router();
const continentController = require('../controllers/ContinentController');
// const authMiddleware = require("../middleware/authMiddleware");

// // Protect all video routes
// router.use(authMiddleware);

router.post('/insertContinent', continentController.insertContinent);

router.get('/getAllContinent', continentController.getAllContinent);

module.exports = router;