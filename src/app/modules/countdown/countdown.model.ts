// src/app/modules/countdown/countdown.model.ts
import { model, Schema } from "mongoose";
import { ICountdown } from "./countdown.interface";

const countdownSchema = new Schema<ICountdown>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    type: {
      type: String,
      enum: ['exclusive_offer', 'weekend_deals', 'flash_sale', 'general'],
      default: 'general',
      required: true,
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

// Index for better query performance
countdownSchema.index({ type: 1, isActive: 1 });
countdownSchema.index({ endDate: 1 });

export const CountdownModel = model<ICountdown>("Countdown", countdownSchema);