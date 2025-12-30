// src/app/modules/energyUsage/energyUsage.model.ts
import { model, Schema } from "mongoose";
import { IEnergyUsage } from "./energyUsage.interface";

const energyUsageSchema = new Schema<IEnergyUsage>(
  {
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      trim: true,
    },
    refNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    inverterSize: {
      type: String,
      required: [true, 'Inverter size is required'],
      trim: true,
    },
    lithiumTub: {
      type: String,
      required: [true, 'Lithium tub is required'],
      trim: true,
    },
    panelSize: {
      type: String,
      required: [true, 'Panel size is required'],
      trim: true,
    },
    numberOfPanels: {
      type: String,
      required: [true, 'Number of panels is required'],
      trim: true,
    },
    subtotal: {
      type: String,
      required: [true, 'Subtotal is required'],
      trim: true,
    },
    totalAccessories: {
      type: String,
      required: [true, 'Total accessories is required'],
      trim: true,
    },
    ait: {
      type: String,
      required: [true, 'AIT is required'],
      trim: true,
    },
    netAmount: {
      type: String,
      required: [true, 'Net amount is required'],
      trim: true,
    },
    totalPayment: {
      type: String,
      required: [true, 'Total payment is required'],
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
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

// Indexes for better query performance
energyUsageSchema.index({ refNumber: 1 });
energyUsageSchema.index({ isActive: 1, createdAt: -1 });
energyUsageSchema.index({ serialNumber: 1 });

export const EnergyUsageModel = model<IEnergyUsage>("EnergyUsage", energyUsageSchema);