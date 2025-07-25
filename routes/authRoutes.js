const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.initiateLogin);
router.post("/verify", authController.verifyLogin);
router.post('/refreshToken', authController.refreshToken);

module.exports = router;
