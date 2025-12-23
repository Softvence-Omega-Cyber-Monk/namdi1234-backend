// chat.model.ts
// MongoDB schema for chat conversations

import mongoose, { Schema } from 'mongoose';
import { IConversation, IMessage } from './chat.interface';

// Message sub-schema
const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: String,
    required: true,
  },
  senderType: {
    type: String,
    enum: ['CUSTOMER', 'VENDOR'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// Conversation schema
const ConversationSchema = new Schema<IConversation>(
  {
    customerId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    vendorId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    productId: {
      type: String,
      ref: 'Product',
      index: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadCount: {
      customer: {
        type: Number,
        default: 0,
      },
      vendor: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    collection: 'conversations',
  }
);

// Compound index for finding conversations
ConversationSchema.index({ customerId: 1, vendorId: 1 });
ConversationSchema.index({ customerId: 1, vendorId: 1, productId: 1 });

// Index for sorting by last message time
ConversationSchema.index({ lastMessageTime: -1 });

// Virtual for message count
ConversationSchema.virtual('messageCount').get(function () {
  return this.messages.length;
});

// Method to get unread count for a specific user
ConversationSchema.methods.getUnreadCountForUser = function (userType: 'CUSTOMER' | 'VENDOR') {
  return userType === 'CUSTOMER' 
    ? this.unreadCount.customer 
    : this.unreadCount.vendor;
};

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;