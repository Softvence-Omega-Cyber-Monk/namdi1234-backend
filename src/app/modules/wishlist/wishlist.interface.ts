import { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
  userId: Schema.Types.ObjectId;        // ID of the user
  productId: Schema.Types.ObjectId;     // ID of the product
  createdAt: Date;
  updatedAt: Date;
}
