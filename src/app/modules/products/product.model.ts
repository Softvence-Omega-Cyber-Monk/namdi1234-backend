import { model, Schema } from "mongoose";
import { IProduct, IProductVariation } from "./product.interface";

const productVariationSchema = new Schema<IProductVariation>({
  size: { type: String },
  color: { type: String },
  sku: { type: String, required: true },
  stock: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  specialPrice: { type: Number },
  imageUrl: { type: String }
}, { _id: true });

const productSchema = new Schema<IProduct>({
  productName: {
    type: String,
    required: true
  },
  productCategory: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  productSKU: { 
    type: String, 
    required: true, 
    unique: true 
  },
  companyName: { 
    type: String, 
    required: true 
  },
  productDescription: { 
    type: String, 
    required: true 
  },
  stock: { 
    type: Number, 
    required: true 
  },
  pricePerUnit: { 
    type: Number, 
    required: true 
  },
  specialPrice: { 
    type: Number 
  },
  specialPriceStartingDate: { 
    type: Date 
  },
  specialPriceEndingDate: { 
    type: Date 
  },
  mainImageUrl: { 
    type: String
  },
  sideImageUrl: { 
    type: String 
  },
  sideImage2Url: { 
    type: String 
  },
  lastImageUrl: { 
    type: String 
  },
  videoUrl: { 
    type: String 
  },
  hasVariations: {
    type: Boolean,
    default: false
  },
  variations: [productVariationSchema],
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  avgRating: {
    type: Number,
    default: 0
  },
  soldUnits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const ProductModel = model<IProduct>("Product", productSchema);