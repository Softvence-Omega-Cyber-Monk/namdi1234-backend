import { Wishlist } from "./wishlist.model";
import { IWishlist } from "./wishlist.interface";
import { Types } from "mongoose";

export const WishlistService = {
  async addToWishlist(userId: string, productId: string): Promise<IWishlist> {
    const wishlistItem = await Wishlist.findOne({ userId, productId });
    if (wishlistItem) {
      throw new Error("Product already in wishlist");
    }
    return Wishlist.create({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await Wishlist.findOneAndDelete({ userId, productId });
  },

  async getUserWishlist(userId: string): Promise<IWishlist[]> {
    return Wishlist.find({ userId }).populate("productId");
  },
};
