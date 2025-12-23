import { Request, Response } from 'express';
import { payoutService } from './payout.service';
import { ICreatePayoutRequest, IProcessPayoutRequest, PayoutStatus } from './payout.interface';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class PayoutController {
  /**
   * Get vendor wallet
   */
  getVendorWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const wallet = await payoutService.getOrCreateVendorWallet(vendorId);

      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error: any) {
      console.error('Error fetching vendor wallet:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor wallet'
      });
    }
  };

  /**
   * Get vendor sales statistics
   */
  getVendorSalesStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { startDate, endDate } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const stats = await payoutService.getVendorSalesStats(vendorId, filters);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching vendor sales stats:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sales statistics'
      });
    }
  };

  /**
   * Get vendor monthly sales
   */
  getVendorMonthlySales = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      const monthlySales = await payoutService.getVendorMonthlySales(vendorId, year);

      res.status(200).json({
        success: true,
        data: monthlySales
      });
    } catch (error: any) {
      console.error('Error fetching vendor monthly sales:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch monthly sales'
      });
    }
  };

  /**
   * Get vendor earnings history
   */
  getVendorEarnings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { startDate, endDate } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const earnings = await payoutService.getVendorEarnings(vendorId, filters);

      res.status(200).json({
        success: true,
        count: earnings.length,
        data: earnings
      });
    } catch (error: any) {
      console.error('Error fetching vendor earnings:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch earnings'
      });
    }
  };

  /**
   * Create payout request
   */
  createPayoutRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const data: ICreatePayoutRequest = req.body;

      if (!data.requestedAmount || !data.payoutMethod) {
        res.status(400).json({
          success: false,
          error: 'Requested amount and payout method are required'
        });
        return;
      }

      if (data.requestedAmount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid payout amount'
        });
        return;
      }

      const payoutRequest = await payoutService.createPayoutRequest(vendorId, data);

      res.status(201).json({
        success: true,
        message: 'Payout request created successfully',
        data: payoutRequest
      });
    } catch (error: any) {
      console.error('Error creating payout request:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get vendor's payout requests
   */
  getVendorPayoutRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const payoutRequests = await payoutService.getVendorPayoutRequests(vendorId);

      res.status(200).json({
        success: true,
        count: payoutRequests.length,
        data: payoutRequests
      });
    } catch (error: any) {
      console.error('Error fetching payout requests:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payout requests'
      });
    }
  };

  /**
   * Get all payout requests (Admin)
   */
  getAllPayoutRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { vendorId, status, startDate, endDate, minAmount, maxAmount } = req.query;

      const filters: any = {};
      if (vendorId) filters.vendorId = vendorId as string;
      if (status) filters.status = status as PayoutStatus;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (minAmount) filters.minAmount = parseFloat(minAmount as string);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);

      const payoutRequests = await payoutService.getAllPayoutRequests(filters);

      res.status(200).json({
        success: true,
        count: payoutRequests.length,
        data: payoutRequests
      });
    } catch (error: any) {
      console.error('Error fetching all payout requests:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payout requests'
      });
    }
  };

  /**
   * Get payout request by ID
   */
  getPayoutRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const payoutRequest = await payoutService.getPayoutRequestById(id);

      if (!payoutRequest) {
        res.status(404).json({
          success: false,
          error: 'Payout request not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payoutRequest
      });
    } catch (error: any) {
      console.error('Error fetching payout request:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payout request'
      });
    }
  };

  /**
   * Process payout request (Admin)
   */
  processPayoutRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const data: IProcessPayoutRequest = req.body;

      if (!data.status) {
        res.status(400).json({
          success: false,
          error: 'Status is required'
        });
        return;
      }

      if (data.status === PayoutStatus.REJECTED && !data.rejectionReason) {
        res.status(400).json({
          success: false,
          error: 'Rejection reason is required when rejecting payout'
        });
        return;
      }

      const payoutRequest = await payoutService.processPayoutRequest(id, adminId, data);

      res.status(200).json({
        success: true,
        message: `Payout request ${data.status.toLowerCase()} successfully`,
        data: payoutRequest
      });
    } catch (error: any) {
      console.error('Error processing payout request:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get admin commission statistics
   */
  getAdminCommissionStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const stats = await payoutService.getAdminCommissionStats(filters);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching commission stats:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch commission statistics'
      });
    }
  };

  /**
   * Get all vendor wallets (Admin)
   */
  getAllVendorWallets = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const wallets = await payoutService.getAllVendorWallets(limit, offset);

      res.status(200).json({
        success: true,
        count: wallets.length,
        pagination: {
          limit,
          offset
        },
        data: wallets
      });
    } catch (error: any) {
      console.error('Error fetching vendor wallets:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor wallets'
      });
    }
  };

  /**
   * Get specific vendor wallet (Admin)
   */
  getVendorWalletById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { vendorId } = req.params;

      const wallet = await payoutService.getVendorWallet(vendorId);

      if (!wallet) {
        res.status(404).json({
          success: false,
          error: 'Vendor wallet not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error: any) {
      console.error('Error fetching vendor wallet:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor wallet'
      });
    }
  };
}

export const payoutController = new PayoutController();