import Coupon from './coupon.model';
import {
  ICoupon,
  ICreateCoupon,
  IUpdateCoupon,
  IValidateCoupon,
  ICouponValidationResult,
  ICouponStats,
  DiscountType,
  CouponStatus
} from './coupon.interface';

export class CouponService {
  async createCoupon(data: ICreateCoupon): Promise<ICoupon> {
    // Check if coupon code already exists
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    
    if (existing) {
      throw new Error('Coupon code already exists');
    }
    
    const coupon = new Coupon(data);
    await coupon.save();
    return coupon;
  }

  async getAllCoupons(filters?: { status?: CouponStatus; isActive?: boolean }): Promise<ICoupon[]> {
    const query: any = {};
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    
    // Update expired coupons
    const now = new Date();
    for (const coupon of coupons) {
      if (coupon.endDate < now && coupon.status !== CouponStatus.EXPIRED) {
        coupon.status = CouponStatus.EXPIRED;
        coupon.isActive = false;
        await coupon.save();
      }
    }
    
    return coupons;
  }

  async getCouponById(id: string): Promise<ICoupon | null> {
    const coupon = await Coupon.findById(id);
    return coupon;
  }

  async getCouponByCode(code: string): Promise<ICoupon | null> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    return coupon;
  }

  async updateCoupon(id: string, data: IUpdateCoupon): Promise<ICoupon> {
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    
    // Update fields
    Object.assign(coupon, data);
    await coupon.save();
    
    return coupon;
  }

  async deleteCoupon(id: string): Promise<ICoupon | null> {
    const coupon = await Coupon.findByIdAndDelete(id);
    return coupon;
  }

  async validateCoupon(data: IValidateCoupon): Promise<ICouponValidationResult> {
    const coupon = await Coupon.findOne({ code: data.code.toUpperCase() });
    
    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid coupon code'
      };
    }
    
    // Check if coupon is active
    if (!coupon.isActive || coupon.status !== CouponStatus.ACTIVE) {
      return {
        valid: false,
        message: 'This coupon is not active'
      };
    }
    
    // Check date validity
    const now = new Date();
    if (now < coupon.startDate) {
      return {
        valid: false,
        message: 'This coupon is not yet valid'
      };
    }
    
    if (now > coupon.endDate) {
      return {
        valid: false,
        message: 'This coupon has expired'
      };
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        message: 'This coupon has reached its usage limit'
      };
    }
    
    // Check minimum purchase amount
    if (data.purchaseAmount < coupon.minPurchaseAmount) {
      return {
        valid: false,
        message: `Minimum purchase amount of $${coupon.minPurchaseAmount} required`
      };
    }
    
    // Calculate discount
    let discount = 0;
    
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = (data.purchaseAmount * coupon.discountValue) / 100;
      
      // Apply max discount limit if set
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }
    
    const finalAmount = data.purchaseAmount - discount;
    
    return {
      valid: true,
      message: 'Coupon applied successfully',
      discount: Math.round(discount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100
    };
  }

  async applyCoupon(code: string): Promise<ICoupon> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    
    coupon.usedCount += 1;
    
    // Check if usage limit reached
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      coupon.status = CouponStatus.EXPIRED;
      coupon.isActive = false;
    }
    
    await coupon.save();
    return coupon;
  }

  async getStats(): Promise<ICouponStats> {
    const total = await Coupon.countDocuments();
    const active = await Coupon.countDocuments({ status: CouponStatus.ACTIVE });
    const inactive = await Coupon.countDocuments({ status: CouponStatus.INACTIVE });
    const expired = await Coupon.countDocuments({ status: CouponStatus.EXPIRED });
    
    const result = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$usedCount' }
        }
      }
    ]);
    
    const totalUsage = result.length > 0 ? result[0].totalUsage : 0;
    
    return { total, active, inactive, expired, totalUsage };
  }

  async getActiveCoupons(): Promise<ICoupon[]> {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      status: CouponStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });
    
    return coupons;
  }
}