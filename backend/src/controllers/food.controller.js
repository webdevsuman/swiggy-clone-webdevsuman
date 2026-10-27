import Food from "../models/food.model.js";
import Restaurant from "../models/restaurant.model.js";
import Category from "../models/category.model.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

class FoodController {
  async createFood(req, res) {
    try {
      const {
        name,
        description,
        price,
        category,
        restaurant,
        isVeg,
        isAvailable,
        image,
      } = req.body;

      const restaurantDoc = await Restaurant.findById(restaurant);
      if (!restaurantDoc) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      if (restaurantDoc.owner.toString() !== req.user._id.toString()) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message: "Forbidden: You are not the owner of this restaurant",
        });
      }

      const categoryDoc = await Category.findById(category);
      if (!categoryDoc || !categoryDoc.isActive) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Invalid or inactive Category selected",
        });
      }

      const food = await Food.create({
        name,
        description,
        price,
        category,
        restaurant,
        isVeg: Boolean(isVeg),
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        image,
      });

      return res.status(httpStatusCodes.CREATED).json({
        success: true,
        message: "Food item created successfully",
        data: food,
      });
    } catch (error) {
      logger.error(`createFood error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateFood(req, res) {
    try {
      const { id } = req.params;
      const food = await Food.findById(id).populate("restaurant");

      if (!food) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Food item not found",
        });
      }

      if (food.restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message:
            "Forbidden: You do not own the restaurant for this food item",
        });
      }

      if (req.body.category) {
        const categoryDoc = await Category.findById(req.body.category);
        if (!categoryDoc || !categoryDoc.isActive) {
          return res.status(httpStatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid or inactive Category selected",
          });
        }
      }

      const updated = await Food.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Food item updated successfully",
        data: updated,
      });
    } catch (error) {
      logger.error(`updateFood error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async toggleAvailability(req, res) {
    try {
      const { id } = req.params;
      const food = await Food.findById(id).populate("restaurant");

      if (!food) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Food item not found",
        });
      }

      if (food.restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message:
            "Forbidden: You do not own the restaurant for this food item",
        });
      }

      food.isAvailable = !food.isAvailable;
      await food.save();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: `Food item is now ${food.isAvailable ? "Available" : "Unavailable"}`,
        data: { id: food._id, isAvailable: food.isAvailable },
      });
    } catch (error) {
      logger.error(`toggleAvailability error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteFood(req, res) {
    try {
      const { id } = req.params;
      const food = await Food.findById(id).populate("restaurant");

      if (!food) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Food item not found",
        });
      }

      if (food.restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message:
            "Forbidden: You do not own the restaurant for this food item",
        });
      }

      await Food.findByIdAndDelete(id);

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Food item deleted successfully",
      });
    } catch (error) {
      logger.error(`deleteFood error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getFoods(req, res) {
    try {
      const {
        search,
        restaurant,
        category,
        isVeg,
        minPrice,
        maxPrice,
        isAvailable,
        page = 1,
        limit = 20,
      } = req.query;

      const filter = {};

      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }
      if (restaurant) {
        filter.restaurant = restaurant;
      }
      if (category) {
        filter.category = category;
      }
      if (isVeg !== undefined) {
        filter.isVeg = isVeg === "true";
      }
      if (isAvailable !== undefined) {
        filter.isAvailable = isAvailable === "true";
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [foods, total] = await Promise.all([
        Food.find(filter)
          .populate("restaurant", "name address isOpen")
          .populate("category", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Food.countDocuments(filter),
      ]);

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: foods,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      logger.error(`getFoods error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getFoodsByRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;
      const foods = await Food.find({ restaurant: restaurantId })
        .populate("category", "name")
        .sort({ category: 1, name: 1 });

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: foods,
      });
    } catch (error) {
      logger.error(`getFoodsByRestaurant error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getFoodById(req, res) {
    try {
      const { id } = req.params;
      const food = await Food.findById(id)
        .populate("restaurant", "name address isOpen contactNumber")
        .populate("category", "name");

      if (!food) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Food item not found",
        });
      }

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: food,
      });
    } catch (error) {
      logger.error(`getFoodById error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new FoodController();
