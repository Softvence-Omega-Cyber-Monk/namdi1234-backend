import mongoose, { Schema } from 'mongoose';
import { ISupportMessage, MessageStatus } from './support.interface';

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [5, 'Subject must be at least 5 characters'],
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(MessageStatus),
        message: '{VALUE} is not a valid status'
      },
      default: MessageStatus.PENDING
    },
    adminReply: {
      type: String,
      default: null,
      maxlength: [2000, 'Reply cannot exceed 2000 characters']
    },
    repliedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

supportMessageSchema.index({ status: 1, createdAt: -1 });
supportMessageSchema.index({ email: 1 });

const SupportMessage = mongoose.model<ISupportMessage>('SupportMessage', supportMessageSchema);

export default SupportMessage;