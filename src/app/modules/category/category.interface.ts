import { Document } from "mongoose";

export interface ICategory extends Document {
  categoryName: string;
  imageUrl: string;
  cloudinaryId: string;
  createdAt: Date;
  updatedAt: Date;
}
