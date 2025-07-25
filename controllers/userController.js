const User = require("../models/User");
const ApiResponse = require("../utils/apiResponse");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    // Fetch user profile from the database
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "name",
        "continentId",
        "phoneNumber",
        "countryCode",
        "profileImage",
        "isVerified",
      ],
    });

    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    return ApiResponse.success(
      res,
      "User profile retrieved successfully",
      user
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return ApiResponse.error(res, "Internal server error", 500);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch user first
    const user = await User.findByPk(userId);
    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    let profileImagePath = user.profileImage;
      console.log('req.file: ', req.file);

    // If new image is uploaded
    if (req.file) {
      profileImagePath = `/uploads/${req.file.filename}`;

      // Delete old image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, "..", user.profileImage);
        try {
          await unlinkAsync(oldImagePath);
        } catch (err) {
          console.error("Error deleting old profile image:", err);
        }
      }
    }

    // Update user
    await user.update({
      name: req.body?.name || user.name,
      continentId: req.body?.continentId || user.continentId,
      profileImage: profileImagePath,
    });

    const updatedUser = await User.findByPk(userId, {
      attributes: [
        "id",
        "name",
        "continentId",
        "phoneNumber",
        "countryCode",
        "profileImage",
        "isVerified",
      ],
    });

    return ApiResponse.success(
      res,
      "User profile updated successfully",
      updatedUser
    );
  } catch (error) {
    console.error("Error updating user profile:", error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        await unlinkAsync(
          path.join(__dirname, "..", "uploads", req.file.filename)
        );
      } catch (err) {
        console.error("Error cleaning up failed upload:", err);
      }
    }

    return ApiResponse.error(res, "Internal server error", 500);
  }
};

// Delete user account
exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user and delete account
    const user = await User.findByPk(userId);
    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    await user.destroy();
    return ApiResponse.success(res, "User account deleted successfully");
  } catch (error) {
    console.error("Error deleting user account:", error);
    return ApiResponse.error(res, "Internal server error", 500);
  }
};
