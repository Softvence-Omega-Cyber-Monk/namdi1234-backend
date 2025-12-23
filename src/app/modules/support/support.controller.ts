import { Request, Response } from 'express';
import { SupportMessageService } from './support.service';
import { ICreateSupportMessage, IReplyToMessage, MessageStatus } from './support.interface';

export class SupportMessageController {
  private service: SupportMessageService;

  constructor() {
    this.service = new SupportMessageService();
  }

  createMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: ICreateSupportMessage = req.body;

      if (!data.name || !data.email || !data.subject || !data.message) {
        res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
        return;
      }

      const message = await this.service.createMessage(data);

      res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully',
        data: {
          id: message._id,
          status: message.status
        }
      });
    } catch (error) {
      console.error('Error creating support message:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  };

  getAllMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.query;
      
      const filters: any = {};
      if (status && (status === 'pending' || status === 'resolved')) {
        filters.status = status as MessageStatus;
      }

      const messages = await this.service.getAllMessages(filters);

      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages
      });
    } catch (error) {
      console.error('Error fetching support messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch messages'
      });
    }
  };

  getMessageById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const message = await this.service.getMessageById(id);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error fetching support message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch message'
      });
    }
  };

  replyToMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reply }: IReplyToMessage = req.body;

      if (!reply || reply.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Reply message is required'
        });
        return;
      }

      const message = await this.service.replyToMessage(id, reply);

      res.status(200).json({
        success: true,
        message: 'Reply sent successfully and message marked as resolved',
        data: message
      });
    } catch (error) {
      console.error('Error replying to support message:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reply'
      });
    }
  };

  deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const message = await this.service.deleteMessage(id);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Support message deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting support message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete message'
      });
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getMessageStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  };
}
