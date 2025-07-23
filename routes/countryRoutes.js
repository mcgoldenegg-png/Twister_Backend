const express = require('express');
const router = express.Router();
const CountryController = require('../controllers/CountryController');
// const authMiddleware = require("../middleware/authMiddleware");

// // Protect all video routes
// router.use(authMiddleware);

// GET /countries?continent=Europe&search=Ger&page=1&limit=10
router.get('/getAllCountry', CountryController.getAllCountry);

module.exports = router;