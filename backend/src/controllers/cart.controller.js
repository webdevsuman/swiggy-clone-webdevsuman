import Cart from "../models/cart.model.js";
import Food from "../models/food.model.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

class CartController {
  async getCart(req, res) {
    try {
      let cart = await Cart.findOne({ user: req.user._id })
        .populate("restaurant", "name address isOpen contactNumber")
        .populate("items.food", "name price isVeg isAvailable image");

      if (!cart) {
        cart = await Cart.create({
          user: req.user._id,
          restaurant: null,
          items: [],
          totalPrice: 0,
        });
      }

      return res.status(httpStatusCodes.OK).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      logger.error(`getCart error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async addToCart(req, res) {
    try {
      const { foodId, quantity = 1 } = req.body;

      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Food item not found",
        });
      }

      if (!food.isAvailable) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "This food item is currently unavailable",
        });
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({
          user: req.user._id,
          restaurant: food.restaurant,
          items: [],
          totalPrice: 0,
        });
      }

      if (
        cart.restaurant &&
        cart.items.length > 0 &&
        cart.restaurant.toString() !== food.restaurant.toString()
      ) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message:
            "Your cart contains items from another restaurant. Please clear your cart first.",
        });
      }

      cart.restaurant = food.restaurant;

      const existingItemIndex = cart.items.findIndex(
        (item) => item.food.toString() === foodId,
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({
          food: food._id,
          quantity,
          price: food.price,
        });
      }

      cart.totalPrice = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate("restaurant", "name address isOpen")
        .populate("items.food", "name price isVeg isAvailable image");

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Item added to cart successfully",
        data: populatedCart,
      });
    } catch (error) {
      logger.error(`addToCart error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateQuantity(req, res) {
    try {
      const { foodId, quantity } = req.body;

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart || cart.items.length === 0) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Cart is empty",
        });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.food.toString() === foodId,
      );

      if (itemIndex === -1) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Item not found in cart",
        });
      }

      if (quantity === 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      if (cart.items.length === 0) {
        cart.restaurant = null;
        cart.totalPrice = 0;
      } else {
        cart.totalPrice = cart.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      }

      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate("restaurant", "name address isOpen")
        .populate("items.food", "name price isVeg isAvailable image");

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Cart quantity updated successfully",
        data: populatedCart,
      });
    } catch (error) {
      logger.error(`updateQuantity error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async removeItem(req, res) {
    try {
      const { foodId } = req.params;

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return res.status(httpStatusCodes.NOT_FOUND).json({
          success: false,
          message: "Cart not found",
        });
      }

      cart.items = cart.items.filter((item) => item.food.toString() !== foodId);

      if (cart.items.length === 0) {
        cart.restaurant = null;
        cart.totalPrice = 0;
      } else {
        cart.totalPrice = cart.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      }

      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate("restaurant", "name address isOpen")
        .populate("items.food", "name price isVeg isAvailable image");

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Item removed from cart",
        data: populatedCart,
      });
    } catch (error) {
      logger.error(`removeItem error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async clearCart(req, res) {
    try {
      const cart = await Cart.findOne({ user: req.user._id });

      if (cart) {
        cart.items = [];
        cart.restaurant = null;
        cart.totalPrice = 0;
        await cart.save();
      }

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Cart cleared successfully",
        data: { items: [], restaurant: null, totalPrice: 0 },
      });
    } catch (error) {
      logger.error(`clearCart error: ${error.message}`);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new CartController();
