import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Restaurant from "../models/restaurant.model.js";
import Food from "../models/food.model.js";
import ORDER_STATUS from "../constants/orderStatus.constant.js";
import ROLES from "../constants/roles.constant.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

class OrderController {
  async createOrder(req, res) {
    try {
      const { deliveryAddress, paymentMethod = "COD" } = req.body;

      const cart = await Cart.findOne({ user: req.user._id }).populate("items.food");

      if (!cart || cart.items.length === 0) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Your cart is empty. Please add items before placing an order.",
        });
      }

      const restaurant = await Restaurant.findById(cart.restaurant);
      if (!restaurant) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      if (!restaurant.isOpen) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Restaurant is currently closed. Cannot place order right now.",
        });
      }

      const orderItems = [];
      let calculatedTotal = 0;

      for (const item of cart.items) {
        const food = item.food;
        if (!food || !food.isAvailable) {
          return res.status(httpStatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Item "${food ? food.name : 'Unknown'}" is no longer available. Please update your cart.`,
          });
        }

        orderItems.push({
          food: food._id,
          name: food.name,
          price: food.price,
          quantity: item.quantity,
        });

        calculatedTotal += food.price * item.quantity;
      }

      const order = await Order.create({
        user: req.user._id,
        restaurant: restaurant._id,
        items: orderItems,
        totalAmount: calculatedTotal,
        deliveryAddress,
        paymentMethod,
        status: ORDER_STATUS.PENDING,
      });

      cart.items = [];
      cart.restaurant = null;
      cart.totalPrice = 0;
      await cart.save();

      const populatedOrder = await Order.findById(order._id)
        .populate("restaurant", "name address contactNumber")
        .populate("user", "name email phone");

      return res.status(httpStatusCodes.CREATED).json({
        success: true,
        message: "Order placed successfully",
        data: populatedOrder,
      });
    } catch (error) {
      logger.error(`createOrder error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyOrders(req, res) {
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate("restaurant", "name address contactNumber image")
        .sort({ createdAt: -1 });

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      logger.error(`getMyOrders error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cancelMyOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Order not found",
        });
      }

      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message: "Forbidden: You are not authorized to cancel this order",
        });
      }

      const cancellableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED];
      if (!cancellableStatuses.includes(order.status)) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Cannot cancel order at this stage. Current status is '${order.status}'.`,
        });
      }

      order.status = ORDER_STATUS.CANCELLED;
      if (reason) order.cancellationReason = reason;
      await order.save();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error) {
      logger.error(`cancelMyOrder error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async getRestaurantOrders(req, res) {
    try {
      const { status } = req.query;

      const myRestaurants = await Restaurant.find({ owner: req.user._id }).select("_id");
      const restaurantIds = myRestaurants.map((r) => r._id);

      const filter = { restaurant: { $in: restaurantIds } };
      if (status) {
        filter.status = status;
      }

      const orders = await Order.find(filter)
        .populate("user", "name email phone address")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      logger.error(`getRestaurantOrders error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findById(id).populate("restaurant");

      if (!order) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Order not found",
        });
      }

      if (order.restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message: "Forbidden: You do not own the restaurant for this order",
        });
      }

      if (order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Cannot change status of an order that is already '${order.status}'`,
        });
      }

      order.status = status;
      if (status === ORDER_STATUS.DELIVERED) {
        order.paymentStatus = "Completed";
      }
      await order.save();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: `Order status updated to '${status}'`,
        data: order,
      });
    } catch (error) {
      logger.error(`updateOrderStatus error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async getAllOrders(req, res) {
    try {
      const { status, restaurant, page = 1, limit = 20 } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (restaurant) filter.restaurant = restaurant;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate("user", "name email phone")
          .populate("restaurant", "name address")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Order.countDocuments(filter),
      ]);

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: orders,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      logger.error(`getAllOrders error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate("user", "name email phone")
        .populate("restaurant", "name address contactNumber owner");

      if (!order) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Order not found",
        });
      }

      const isAdmin = req.user.role === ROLES.ADMIN;
      const isCustomer = order.user._id.toString() === req.user._id.toString();
      const isOwner = order.restaurant.owner.toString() === req.user._id.toString();

      if (!isAdmin && !isCustomer && !isOwner) {
        return res.status(httpStatusCodes.FORBIDDEN).json({
          success: false,
          message: "Forbidden: You are not authorized to view this order",
        });
      }

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: order,
      });
    } catch (error) {
      logger.error(`getOrderById error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new OrderController();
