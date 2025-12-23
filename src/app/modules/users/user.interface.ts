import { Document } from "mongoose";

export enum ProductCategory {
  ANALGESICS = "Analgesics",
  ANTIBIOTICS = "Antibiotics",
  CARDIOVASCULAR_MEDICATIONS = "Cardiovascular Medications",
  ANTIDIABETIC_MEDICATIONS = "Antidiabetic Medications",
  CENTRAL_NERVOUS_SYSTEM = "Central Nervous System",
  ALL = "All",
}

export enum ShippingLocation {
    LOCAL = "Local within city state",
    NATIONAL = "National within country",
    INTERNATIONAL = "International"
}

export enum PaymentMethod {
    BANK_ACCOUNT = "Bank Account",
    PAYPAL = "Paypal",
    STRIPE = "Stripe"
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  isActive: boolean;
  profileImage?: string,
  deactivationReason?: string,
  isVerified?: boolean; 
  businessName? : string,
  businessCRNumber?: string,
  CRDocuments?: string,
  businessType?: string,
  businessDescription?: string,
  country?: string,
  productCategory?: ProductCategory[],
  shippingLocation?: ShippingLocation[],
  storeDescription?: string,
  paymentMethod?: PaymentMethod,
  bankAccountHolderName?: string,
  bankAccountNumber?: string,
  bankRoughingNumber?: string,
  taxId?: string,
  isPrivacyPolicyAccepted?: boolean,
  vendorSignature?: string,
  vendorContract?: string,
  isSellerPolicyAccepted?: boolean,
  address?: string;
  phone?: string | null;
  orderNotification?: string,
  promotionNotification?:string,
  communicationAlert?: string,
  newReviewsNotification?: string, 
  createdAt: Date;
  updatedAt: Date;
  language: string,
  //new
  currency: string,
  holdingTime: number,
  categories: string[],  
  storeBanner: string,
  paystackSubaccountCode?: string; // e.g., "ACCT_xxxxx"
  comparePassword(candidatePassword: string): Promise<boolean>;
}
