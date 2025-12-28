// src/app/modules/testimonial/testimonial.model.ts
import { model, Schema } from "mongoose";
import { ITestimonial, IMarquee } from "./testimonial.interface";

const testimonialSchema = new Schema<ITestimonial>(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const marqueeSchema = new Schema<IMarquee>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Only one marquee allowed
marqueeSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export const TestimonialModel = model<ITestimonial>("Testimonial", testimonialSchema);
export const MarqueeModel = model<IMarquee>("Marquee", marqueeSchema);