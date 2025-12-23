// src/models/shipmentCompany.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { IShipmentCompany } from './shipment.interface';

export interface IShipmentCompanyDocument extends IShipmentCompany, Document {}

const shipmentCompanySchema = new Schema<IShipmentCompanyDocument>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    code: {
      type: String,
      required: [true, 'Company code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: [20, 'Company code cannot exceed 20 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    contactPhone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    logo: {
      type: String,
      trim: true
    },
    trackingUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better query performance
shipmentCompanySchema.index({ name: 1 });
shipmentCompanySchema.index({ code: 1 });
shipmentCompanySchema.index({ isActive: 1 });

export default mongoose.model<IShipmentCompanyDocument>(
  'ShipmentCompany',
  shipmentCompanySchema
);