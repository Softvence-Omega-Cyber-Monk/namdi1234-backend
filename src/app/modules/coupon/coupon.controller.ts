import { Request, Response } from 'express';
import { CouponService } from './coupon.service';
import { ICreateCoupon, IUpdateCoupon, IValidateCoupon, CouponStatus } from './coupon.interface';

export class CouponController {
  private service: CouponService;

  constructor() {
    this.service = new CouponService();
  }

  createCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: ICreateCoupon = req.body;

      if (!data.code || !data.description || !data.discountType || !data.discountValue || !data.startDate || !data.endDate) {
        res.status(400).json({
          success: false,
          error: 'All required fields must be provided'
        });
        return;
      }

      const coupon = await this.service.createCoupon(data);

      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create coupon'
      });
    }
  };

  getAllCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, isActive } = req.query;

      const filters: any = {};
      
      if (status && (status === 'active' || status === 'inactive' || status === 'expired')) {
        filters.status = status as CouponStatus;
      }
      
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const coupons = await this.service.getAllCoupons(filters);

      res.status(200).json({
        success: true,
        count: coupons.length,
        data: coupons
      });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch coupons'
      });
    }
  };

  getCouponById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const coupon = await this.service.getCouponById(id);

      if (!coupon) {
        res.status(404).json({
          success: false,
          error: 'Coupon not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: coupon
      });
    } catch (error) {
      console.error('Error fetching coupon:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch coupon'
      });
    }
  };

  getCouponByCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const coupon = await this.service.getCouponByCode(code);

      if (!coupon) {
        res.status(404).json({
          success: false,
          error: 'Coupon not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: coupon
      });
    } catch (error) {
      console.error('Error fetching coupon:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch coupon'
      });
    }
  };

  updateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: IUpdateCoupon = req.body;

      const coupon = await this.service.updateCoupon(id, data);

      res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon
      });
    } catch (error) {
      console.error('Error updating coupon:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update coupon'
      });
    }
  };

  deleteCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const coupon = await this.service.deleteCoupon(id);

      if (!coupon) {
        res.status(404).json({
          success: false,
          error: 'Coupon not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete coupon'
      });
    }
  };

  validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: IValidateCoupon = req.body;

      if (!data.code || data.purchaseAmount === undefined) {
        res.status(400).json({
          success: false,
          error: 'Coupon code and purchase amount are required'
        });
        return;
      }

      const result = await this.service.validateCoupon(data);

      if (!result.valid) {
        res.status(400).json({
          success: false,
          error: result.message
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          discount: result.discount,
          finalAmount: result.finalAmount
        }
      });
    } catch (error) {
      console.error('Error validating coupon:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate coupon'
      });
    }
  };

  applyCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          error: 'Coupon code is required'
        });
        return;
      }

      const coupon = await this.service.applyCoupon(code);

      res.status(200).json({
        success: true,
        message: 'Coupon applied successfully',
        data: coupon
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply coupon'
      });
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  };

  getActiveCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
      const coupons = await this.service.getActiveCoupons();

      res.status(200).json({
        success: true,
        count: coupons.length,
        data: coupons
      });
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active coupons'
      });
    }
  };
}