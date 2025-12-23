import Newsletter from './newsletter.model';
import {
  INewsletter,
  ISubscribeNewsletter,
  SubscriptionStatus,
  INewsletterStats
} from './newsletter.interface';

export class NewsletterService {
  async subscribe(data: ISubscribeNewsletter): Promise<INewsletter> {
    // Check if email already exists
    const existing = await Newsletter.findOne({ email: data.email });
    
    if (existing) {
      // If previously unsubscribed, reactivate
      if (existing.status === SubscriptionStatus.UNSUBSCRIBED) {
        existing.status = SubscriptionStatus.ACTIVE;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = null;
        await existing.save();
        return existing;
      }
      
      throw new Error('Email is already subscribed to newsletter');
    }
    
    const newsletter = new Newsletter(data);
    await newsletter.save();
    return newsletter;
  }

  async unsubscribe(email: string): Promise<INewsletter> {
    const newsletter = await Newsletter.findOne({ email });
    
    if (!newsletter) {
      throw new Error('Email not found in newsletter list');
    }
    
    if (newsletter.status === SubscriptionStatus.UNSUBSCRIBED) {
      throw new Error('Email is already unsubscribed');
    }
    
    newsletter.status = SubscriptionStatus.UNSUBSCRIBED;
    newsletter.unsubscribedAt = new Date();
    await newsletter.save();
    
    return newsletter;
  }

  async getAllSubscribers(status?: SubscriptionStatus): Promise<INewsletter[]> {
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    const subscribers = await Newsletter.find(query).sort({ subscribedAt: -1 });
    return subscribers;
  }

  async getSubscriberByEmail(email: string): Promise<INewsletter | null> {
    const subscriber = await Newsletter.findOne({ email });
    return subscriber;
  }

  async deleteSubscriber(email: string): Promise<INewsletter | null> {
    const subscriber = await Newsletter.findOneAndDelete({ email });
    return subscriber;
  }

  async getStats(): Promise<INewsletterStats> {
    const total = await Newsletter.countDocuments();
    const active = await Newsletter.countDocuments({ status: SubscriptionStatus.ACTIVE });
    const unsubscribed = await Newsletter.countDocuments({ status: SubscriptionStatus.UNSUBSCRIBED });
    
    return { total, active, unsubscribed };
  }

  async bulkSubscribe(emails: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const email of emails) {
      try {
        await this.subscribe({ email });
        success++;
      } catch (error) {
        failed++;
        errors.push(`${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return { success, failed, errors };
  }
}