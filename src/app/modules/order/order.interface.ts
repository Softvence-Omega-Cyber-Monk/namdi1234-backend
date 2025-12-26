import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING_FOR_SHIPMENT = 'PREPARING_FOR_SHIPMENT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethodType {
  GATEWAY = 'GATEWAY',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
}

export interface IOrderProduct {
  productId: Types.ObjectId;
  variationId?: Types.ObjectId | null;
  quantity: number;
  price: number;
  total: number;
}

export interface IShippingAddress {
  fullName: string;
  mobileNumber: string;
  country: string;
  addressSpecific: string;
  city: string;
  state: string;
  zipCode: string;
  email?: string;
}

export interface IPaymentHistory {
  paymentGateway: string;
  gatewayTransactionId: string;
  sessionId?: string;
  resultIndicator?: string;
  successIndicator?: string;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  cardType?: string;
  lastFourDigits?: string;
  paymentDate: Date;
  gatewayResponse?: any;
  refundDetails?: {
    refundedAmount: number;
    refundDate: Date;
    refundTransactionId: string;
    reason?: string;
  };
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  orderNumber: string;
  shippingAddress: IShippingAddress;
  products: IOrderProduct[];
  totalPrice: number;
  shippingFee: number;
  discount: number;
  tax: number;
  grandTotal: number;
  promoCode: string | null;
  estimatedDeliveryDate: Date | null;
  actualDeliveryDate: Date | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethodUsed?: PaymentMethodType;
  transactionId?: string;
  orderNotes: string | null;
  trackingNumber: string | null;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }>;
  paymentHistory: IPaymentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrder {
  fullName: string;
  mobileNumber: string;
  email: string;
  country: string;
  addressSpecific: string;
  city: string;
  state: string;
  zipCode: string;
  products: Array<{
    productId: string;
    variationId?: string | null;
    quantity: number;
  }>;
  transactionId: string;
  totalPrice: number;
  shippingFee: number;
  discount?: number;
  tax: number;
  promoCode?: string;
  estimatedDeliveryDate?: string;
  orderNotes?: string;
  paymentMethod?: PaymentMethodType;
}

export interface IUpdateOrderStatus {
  status: OrderStatus;
  note?: string;
  trackingNumber?: string;
}

export interface IUpdatePaymentWithHistory {
  paymentStatus: PaymentStatus;
  paymentHistory: {
    paymentGateway: string;
    gatewayTransactionId: string;
    sessionId?: string;
    resultIndicator?: string;
    successIndicator?: string;
    currency: string;
    paymentMethod?: string;
    cardType?: string;
    lastFourDigits?: string;
    gatewayResponse?: any;
  };
}

export interface IOrderFilters {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  orderNumber?: string;
}

export interface IOrderStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  preparingForShipment: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface IUserOrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
}