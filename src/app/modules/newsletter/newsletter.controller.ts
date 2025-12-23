import { Request, Response } from 'express';
import { NewsletterService } from './newsletter.service';
import { ISubscribeNewsletter, SubscriptionStatus } from './newsletter.interface';

export class NewsletterController {
  private service: NewsletterService;

  constructor() {
    this.service = new NewsletterService();
  }

  subscribe = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: ISubscribeNewsletter = req.body;

      if (!data.email) {
        res.status(400).json({
          success: false,
          error: 'Email is required'
        });
        return;
      }

      const newsletter = await this.service.subscribe(data);

      res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: {
          email: newsletter.email,
          status: newsletter.status
        }
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe'
      });
    }
  };

  unsubscribe = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required'
        });
        return;
      }

      const newsletter = await this.service.unsubscribe(email);

      res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
        data: {
          email: newsletter.email,
          status: newsletter.status
        }
      });
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe'
      });
    }
  };

  getAllSubscribers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.query;

      let statusFilter: SubscriptionStatus | undefined;
      if (status === 'active' || status === 'unsubscribed') {
        statusFilter = status as SubscriptionStatus;
      }

      const subscribers = await this.service.getAllSubscribers(statusFilter);

      res.status(200).json({
        success: true,
        count: subscribers.length,
        data: subscribers
      });
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscribers'
      });
    }
  };

  getSubscriberByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const subscriber = await this.service.getSubscriberByEmail(email);

      if (!subscriber) {
        res.status(404).json({
          success: false,
          error: 'Subscriber not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subscriber
      });
    } catch (error) {
      console.error('Error fetching subscriber:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscriber'
      });
    }
  };

  deleteSubscriber = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const subscriber = await this.service.deleteSubscriber(email);

      if (!subscriber) {
        res.status(404).json({
          success: false,
          error: 'Subscriber not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscriber deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete subscriber'
      });
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats();

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

  bulkSubscribe = async (req: Request, res: Response): Promise<void> => {
    try {
      const { emails } = req.body;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Emails array is required'
        });
        return;
      }

      const result = await this.service.bulkSubscribe(emails);

      res.status(200).json({
        success: true,
        message: 'Bulk subscription completed',
        data: result
      });
    } catch (error) {
      console.error('Error in bulk subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process bulk subscription'
      });
    }
  };
}