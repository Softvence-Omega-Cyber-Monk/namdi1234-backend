import { Document, Schema } from "mongoose";

export interface IProductVariation {
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  pricePerUnit: number;
  specialPrice?: number;
  imageUrl?: string;
}

export interface IProduct extends Document {
  productName: string;
  productCategory: Schema.Types.ObjectId;
  productSKU: string;
  companyName: string;
  productDescription: string;
  pricePerUnit: number;
  stock: number;
  specialPrice?: number;
  specialPriceStartingDate?: Date | string;
  specialPriceEndingDate?: Date | string;
  mainImageUrl?: string;
  sideImageUrl?: string;
  sideImage2Url?: string;
  lastImageUrl?: string;
  videoUrl?: string;
  variations?: IProductVariation[];
  hasVariations: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: Schema.Types.ObjectId;
  avgRating?: number;
  soldUnits?: number;
}

export type IBulkProduct = IProduct[];