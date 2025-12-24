// src/models/payment.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: string;
  transactionId: string;
  orderId: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  gatewayCode?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      length: 3,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'PENDING'],
      required: true,
      default: 'PENDING',
    },
    description: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);