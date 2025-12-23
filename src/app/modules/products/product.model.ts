import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";

const productSchema = new Schema<IProduct>({
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: Schema.Types.ObjectId,
        ref:"Category", required: true
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
    gender: { 
        type: String, 
        required: true 
    },
    availableSize: { 
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
    currency: { 
        type: String, 
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
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    length: {
        type: Number
    },
    weight: {
        type: Number
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    avgRating:{
        type:Number,
        default:0
    },
    soldUnits:{
        type:Number,
        default:0
    }
})

export const ProductModel = model<IProduct>("Product", productSchema)
