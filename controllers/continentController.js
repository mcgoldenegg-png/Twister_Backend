const ApiResponse = require("../utils/apiResponse");
const Continent = require("../models/Continent");
const Country = require("../models/Country");

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

exports.getAllContinent = async (req, res) => {
  try {
    const continents = await Continent.findAll();
    return ApiResponse.success(res, "Continent Fetched Successfully!", continents);
  } catch (error) {
    return ApiResponse.error(res, "Continent Fetched Failed!", 500, error.message);
  }
};
