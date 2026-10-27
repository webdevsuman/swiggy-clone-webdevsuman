import Category from "../models/category.model.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

class CategoryController {
  async getCategories(_req, res) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ name: 1 });
      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error(`getCategories error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);

      if (!category) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error(`getCategoryById error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async createCategory(req, res) {
    try {
      const { name, description, image } = req.body;

      const existing = await Category.findOne({ name });
      if (existing) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "A category with this name already exists.",
        });
      }

      const category = await Category.create({ name, description, image });

      return res.status(httpStatusCodes.CREATED).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      logger.error(`createCategory error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedCategory) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      logger.error(`updateCategory error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      logger.error(`deleteCategory error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new CategoryController();
