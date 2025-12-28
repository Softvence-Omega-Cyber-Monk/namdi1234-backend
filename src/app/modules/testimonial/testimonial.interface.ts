// src/app/modules/testimonial/testimonial.interface.ts
import { Document, Schema } from "mongoose";

export interface ITestimonial extends Document {
  customerName: string;
  rating: number; // 1 to 5
  review: string;
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMarquee extends Document {
  text: string;
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  updatedAt: Date;
}