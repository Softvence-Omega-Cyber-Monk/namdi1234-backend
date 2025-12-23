import { WalletModel } from './wallet.model';
import { 
  IWallet, 
  ICreditWalletRequest, 
  IDebitWalletRequest, 
  IWalletBalance,
  ITransactionFilters,
  TransactionType,
  TransactionStatus,
  IWalletTransaction
} from './wallet.interface';
import { v4 as uuidv4 } from 'uuid';
import mongoose, { Document } from 'mongoose';

type WalletDocument = Document<unknown, {}, IWallet> & IWallet & Required<{ _id: unknown }> & { __v: number };

export class WalletService {
  /**
   * Create a new wallet for a user
   */
  async createWallet(userId: string): Promise<WalletDocument> {
    try {
      const existingWallet = await WalletModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      
      if (existingWallet) {
        throw new Error('Wallet already exists for this user');
      }

      const wallet = new WalletModel({
        userId: new mongoose.Types.ObjectId(userId),
        balance: 0,
        currency: 'BHD',
        isActive: true,
        transactions: []
      });

      await wallet.save();
      return wallet;
    } catch (error: any) {
      console.error('Error creating wallet:', error.message);
      throw error;
    }
  }

  /**
   * Get or create wallet for a user
   */
  async getOrCreateWallet(userId: string): Promise<WalletDocument> {
    try {
      let wallet = await WalletModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      
      if (!wallet) {
        wallet = await this.createWallet(userId);
      }

      return wallet;
    } catch (error: any) {
      console.error('Error getting or creating wallet:', error.message);
      throw error;
    }
  }

  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: string): Promise<WalletDocument | null> {
    try {
      return await WalletModel.findOne({ userId: new mongoose.Types.ObjectId(userId) })
        .populate('userId', 'name email phone');
    } catch (error: any) {
      console.error('Error fetching wallet:', error.message);
      throw new Error('Failed to fetch wallet');
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(userId: string): Promise<IWalletBalance> {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      return {
        balance: wallet.balance,
        currency: wallet.currency,
        userId: userId
      };
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error.message);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  /**
   * Credit wallet (add money)
   */
  async creditWallet(userId: string, data: ICreditWalletRequest): Promise<WalletDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await this.getOrCreateWallet(userId);

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + data.amount;

      const transaction: IWalletTransaction = {
        transactionId: `TXN-CREDIT-${uuidv4()}`,
        type: TransactionType.CREDIT,
        amount: data.amount,
        balanceBefore,
        balanceAfter,
        description: data.description || `Wallet credited via ${data.paymentMethod}`,
        status: TransactionStatus.COMPLETED,
        paymentMethod: data.paymentMethod,
        gatewayTransactionId: data.gatewayTransactionId,
        metadata: {
          sessionId: data.sessionId
        },
        createdAt: new Date()
      };

      wallet.balance = balanceAfter;
      wallet.transactions.push(transaction);

      await wallet.save({ session });
      await session.commitTransaction();

      return wallet;
    } catch (error: any) {
      await session.abortTransaction();
      console.error('Error crediting wallet:', error.message);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Debit wallet (deduct money)
   */
  async debitWallet(userId: string, data: IDebitWalletRequest): Promise<WalletDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await WalletModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).session(session);

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balance < data.amount) {
        throw new Error('Insufficient wallet balance');
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - data.amount;

      const transaction: IWalletTransaction = {
        transactionId: `TXN-DEBIT-${uuidv4()}`,
        type: TransactionType.DEBIT,
        amount: data.amount,
        balanceBefore,
        balanceAfter,
        description: data.description,
        status: TransactionStatus.COMPLETED,
        orderId: data.orderId ? new mongoose.Types.ObjectId(data.orderId) : undefined,
        createdAt: new Date()
      };

      wallet.balance = balanceAfter;
      wallet.transactions.push(transaction);

      await wallet.save({ session });
      await session.commitTransaction();

      return wallet;
    } catch (error: any) {
      await session.abortTransaction();
      console.error('Error debiting wallet:', error.message);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Refund to wallet
   */
  async refundToWallet(userId: string, amount: number, orderId: string, description: string): Promise<WalletDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await this.getOrCreateWallet(userId);

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      const transaction: IWalletTransaction = {
        transactionId: `TXN-REFUND-${uuidv4()}`,
        type: TransactionType.REFUND,
        amount,
        balanceBefore,
        balanceAfter,
        description,
        status: TransactionStatus.COMPLETED,
        orderId: new mongoose.Types.ObjectId(orderId),
        createdAt: new Date()
      };

      wallet.balance = balanceAfter;
      wallet.transactions.push(transaction);

      await wallet.save({ session });
      await session.commitTransaction();

      return wallet;
    } catch (error: any) {
      await session.abortTransaction();
      console.error('Error refunding to wallet:', error.message);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get wallet transactions with filters
   */
  async getWalletTransactions(userId: string, filters?: ITransactionFilters): Promise<IWalletTransaction[]> {
    try {
      const wallet = await WalletModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!wallet) {
        return [];
      }

      let transactions = wallet.transactions;

      // Apply filters
      if (filters) {
        transactions = transactions.filter(txn => {
          if (filters.type && txn.type !== filters.type) return false;
          if (filters.status && txn.status !== filters.status) return false;
          if (filters.minAmount && txn.amount < filters.minAmount) return false;
          if (filters.maxAmount && txn.amount > filters.maxAmount) return false;
          if (filters.startDate && new Date(txn.createdAt) < filters.startDate) return false;
          if (filters.endDate && new Date(txn.createdAt) > filters.endDate) return false;
          return true;
        });
      }

      // Sort by date descending
      transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return transactions;
    } catch (error: any) {
      console.error('Error fetching wallet transactions:', error.message);
      throw new Error('Failed to fetch wallet transactions');
    }
  }

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const wallet = await this.getWalletByUserId(userId);
      return wallet ? wallet.balance >= amount : false;
    } catch (error: any) {
      console.error('Error checking balance:', error.message);
      return false;
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(userId: string): Promise<any> {
    try {
      const wallet = await WalletModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!wallet) {
        return {
          currentBalance: 0,
          totalCredits: 0,
          totalDebits: 0,
          totalRefunds: 0,
          totalTransactions: 0
        };
      }

      const totalCredits = wallet.transactions
        .filter(txn => txn.type === TransactionType.CREDIT && txn.status === TransactionStatus.COMPLETED)
        .reduce((sum, txn) => sum + txn.amount, 0);

      const totalDebits = wallet.transactions
        .filter(txn => txn.type === TransactionType.DEBIT && txn.status === TransactionStatus.COMPLETED)
        .reduce((sum, txn) => sum + txn.amount, 0);

      const totalRefunds = wallet.transactions
        .filter(txn => txn.type === TransactionType.REFUND && txn.status === TransactionStatus.COMPLETED)
        .reduce((sum, txn) => sum + txn.amount, 0);

      return {
        currentBalance: wallet.balance,
        totalCredits: Math.round(totalCredits * 100) / 100,
        totalDebits: Math.round(totalDebits * 100) / 100,
        totalRefunds: Math.round(totalRefunds * 100) / 100,
        totalTransactions: wallet.transactions.length,
        currency: wallet.currency
      };
    } catch (error: any) {
      console.error('Error fetching wallet stats:', error.message);
      throw new Error('Failed to fetch wallet statistics');
    }
  }

  /**
   * Get all wallets (Admin only)
   */
  async getAllWallets(limit: number = 50, offset: number = 0): Promise<WalletDocument[]> {
    try {
      return await WalletModel.find()
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    } catch (error: any) {
      console.error('Error fetching all wallets:', error.message);
      throw new Error('Failed to fetch wallets');
    }
  }
}

export const walletService = new WalletService();