import { Document, Schema } from "mongoose";

export interface ICartItem {
  productId: Schema.Types.ObjectId;
  quantity: number;
  unitPrice: number; // Fetched from Product at time of addition
  totalPrice: number; // = quantity * unitPrice
}

export interface ICart extends Document {
  userId: Schema.Types.ObjectId;
  items: ICartItem[];
  totalQuantity: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}