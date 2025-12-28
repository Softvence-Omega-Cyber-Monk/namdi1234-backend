import { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: Schema.Types.ObjectId;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IBulkBlog = IBlog[];