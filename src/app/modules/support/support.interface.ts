import { Document } from 'mongoose';

export enum MessageStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved'
}

export interface ISupportMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  adminReply: string | null;
  repliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSupportMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface IReplyToMessage {
  reply: string;
}

export interface IEmailTemplate {
  subject: string;
  html: string;
}

export interface IEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IQueryFilters {
  status?: MessageStatus;
}