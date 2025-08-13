const ApiResponse = require("../utils/apiResponse");
const Activity = require("../models/Activitie");
const fs = require('fs');
const path = require('path');
const { activityUpload } = require("../middleware/uploadMiddleware");

// exports.insertActivity = async (req, res) => {
//   try {
//     const { name } = req.body;
//     const activity = await Activity.create({
//       name,
//     });
//     return ApiResponse.created(res, "Activity Crested Successfully!", activity);
//   } catch (error) {
//     return ApiResponse.error(res, "activity Creation Failed!", 500, error.message);
//   }
// };
exports.insertActivity = [
  activityUpload.single('image'),
  async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return ApiResponse.error(res, "Name is required!", 400);
      }

      let imageUrl = null;
      let imagePath = null;

      if (req.file) {
        imagePath = req.file.path;
        imageUrl = `/uploads/activities/${req.file.filename}`;
      }

      const activity = await Activity.create({
        name,
        imageUrl,
        imagePath
      });

      return ApiResponse.created(res, "Activity Created Successfully!", activity);
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return ApiResponse.error(res, "Activity Creation Failed!", 500, error.message);
    }
  }
];

exports.updateActivityImage = async (req, res) => {
  try {
    const { id } = req.body;

    // Find the activity
    const activity = await Activity.findByPk(id);
    if (!activity) {
      if (req.file) fs.unlinkSync(req.file.path);
      return ApiResponse.error(res, "Activity not found", 404);
    }

    // Delete old image if it exists
    if (activity.imagePath && fs.existsSync(activity.imagePath)) {
      fs.unlinkSync(activity.imagePath);
    }

    // Process new image
    let imageUrl = null;
    let imagePath = null;

    if (req.file) {
      imagePath = req.file.path;
      imageUrl = `/uploads/activities/${req.file.filename}`;
    }

    // Update the activity
    const updatedActivity = await activity.update({
      imageUrl,
      imagePath
    });

    return ApiResponse.success(res, "Activity image updated successfully", updatedActivity);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Error updating activity image:", error);
    return ApiResponse.error(res, "Failed to update activity image", 500, error.message);
  }
};

exports.getAllActivity = async (req, res) => {
  try {
    const activitys = await Activity.findAll();
    return ApiResponse.success(res, "Activity Fetched Successfully!", activitys);
  } catch (error) {
    return ApiResponse.error(res, "Activity Fetched Failed!", 500, error.message);
  }
};
