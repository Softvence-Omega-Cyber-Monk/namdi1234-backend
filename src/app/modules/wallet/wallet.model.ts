import mongoose, { Schema } from 'mongoose';
import { IWallet, TransactionType, TransactionStatus, PaymentMethodForWallet } from './wallet.interface';

const walletTransactionSchema = new Schema({
  transactionId: {
    type: String,
    required: true,
    // REMOVED: unique: true - This causes issues with empty arrays
    index: true // Keep index for query performance
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.COMPLETED
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethodForWallet)
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  gatewayTransactionId: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Balance cannot be negative']
    },
    currency: {
      type: String,
      required: true,
      default: 'BHD',
      uppercase: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    transactions: {
      type: [walletTransactionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
walletSchema.index({ userId: 1 });
walletSchema.index({ 'transactions.transactionId': 1 }); // Non-unique compound index
walletSchema.index({ 'transactions.type': 1 });
walletSchema.index({ 'transactions.status': 1 });
walletSchema.index({ 'transactions.createdAt': -1 });

// Compound index for efficient transaction queries
walletSchema.index({ userId: 1, 'transactions.transactionId': 1 });

// Virtual for total transactions count
walletSchema.virtual('totalTransactions').get(function() {
  return this.transactions.length;
});

// Method to check if sufficient balance exists
walletSchema.methods.hasSufficientBalance = function(amount: number): boolean {
  return this.balance >= amount;
};

export const WalletModel = mongoose.model<IWallet>('Wallet', walletSchema);