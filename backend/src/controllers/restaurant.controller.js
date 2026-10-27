import Restaurant from "../models/restaurant.model.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

class RestaurantController {
  async createRestaurant(req, res) {
    try {
      const { name, description, cuisine, address, contactNumber, image } =
        req.body;

      const restaurant = await Restaurant.create({
        name,
        description,
        cuisine,
        address,
        contactNumber,
        image,
        owner: req.user._id,
      });

      return res.status(httpStatusCodes.CREATED).json({
        success: true,
        message: "Restaurant created successfully",
        data: restaurant,
      });
    } catch (error) {
      logger.error(`createRestaurant error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyRestaurants(req, res) {
    try {
      const restaurants = await Restaurant.find({ owner: req.user._id });
      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: restaurants,
      });
    } catch (error) {
      logger.error(`getMyRestaurants error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      if (restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message:
            "Forbidden: You are not authorized to update this restaurant",
        });
      }

      const updated = await Restaurant.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Restaurant updated successfully",
        data: updated,
      });
    } catch (error) {
      logger.error(`updateRestaurant error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      if (restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message:
            "Forbidden: You are not authorized to manage this restaurant's status",
        });
      }

      restaurant.isOpen = !restaurant.isOpen;
      await restaurant.save();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: `Restaurant is now ${restaurant.isOpen ? "Open" : "Closed"}`,
        data: { id: restaurant._id, isOpen: restaurant.isOpen },
      });
    } catch (error) {
      logger.error(`toggleStatus error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllRestaurants(req, res) {
    try {
      const { search, cuisine, city, isOpen, page = 1, limit = 10 } = req.query;

      const filter = {};

      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }
      if (cuisine) {
        filter.cuisine = { $in: [new RegExp(cuisine, "i")] };
      }
      if (city) {
        filter["address.city"] = { $regex: city, $options: "i" };
      }
      if (isOpen !== undefined) {
        filter.isOpen = isOpen === "true";
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [restaurants, total] = await Promise.all([
        Restaurant.find(filter)
          .populate("owner", "name email phone")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Restaurant.countDocuments(filter),
      ]);

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: restaurants,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      logger.error(`getAllRestaurants error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getRestaurantById(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.findById(id).populate(
        "owner",
        "name email phone",
      );

      if (!restaurant) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: restaurant,
      });
    } catch (error) {
      logger.error(`getRestaurantById error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new RestaurantController();
