// chat.service.ts
// This file handles the business logic for chat operations

import Conversation from './chat.model';
import {
  IStartConversationDTO,
  IGetConversationsDTO,
  ICreateMessageDTO,
  IConversationPopulated,
} from './chat.interface';

class ChatService {
  /**
   * Start a new conversation or return existing one
   */
  async startConversation(data: IStartConversationDTO) {
    try {
      const { customerId, vendorId, productId, initialMessage } = data;

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        customerId,
        vendorId,
        ...(productId && { productId }),
      });

      // If conversation exists, return it
      if (conversation) {
        // If there's an initial message and no messages yet, add it
        if (initialMessage && conversation.messages.length === 0) {
          conversation.messages.push({
            senderId: customerId,
            senderType: 'CUSTOMER',
            message: initialMessage,
            timestamp: new Date(),
            isRead: false,
          });
          conversation.lastMessage = initialMessage;
          conversation.lastMessageTime = new Date();
          conversation.unreadCount.vendor += 1;
          await conversation.save();
        }
        return conversation;
      }

      // Create new conversation
      const newConversation = new Conversation({
        customerId,
        vendorId,
        productId,
        messages: initialMessage
          ? [
              {
                senderId: customerId,
                senderType: 'CUSTOMER',
                message: initialMessage,
                timestamp: new Date(),
                isRead: false,
              },
            ]
          : [],
        lastMessage: initialMessage || '',
        lastMessageTime: new Date(),
        unreadCount: {
          customer: 0,
          vendor: initialMessage ? 1 : 0,
        },
      });

      await newConversation.save();
      return newConversation;
    } catch (error) {
      console.error('Start conversation service error:', error);
      throw new Error('Failed to start conversation');
    }
  }

  /**
   * Get all conversations for a user (customer or vendor)
   */
  async getConversations(data: IGetConversationsDTO) {
    try {
      const { userId, userType, page = 1, limit = 20 } = data;

      const skip = (page - 1) * limit;

      // Build query based on user type
      const query = userType === 'CUSTOMER' 
        ? { customerId: userId } 
        : { vendorId: userId };

      // Get conversations with pagination
      const conversations = await Conversation.find(query)
        .sort({ lastMessageTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name email avatar')
        .populate('vendorId', 'name email avatar')
        .populate('productId', 'productName mainImageUrl');

      // Get total count for pagination
      const total = await Conversation.countDocuments(query);

      return {
        conversations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get conversations service error:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  /**
   * Get a single conversation by ID
   */
  async getConversationById(conversationId: string, userId: string) {
    try {
      const conversation = await Conversation.findById(conversationId)
        .populate('customerId', 'name email avatar')
        .populate('vendorId', 'name email avatar')
        .populate('productId', 'productName mainImageUrl pricePerUnit') as IConversationPopulated | null;

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Now TypeScript knows these are populated User objects with _id
      const customerIdStr = conversation.customerId._id.toString();
      const vendorIdStr = conversation.vendorId._id.toString();

      // Verify user is part of this conversation
      if (customerIdStr !== userId && vendorIdStr !== userId) {
        throw new Error('Unauthorized access to conversation');
      }

      return conversation;
    } catch (error) {
      console.error('Get conversation by ID service error:', error);
      throw error;
    }
  }

  /**
   * Send a message in an existing conversation
   */
  async sendMessage(data: ICreateMessageDTO) {
    try {
      const { conversationId, senderId, senderType, message } = data;

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Verify sender is part of the conversation
      const isCustomer = conversation.customerId.toString() === senderId;
      const isVendor = conversation.vendorId.toString() === senderId;

      if (!isCustomer && !isVendor) {
        throw new Error('Unauthorized to send message in this conversation');
      }

      // Add message
      conversation.messages.push({
        senderId,
        senderType,
        message,
        timestamp: new Date(),
        isRead: false,
      });

      // Update conversation metadata
      conversation.lastMessage = message;
      conversation.lastMessageTime = new Date();

      // Increment unread count for receiver
      if (senderType === 'CUSTOMER') {
        conversation.unreadCount.vendor += 1;
      } else {
        conversation.unreadCount.customer += 1;
      }

      await conversation.save();

      // Populate and return
      await conversation.populate('customerId', 'name email avatar');
      await conversation.populate('vendorId', 'name email avatar');
      await conversation.populate('productId', 'productName mainImageUrl');

      return conversation;
    } catch (error) {
      console.error('Send message service error:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userType: 'CUSTOMER' | 'VENDOR') {
    try {
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Reset unread count for this user
      if (userType === 'CUSTOMER') {
        conversation.unreadCount.customer = 0;
      } else {
        conversation.unreadCount.vendor = 0;
      }

      // Mark messages as read
      conversation.messages.forEach((msg) => {
        if (msg.senderType !== userType) {
          msg.isRead = true;
        }
      });

      await conversation.save();
      return conversation;
    } catch (error) {
      console.error('Mark as read service error:', error);
      throw new Error('Failed to mark messages as read');
    }
  }

  /**
   * Get total unread message count for a user
   */
  async getUnreadCount(userId: string, userType: 'CUSTOMER' | 'VENDOR') {
    try {
      const query = userType === 'CUSTOMER' 
        ? { customerId: userId } 
        : { vendorId: userId };

      const conversations = await Conversation.find(query);

      const totalUnread = conversations.reduce((total, conv) => {
        return total + (userType === 'CUSTOMER' 
          ? conv.unreadCount.customer 
          : conv.unreadCount.vendor);
      }, 0);

      return totalUnread;
    } catch (error) {
      console.error('Get unread count service error:', error);
      throw new Error('Failed to get unread count');
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string, userId: string) {
    try {
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Verify user is part of this conversation
      if (
        conversation.customerId.toString() !== userId &&
        conversation.vendorId.toString() !== userId
      ) {
        throw new Error('Unauthorized to delete this conversation');
      }

      await conversation.deleteOne();
      return { message: 'Conversation deleted successfully' };
    } catch (error) {
      console.error('Delete conversation service error:', error);
      throw error;
    }
  }

  /**
   * Search conversations by message content or user name
   */
  async searchConversations(
    userId: string,
    userType: 'CUSTOMER' | 'VENDOR',
    searchQuery: string
  ) {
    try {
      const query = userType === 'CUSTOMER' 
        ? { customerId: userId } 
        : { vendorId: userId };

      const conversations = await Conversation.find(query)
        .populate('customerId', 'name email')
        .populate('vendorId', 'name email')
        .populate('productId', 'productName') as IConversationPopulated[];

      // Filter conversations based on search query
      const filtered = conversations.filter((conv) => {
        const customerName = conv.customerId?.name?.toLowerCase() || '';
        const vendorName = conv.vendorId?.name?.toLowerCase() || '';
        const productName = conv.productId?.productName?.toLowerCase() || '';
        const lastMsg = conv.lastMessage?.toLowerCase() || '';
        const search = searchQuery.toLowerCase();

        return (
          customerName.includes(search) ||
          vendorName.includes(search) ||
          productName.includes(search) ||
          lastMsg.includes(search)
        );
      });

      return filtered;
    } catch (error) {
      console.error('Search conversations service error:', error);
      throw new Error('Failed to search conversations');
    }
  }
}

export default new ChatService();