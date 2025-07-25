const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // get .jpg, .png etc.
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/png",
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, JPG, PNG, and WEBP images are allowed!"), false);
        }
    },
});

// Protect all user routes
router.use(authMiddleware);
// Get user profile
router.get("/getUserProfile", userController.getUserProfile);
// Update user profile
router.post(
    "/updateUserProfile",
    upload.single("profileImage"),
    userController.updateUserProfile
);
// Delete user account
router.delete("/deleteUserAccount", userController.deleteUserAccount);
// Export the router
module.exports = router;
