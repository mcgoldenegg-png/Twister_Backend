const ApiResponse = require("../utils/apiResponse");
const Activity = require("../models/Activitie");

exports.insertActivity = async (req, res) => {
  try {
    const { name } = req.body;
    const activity = await Activity.create({
      name,
    });
    return ApiResponse.created(res, "Activity Crested Successfully!", activity);
  } catch (error) {
    return ApiResponse.error(res, "activity Creation Failed!", 500, error.message);
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
