import { Document, Types } from 'mongoose';

export enum TransactionType {
  CREDIT = 'Credit',
  DEBIT = 'Debit',
  REFUND = 'Refund',
  WITHDRAWAL = 'Withdrawal'
}

export enum TransactionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled'
}

export enum PaymentMethodForWallet {
  CARD = 'Card',
  BANK_TRANSFER = 'Bank Transfer',
  MASTERCARD_GATEWAY = 'Mastercard Gateway'
}

export interface IWalletTransaction {
  transactionId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethodForWallet;
  orderId?: Types.ObjectId;
  gatewayTransactionId?: string;
  metadata?: any;
  createdAt: Date;
}

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  currency: string;
  isActive: boolean;
  transactions: IWalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreditWalletRequest {
  amount: number;
  paymentMethod: PaymentMethodForWallet;
  sessionId?: string;
  gatewayTransactionId?: string;
  description?: string;
}

export interface IDebitWalletRequest {
  amount: number;
  orderId?: string;
  description: string;
}

export interface IWalletBalance {
  balance: number;
  currency: string;
  userId: string;
}

export interface ITransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}