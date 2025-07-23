const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.initiateLogin);
router.post("/verify", authController.verifyLogin);

module.exports = router;
