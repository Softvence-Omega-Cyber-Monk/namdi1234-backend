import SupportMessage from './support.model';
import {
  ISupportMessage,
  ICreateSupportMessage,
  IQueryFilters,
  MessageStatus
} from './support.interface';
import { EmailService } from './email.service';
import { EmailTemplates } from '../../../utils/emailTemplates';

export class SupportMessageService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async createMessage(data: ICreateSupportMessage): Promise<ISupportMessage> {
    const message = new SupportMessage(data);
    await message.save();

    await this.emailService.sendEmail(
      data.email,
      EmailTemplates.userConfirmation(data.name, data.subject)
    );

    return message;
  }

  async getAllMessages(filters: IQueryFilters = {}): Promise<ISupportMessage[]> {
    const query: any = {};
    
    if (filters.status) {
      query.status = filters.status;
    }

    const messages = await SupportMessage.find(query).sort({ createdAt: -1 });
    return messages;
  }

  async getMessageById(id: string): Promise<ISupportMessage | null> {
    const message = await SupportMessage.findById(id);
    return message;
  }

  async replyToMessage(id: string, reply: string): Promise<ISupportMessage> {
    const message = await SupportMessage.findById(id);
    
    if (!message) {
      throw new Error('Message not found');
    }

    message.adminReply = reply;
    message.status = MessageStatus.RESOLVED;
    message.repliedAt = new Date();

    await message.save();

    const emailResult = await this.emailService.sendEmail(
      message.email,
      EmailTemplates.adminReply(
        message.name,
        message.subject,
        message.message,
        reply
      )
    );

    if (!emailResult.success) {
      throw new Error(`Email sending failed: ${emailResult.error}`);
    }

    return message;
  }

  async deleteMessage(id: string): Promise<ISupportMessage | null> {
    const message = await SupportMessage.findByIdAndDelete(id);
    return message;
  }

  async getMessageStats(): Promise<{ total: number; pending: number; resolved: number }> {
    const total = await SupportMessage.countDocuments();
    const pending = await SupportMessage.countDocuments({ status: MessageStatus.PENDING });
    const resolved = await SupportMessage.countDocuments({ status: MessageStatus.RESOLVED });

    return { total, pending, resolved };
  }
}