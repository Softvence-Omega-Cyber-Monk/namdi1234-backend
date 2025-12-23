import { Request, Response } from "express";
import { CartService } from "./cart.service";

export const CartController = {
  async addToCart(req: Request, res: Response) {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = (req as any).user?.id;

      if (!productId) {
        return res.status(400).json({ success: false, message: "productId is required" });
      }

      const cart = await CartService.addToCart(userId, productId, quantity);
      res.status(201).json({
        success: true,
        message: "Product added to cart",
        data: cart,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updateCartItem(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { action } = req.body;
      const userId = (req as any).user?.id;

      if (!["increment", "decrement"].includes(action)) {
        return res.status(400).json({ success: false, message: "Invalid action" });
      }

      const cart = await CartService.updateCartItem(userId, productId, action);
      res.status(200).json({
        success: true,
        message: `Product ${action}ed in cart`,
        data: cart,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async removeFromCart(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const userId = (req as any).user?.id;

      await CartService.removeFromCart(userId, productId);
      res.status(200).json({
        success: true,
        message: "Product removed from cart",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getUserCart(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const cart = await CartService.getUserCart(userId);
      res.status(200).json({
        success: true,
        data: cart || { items: [], totalQuantity: 0, totalPrice: 0 },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};