// src/app/modules/countdown/countdown.interface.ts
import { Document, Schema } from "mongoose";

export interface ICountdown extends Document {
  title: string;
  description: string;
  endDate: Date;
  isActive: boolean;
  type: 'exclusive_offer' | 'weekend_deals' | 'flash_sale' | 'general';
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCountdown {
  title: string;
  description: string;
  endDate: Date | string;
  type: 'exclusive_offer' | 'weekend_deals' | 'flash_sale' | 'general';
}

export interface IUpdateCountdown {
  title?: string;
  description?: string;
  endDate?: Date | string;
  isActive?: boolean;
  type?: 'exclusive_offer' | 'weekend_deals' | 'flash_sale' | 'general';
}