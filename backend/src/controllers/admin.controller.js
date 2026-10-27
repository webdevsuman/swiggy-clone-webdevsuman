import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Order from "../models/order.model.js";
import Category from "../models/category.model.js";
import Food from "../models/food.model.js";
import ORDER_STATUS from "../constants/orderStatus.constant.js";
import ROLES from "../constants/roles.constant.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

class AdminController {
  async getAllUsers(req, res) {
    try {
      const { search, role, isActive, page = 1, limit = 20 } = req.query;

      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (role) {
        filter.role = role;
      }
      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        User.find(filter)
          .select("-password -refreshToken")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(filter),
      ]);

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: users,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      logger.error(`getAllUsers error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (id === req.user._id.toString()) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "You cannot block or deactivate your own admin account.",
        });
      }

      const user = await User.findById(id).select("-password -refreshToken");
      if (!user) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
      }

      user.isActive = isActive;
      await user.save();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: `User account has been ${isActive ? "activated / unblocked" : "blocked / deactivated"} successfully.`,
        data: user,
      });
    } catch (error) {
      logger.error(`toggleUserStatus error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllRestaurants(req, res) {
    try {
      const { search, isOpen, page = 1, limit = 20 } = req.query;

      const filter = {};
      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }
      if (isOpen !== undefined) {
        filter.isOpen = isOpen === "true";
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [restaurants, total] = await Promise.all([
        Restaurant.find(filter)
          .populate("owner", "name email phone isActive")
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

  async getPlatformStats(_req, res) {
    try {
      const [
        totalUsers,
        totalCustomers,
        totalOwners,
        activeUsers,
        blockedUsers,
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: ROLES.USER }),
        User.countDocuments({ role: ROLES.RESTAURANT_OWNER }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
      ]);

      const [totalRestaurants, openRestaurants, closedRestaurants] =
        await Promise.all([
          Restaurant.countDocuments({}),
          Restaurant.countDocuments({ isOpen: true }),
          Restaurant.countDocuments({ isOpen: false }),
        ]);

      const [totalCategories, totalFoods] = await Promise.all([
        Category.countDocuments({}),
        Food.countDocuments({}),
      ]);

      const totalOrders = await Order.countDocuments({});

      const orderStatusBreakdown = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const statusMap = {};
      Object.values(ORDER_STATUS).forEach((status) => {
        statusMap[status] = 0;
      });
      orderStatusBreakdown.forEach((item) => {
        statusMap[item._id] = item.count;
      });

      const revenueData = await Order.aggregate([
        { $match: { status: ORDER_STATUS.DELIVERED } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]);

      const totalRevenue =
        revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            customers: totalCustomers,
            restaurantOwners: totalOwners,
            active: activeUsers,
            blocked: blockedUsers,
          },
          restaurants: {
            total: totalRestaurants,
            open: openRestaurants,
            closed: closedRestaurants,
          },
          catalog: {
            categories: totalCategories,
            foods: totalFoods,
          },
          orders: {
            total: totalOrders,
            breakdown: statusMap,
          },
          financials: {
            totalRevenue,
            currency: "INR",
          },
        },
      });
    } catch (error) {
      logger.error(`getPlatformStats error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AdminController();
