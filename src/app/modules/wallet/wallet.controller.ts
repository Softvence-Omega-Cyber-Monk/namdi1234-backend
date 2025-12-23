import { Request, Response } from 'express';
import { walletService } from './wallet.service';
import { ICreditWalletRequest, ITransactionFilters } from './wallet.interface';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class WalletController {
  /**
   * Get wallet details
   */
  getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const wallet = await walletService.getOrCreateWallet(userId);

      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error: any) {
      console.error('Error fetching wallet:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch wallet'
      });
    }
  };

  /**
   * Get wallet balance
   */
  getWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const balance = await walletService.getWalletBalance(userId);

      res.status(200).json({
        success: true,
        data: balance
      });
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch wallet balance'
      });
    }
  };

  /**
   * Credit wallet manually (Admin only)
   */
  creditWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, amount, paymentMethod, gatewayTransactionId, description } = req.body;

      if (!userId || !amount || !paymentMethod) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields (userId, amount, paymentMethod)'
        });
        return;
      }

      if (amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
        return;
      }

      const creditData: ICreditWalletRequest = {
        amount,
        paymentMethod,
        gatewayTransactionId,
        description: description || `Wallet credited via ${paymentMethod}`
      };

      const wallet = await walletService.creditWallet(userId, creditData);

      res.status(200).json({
        success: true,
        message: 'Wallet credited successfully',
        data: {
          balance: wallet.balance,
          currency: wallet.currency,
          transaction: wallet.transactions[wallet.transactions.length - 1]
        }
      });
    } catch (error: any) {
      console.error('Error crediting wallet:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get wallet transactions
   */
  getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { type, status, startDate, endDate, minAmount, maxAmount } = req.query;

      const filters: ITransactionFilters = {};

      if (type) filters.type = type as any;
      if (status) filters.status = status as any;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (minAmount) filters.minAmount = parseFloat(minAmount as string);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);

      const transactions = await walletService.getWalletTransactions(userId, filters);

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error: any) {
      console.error('Error fetching transactions:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transactions'
      });
    }
  };

  /**
   * Get wallet statistics
   */
  getWalletStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const stats = await walletService.getWalletStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching wallet stats:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch wallet statistics'
      });
    }
  };

  /**
   * Refund to wallet (Admin/Vendor only)
   */
  refundToWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, amount, orderId, description } = req.body;

      if (!userId || !amount || !orderId || !description) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
        return;
      }

      if (amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
        return;
      }

      const wallet = await walletService.refundToWallet(userId, amount, orderId, description);

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          balance: wallet.balance,
          currency: wallet.currency,
          transaction: wallet.transactions[wallet.transactions.length - 1]
        }
      });
    } catch (error: any) {
      console.error('Error processing refund:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Get all wallets (Admin only)
   */
  getAllWallets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const wallets = await walletService.getAllWallets(limit, offset);

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
      console.error('Error fetching all wallets:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch wallets'
      });
    }
  };

  /**
 * Check if user has sufficient balance
 */
  checkBalanceSufficiency = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const amount = parseFloat(req.query.amount as string);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
        return;
      }

      const hasSufficientBalance = await walletService.hasSufficientBalance(userId, amount);

      res.status(200).json({
        success: true,
        data: {
          hasSufficientBalance,
          requestedAmount: amount
        }
      });
    } catch (error: any) {
      console.error('Error checking balance sufficiency:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to check balance'
      });
    }
  };

}

export const walletController = new WalletController();