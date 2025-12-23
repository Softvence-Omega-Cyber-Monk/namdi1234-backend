import mongoose, { Schema } from 'mongoose';
import { ICoupon, DiscountType, CouponStatus } from './coupon.interface';

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [50, 'Coupon code cannot exceed 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    discountType: {
      type: String,
      enum: {
        values: Object.values(DiscountType),
        message: '{VALUE} is not a valid discount type'
      },
      required: [true, 'Discount type is required']
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative']
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase amount cannot be negative']
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount amount cannot be negative']
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1']
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(CouponStatus),
        message: '{VALUE} is not a valid status'
      },
      default: CouponStatus.ACTIVE
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ isActive: 1 });

// Validation: End date must be after start date
couponSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  // Validate percentage discount
  if (this.discountType === DiscountType.PERCENTAGE && this.discountValue > 100) {
    next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  next();
});

// Auto-update status based on dates
couponSchema.pre('save', function (next) {
  const now = new Date();
  
  if (this.endDate < now) {
    this.status = CouponStatus.EXPIRED;
    this.isActive = false;
  } else if (this.startDate > now) {
    this.status = CouponStatus.INACTIVE;
  } else if (this.usageLimit && this.usedCount >= this.usageLimit) {
    this.status = CouponStatus.EXPIRED;
    this.isActive = false;
  }
  
  next();
});

const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);

export default Coupon;