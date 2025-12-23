// chat.controller.ts
// This file handles HTTP requests and sends responses

import { Request, Response } from 'express';
import chatService from './chat.service';

class ChatController {

  /**
   * Start a new conversation
   * POST /api/chat/conversations
   */
  async startConversation(req: Request, res: Response) {
    try {
      const { customerId, vendorId, productId, initialMessage } = req.body;

      // Validate required fields
      if (!customerId || !vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID and Vendor ID are required'
        });
      }

      // Call service to create/get conversation
      const conversation = await chatService.startConversation({
        customerId,
        vendorId,
        productId,
        initialMessage
      });

      return res.status(201).json({
        success: true,
        message: 'Conversation started successfully',
        data: conversation
      });

    } catch (error) {
      console.error('Start conversation error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  /**
   * Get all conversations for a user
   * GET /api/chat/conversations?userId=xxx&userType=CUSTOMER&page=1&limit=20
   */
  async getConversations(req: Request, res: Response) {
    try {
      const { userId, userType, page, limit } = req.query;

      // Validate required fields
      if (!userId || !userType) {
        return res.status(400).json({
          success: false,
          message: 'User ID and User Type are required'
        });
      }

      if (userType !== 'CUSTOMER' && userType !== 'VENDOR') {
        return res.status(400).json({
          success: false,
          message: 'User Type must be either CUSTOMER or VENDOR'
        });
      }

      // Get conversations from service
      const result = await chatService.getConversations({
        userId: userId as string,
        userType: userType as 'CUSTOMER' | 'VENDOR',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      return res.status(200).json({
        success: true,
        message: 'Conversations fetched successfully',
        data: result.conversations,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get conversations error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  /**
   * Get a single conversation by ID
   * GET /api/chat/conversations/:conversationId?userId=xxx
   */
  async getConversationById(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;

      // Validate required fields
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Get conversation from service
      const conversation = await chatService.getConversationById(
        conversationId,
        userId as string
      );

      return res.status(200).json({
        success: true,
        message: 'Conversation fetched successfully',
        data: conversation
      });

    } catch (error) {
      console.error('Get conversation error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  /**
   * Mark messages as read
   * PUT /api/chat/conversations/:conversationId/read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { userType } = req.body;

      // Validate required fields
      if (!userType || (userType !== 'CUSTOMER' && userType !== 'VENDOR')) {
        return res.status(400).json({
          success: false,
          message: 'Valid User Type (CUSTOMER/VENDOR) is required'
        });
      }

      // Mark messages as read
      const conversation = await chatService.markMessagesAsRead(
        conversationId,
        userType
      );

      return res.status(200).json({
        success: true,
        message: 'Messages marked as read',
        data: conversation
      });

    } catch (error) {
      console.error('Mark as read error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  /**
   * Send a message in a conversation
   * POST /api/chat/conversations/:conversationId/messages
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { senderId, senderType, message } = req.body;

      // Validate required fields
      if (!senderId || !senderType || !message) {
        return res.status(400).json({
          success: false,
          message: 'Sender ID, Sender Type, and Message are required'
        });
      }

      if (senderType !== 'CUSTOMER' && senderType !== 'VENDOR') {
        return res.status(400).json({
          success: false,
          message: 'Sender Type must be either CUSTOMER or VENDOR'
        });
      }

      // Send message
      const conversation = await chatService.sendMessage({
        conversationId,
        senderId,
        senderType,
        message
      });

      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: conversation
      });

    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  /**
   * Delete a conversation
   * DELETE /api/chat/conversations/:conversationId?userId=xxx
   */
  async deleteConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await chatService.deleteConversation(
        conversationId,
        userId as string
      );

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Delete conversation error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  /**
   * Search conversations
   * GET /api/chat/search?userId=xxx&userType=CUSTOMER&query=hello
   */
  async searchConversations(req: Request, res: Response) {
    try {
      const { userId, userType, query } = req.query;

      if (!userId || !userType || !query) {
        return res.status(400).json({
          success: false,
          message: 'User ID, User Type, and Search Query are required'
        });
      }

      if (userType !== 'CUSTOMER' && userType !== 'VENDOR') {
        return res.status(400).json({
          success: false,
          message: 'User Type must be either CUSTOMER or VENDOR'
        });
      }

      const conversations = await chatService.searchConversations(
        userId as string,
        userType as 'CUSTOMER' | 'VENDOR',
        query as string
      );

      return res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: conversations
      });

    } catch (error) {
      console.error('Search conversations error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  /**
   * Get unread message count
   * GET /api/chat/unread?userId=xxx&userType=CUSTOMER
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const { userId, userType } = req.query;

      // Validate required fields
      if (!userId || !userType) {
        return res.status(400).json({
          success: false,
          message: 'User ID and User Type are required'
        });
      }

      if (userType !== 'CUSTOMER' && userType !== 'VENDOR') {
        return res.status(400).json({
          success: false,
          message: 'User Type must be either CUSTOMER or VENDOR'
        });
      }

      // Get unread count
      const unreadCount = await chatService.getUnreadCount(
        userId as string,
        userType as 'CUSTOMER' | 'VENDOR'
      );

      return res.status(200).json({
        success: true,
        message: 'Unread count fetched successfully',
        data: { unreadCount }
      });

    } catch (error) {
      console.error('Get unread count error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }
}

// Export a single instance of the controller
export default new ChatController();