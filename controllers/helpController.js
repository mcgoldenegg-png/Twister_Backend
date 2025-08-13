const { Help } = require("../models");
const ApiResponse = require("../utils/apiResponse");

// Create Help
exports.createHelp = async (req, res) => {
    try {
        const { title, description } = req.body;

        // Validate input
        if (!title || !description) {
            return ApiResponse.error(res, 'Title and description are required', 400);
        }

        // Create help record
        const help = await Help.create({
            title,
            description
        });

        return ApiResponse.created(res, 'Help created successfully', help);
    } catch (error) {
        console.error('Error creating help:', error);
        return ApiResponse.error(res, 'Failed to create help', 500, error);
    }
};

// Get All Help Items
exports.getAllHelp = async (req, res) => {
    try {
        // const helpItems = await Help.findAll({
        //     order: [['createdAt', 'DESC']]
        // });
        const helpItems = await Help.findAll();

        return ApiResponse.success(res, 'Help items retrieved successfully', helpItems);
    } catch (error) {
        console.error('Error fetching help items:', error);
        return ApiResponse.error(res, 'Failed to fetch help items', 500, error);
    }
};

// Update Help
exports.updateHelp = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const help = await Help.findByPk(id);
        if (!help) {
            return ApiResponse.error(res, 'Help item not found', 404);
        }

        help.title = title || help.title;
        help.description = description || help.description;
        await help.save();

        return ApiResponse.success(res, 'Help updated successfully', help);
    } catch (error) {
        console.error('Error updating help:', error);
        return ApiResponse.error(res, 'Failed to update help', 500, error);
    }
};

// Delete Help
exports.deleteHelp = async (req, res) => {
    try {
        const { id } = req.params;

        const help = await Help.findByPk(id);
        if (!help) {
            return ApiResponse.error(res, 'Help item not found', 404);
        }

        await help.destroy();
        return ApiResponse.success(res, 'Help deleted successfully');
    } catch (error) {
        console.error('Error deleting help:', error);
        return ApiResponse.error(res, 'Failed to delete help', 500, error);
    }
};