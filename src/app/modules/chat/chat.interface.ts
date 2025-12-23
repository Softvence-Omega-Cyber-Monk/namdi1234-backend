// chat.interface.ts
// This file defines the structure (types) of our chat data

import { Document, Types } from 'mongoose';

// Interface for a single chat message
export interface IMessage {
  senderId: string;           // ID of the person sending the message
  senderType: 'CUSTOMER' | 'VENDOR';  // Whether sender is customer or vendor
  message: string;            // The actual text message
  timestamp: Date;            // When the message was sent
  isRead: boolean;            // Has the message been read?
}

// Interface for User (when populated)
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
}

// Interface for Product (when populated)
export interface IProduct {
  _id: Types.ObjectId;
  productName: string;
  mainImageUrl?: string;
  pricePerUnit?: number;
}

// Base conversation interface (unpopulated)
export interface IConversation extends Document {
  customerId: string | IUser;         // Can be string or populated User object
  vendorId: string | IUser;           // Can be string or populated User object
  productId?: string | IProduct;      // Can be string or populated Product object
  messages: IMessage[];               // Array of all messages in this conversation
  lastMessage: string;                // Preview of the last message sent
  lastMessageTime: Date;              // When the last message was sent
  unreadCount: {                      // Count of unread messages
    customer: number;                 // Unread messages for customer
    vendor: number;                   // Unread messages for vendor
  };
  createdAt: Date;
  updatedAt: Date;
}

// Populated conversation interface (when fields are populated)
export interface IConversationPopulated extends Omit<IConversation, 'customerId' | 'vendorId' | 'productId'> {
  customerId: IUser;
  vendorId: IUser;
  productId?: IProduct;
}

// Data structure for creating a new message
export interface ICreateMessageDTO {
  conversationId: string;
  senderId: string;
  senderType: 'CUSTOMER' | 'VENDOR';
  message: string;
}

// Data structure for getting conversations list
export interface IGetConversationsDTO {
  userId: string;
  userType: 'CUSTOMER' | 'VENDOR';
  page?: number;
  limit?: number;
}

// Data structure for starting a new conversation
export interface IStartConversationDTO {
  customerId: string;
  vendorId: string;
  productId?: string;
  initialMessage?: string;
}