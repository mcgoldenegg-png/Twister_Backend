const express = require('express');
const router = express.Router();
const continentController = require('../controllers/continentController');
const authMiddleware = require("../middleware/authMiddleware");
const { activityUpload, continentUpload } = require('../middleware/uploadMiddleware');

// Protect all video routes
router.use(authMiddleware);

router.post('/insertContinent', continentController.insertContinent);

router.post('/updateContinent', continentUpload.single("image"), continentController.updateContinentImage);

router.get('/getAllContinent', continentController.getAllContinent);

module.exports = router;