const ApiResponse = require("../utils/apiResponse");
const Continent = require("../models/Continent");
const fs = require('fs');

exports.insertContinent = async (req, res) => {
  try {
    const { name, code } = req.body;
    const continent = await Continent.create({
      name,
      code: code
    });
    return ApiResponse.created(res, "Continent Crested Successfully!", continent);
  } catch (error) {
    return ApiResponse.error(res, "Continent Creation Failed!", 500, error.message);
  }
};

exports.updateContinentImage = async (req, res) => {
  try {
    const { id } = req.body;

    // Find the Continent
    const continent = await Continent.findByPk(id);
    if (!continent) {
      if (req.file) fs.unlinkSync(req.file.path);
      return ApiResponse.error(res, "Continent not found", 404);
    }

    // Delete old image if it exists
    if (continent.imagePath && fs.existsSync(continent.imagePath)) {
      fs.unlinkSync(continent.imagePath);
    }

    // Process new image
    let imageUrl = null;
    let imagePath = null;

    if (req.file) {
      imagePath = req.file.path;
      imageUrl = `/uploads/continent/${req.file.filename}`;
    }

    // Update the Continent
    const updatedContinent = await continent.update({
      imageUrl,
      imagePath
    });

    return ApiResponse.success(res, "Continent image updated successfully", updatedContinent);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Error updating Continent image:", error);
    return ApiResponse.error(res, "Failed to update Continent image", 500, error.message);
  }
};

exports.getAllContinent = async (req, res) => {
  try {
    const continents = await Continent.findAll();
    return ApiResponse.success(res, "Continent Fetched Successfully!", continents);
  } catch (error) {
    return ApiResponse.error(res, "Continent Fetched Failed!", 500, error.message);
  }
};
