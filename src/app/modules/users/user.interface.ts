import { Document } from "mongoose";

export enum ShippingLocation {
  LOCAL = "Local within city state",
  NATIONAL = "National within country",
  INTERNATIONAL = "International"
}

export enum PaymentMethod {
  BANK_ACCOUNT = "Bank Account",
  PAYSTACK = "PAYSTACK",
  STRIPE = "Stripe"
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  isActive: boolean;
  profileImage?: string;
  storeBanner?: string;
  deactivationReason?: string;
  isVerified?: boolean;

  businessName?: string;
  businessType?: string;
  businessDescription?: string;
  country?: string;
  shippingLocation?: ShippingLocation[];
  address?: string;
  phone?: string | null;

  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;       // ← corrected name
  paymentMethod?: PaymentMethod;

  language: string;
  currency: string;
  holdingTime: number;
  categories: string[];

  paystackSubaccountCode?: string;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}