// src/modules/reviews/review.interface.ts
import { Document, Types } from 'mongoose';

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  feedback: string;
  upVotes: number;
  downVotes: number;
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReply {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ICreateReview {
  product: string;
  user: string;
  rating: number;
  feedback: string;
}

export interface IUpdateReview {
  rating?: number;
  feedback?: string;
}

export interface IReviewQuery {
  product?: string;
  user?: string;
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}