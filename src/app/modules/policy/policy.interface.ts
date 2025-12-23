import { Document } from 'mongoose';

export enum PolicyType {
  SELLER_PROTECTION = 'Seller Protection Policy',
  PRIVACY_POLICY = 'Privacy Policy',
  PRIVACY_POLICY_MDITEMS = 'Privacy Policy for MDitems',
  DELIVERY_RETURN = 'Delivery Return Policy',
  COOKIE_POLICY = 'Cookie Policy',
  BUYER_PROTECTION = 'Buyer Protection Policy',
  TERMS_CONDITIONS = 'Terms and Conditions',
  SHIPPING_POLICY = 'Shipping Policy for MDItems'
}

export interface IPolicyVersion {
  version: number;
  content: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface IPolicy extends Document {
  type: PolicyType;
  slug: string;
  title: string;
  content: string;
  contentFormat: 'plain' | 'html';
  isActive: boolean;
  versions: IPolicyVersion[];
  lastUpdatedBy?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePolicy {
  type: PolicyType;
  title: string;
  content: string;
  contentFormat?: 'plain' | 'html';
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface IUpdatePolicy {
  title?: string;
  content?: string;
  contentFormat?: 'plain' | 'html';
  isActive?: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface IPolicyFilters {
  type?: PolicyType;
  isActive?: boolean;
  searchTerm?: string;
}