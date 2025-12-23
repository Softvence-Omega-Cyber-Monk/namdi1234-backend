import { Document } from 'mongoose';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  UNSUBSCRIBED = 'unsubscribed'
}

export interface INewsletter extends Document {
  email: string;
  status: SubscriptionStatus;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscribeNewsletter {
  email: string;
}

export interface IUnsubscribeNewsletter {
  email: string;
}

export interface INewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
}