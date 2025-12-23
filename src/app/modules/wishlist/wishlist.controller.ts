import { Request, Response } from "express";
import { WishlistService } from "./wishlist.service";

export const WishlistController = {
  async addToWishlist(req: Request, res: Response) {
    try {
      const { productId } = req.body;
      const userId = (req as any).user?.id 

      const wishlistItem = await WishlistService.addToWishlist(userId, productId);
      res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        data: wishlistItem,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async removeFromWishlist(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const userId = (req as any).user?.id 

      await WishlistService.removeFromWishlist(userId, productId);
      res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getUserWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id 
      const wishlist = await WishlistService.getUserWishlist(userId);
      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
