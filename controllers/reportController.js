const { Video, User, Report} = require("../models");
const ApiResponse = require("../utils/apiResponse");

exports.reportVideo = async (req, res) => {
  const { reason, videoId, userId } = req.body;

  try {
    // Check if the video exists
    const video = await Video.findByPk(videoId);
    if (!video) {
      return ApiResponse.error(res, "Video not found", 404);
    }

    // Check if the user has already reported the video
    const existingReport = await Report.findOne({
      where: { videoId, userId },
    });

    if (existingReport) {
      return ApiResponse.error(res, "You have already reported this video", 400);
    }

    // Create a new report
    const report = await Report.create({ videoId, userId, reason });

    return ApiResponse.success(res, "Video reported successfully", report);
  } catch (error) {
    console.error("Error reporting video:", error);
    return ApiResponse.error(
      res,
      "An error occurred while reporting the video",
      500
    );
  }
}

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
        {
          model: Video,
          as: "video",
          attributes: ["id"],
        },
      ],
    });

    return ApiResponse.success(res, "Reports retrieved successfully", reports);
  } catch (error) {
    console.error("Error retrieving reports:", error);
    return ApiResponse.error(res, "An error occurred while retrieving reports", 500);
  }
};

exports.updateReportStatus = async (req, res) => {
  const reportId = req.params.reportId;
  const { status } = req.body;

  try {
    // Check if the report exists
    const report = await Report.findByPk(reportId);
    if (!report) {
      return ApiResponse.error(res, "Report not found", 404);
    }

    // Update the report status
    report.status = status;
    await report.save();

    return ApiResponse.success(res, "Report status updated successfully", report);
  } catch (error) {
    console.error("Error updating report status:", error);
    return ApiResponse.error(res, "An error occurred while updating the report status", 500);
  }
};