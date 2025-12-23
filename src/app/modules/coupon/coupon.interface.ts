import { Document } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
}

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  status: CouponStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCoupon {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate: Date;
  endDate: Date;
}

export interface IUpdateCoupon {
  description?: string;
  discountValue?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate?: Date;
  endDate?: Date;
  status?: CouponStatus;
  isActive?: boolean;
}

export interface IValidateCoupon {
  code: string;
  purchaseAmount: number;
}

export interface ICouponValidationResult {
  valid: boolean;
  message?: string;
  discount?: number;
  finalAmount?: number;
}

export interface ICouponStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  totalUsage: number;
}