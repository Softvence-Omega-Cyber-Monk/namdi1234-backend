import mongoose, { Schema } from "mongoose";
import { IWishlist } from "./wishlist.interface";

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent adding the same product twice for the same user
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
