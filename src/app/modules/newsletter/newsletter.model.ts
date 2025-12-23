import mongoose, { Schema } from 'mongoose';
import { INewsletter, SubscriptionStatus } from './newsletter.interface';

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    status: {
      type: String,
      enum: {
        values: Object.values(SubscriptionStatus),
        message: '{VALUE} is not a valid status'
      },
      default: SubscriptionStatus.ACTIVE
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    unsubscribedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ subscribedAt: -1 });

const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);

export default Newsletter;