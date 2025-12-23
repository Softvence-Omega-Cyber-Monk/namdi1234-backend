import { Document, Schema } from "mongoose";

export interface IProduct extends Document {
    productName: string,
    productCategory: Schema.Types.ObjectId,
    productSKU: string,
    companyName: string,
    gender: string,
    availableSize: string,
    productDescription: string,
    stock: number,
    currency: string,
    pricePerUnit: number,
    specialPrice?: number,
    specialPriceStartingDate?: Date | string,
    specialPriceEndingDate?: Date | string,
    mainImageUrl?: string,
    sideImageUrl?: string,
    sideImage2Url?: string,
    lastImageUrl?: string,
    videoUrl?: string,
    createdAt: Date,
    updatedAt: Date,
    width?: number,
    height?:number,
    length?: number,
    weight: number,
    userId: Schema.Types.ObjectId,
    avgRating?:number
    soldUnits?:number
}

export type IBulkProduct = IProduct[];
