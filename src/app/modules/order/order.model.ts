import mongoose, { Schema } from 'mongoose';
import { IOrder, OrderStatus, PaymentStatus, PaymentMethodType } from './order.interface';

const orderProductSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  }
}, { _id: false });

const shippingAddressSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please provide a valid mobile number']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  addressSpecific: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    trim: true
  }
}, { _id: false });

const statusHistorySchema = new Schema({
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  }
}, { _id: false });

const paymentHistorySchema = new Schema({
  paymentGateway: {
    type: String,
    required: true,
    trim: true
  },
  gatewayTransactionId: {
    type: String,
    required: true,
    trim: true
  },
  sessionId: {
    type: String,
    trim: true
  },
  resultIndicator: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'BHD'
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    required: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  gatewayResponse: {
    type: Schema.Types.Mixed
  },
  refundDetails: {
    refundedAmount: Number,
    refundDate: Date,
    refundTransactionId: String,
    reason: String
  }
}, { _id: false });

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required']
    },
    products: {
      type: [orderProductSchema],
      required: [true, 'At least one product is required'],
      validate: {
        validator: function(products: any[]) {
          return products && products.length > 0;
        },
        message: 'Order must contain at least one product'
      }
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    shippingFee: {
      type: Number,
      required: [true, 'Shipping fee is required'],
      default: 0,
      min: [0, 'Shipping fee cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    grandTotal: {
      type: Number,
      required: [true, 'Grand total is required'],
      min: [0, 'Grand total cannot be negative']
    },
    promoCode: {
      type: String,
      default: null,
      uppercase: true,
      trim: true
    },
    estimatedDeliveryDate: {
      type: Date,
      default: null
    },
    actualDeliveryDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: Object.values(OrderStatus),
        message: '{VALUE} is not a valid order status'
      },
      default: OrderStatus.PENDING,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: {
        values: Object.values(PaymentStatus),
        message: '{VALUE} is not a valid payment status'
      },
      default: PaymentStatus.PENDING,
      index: true
    },
    paymentMethodUsed: {
      type: String,
      enum: {
        values: Object.values(PaymentMethodType),
        message: '{VALUE} is not a valid payment method'
      },
      default: PaymentMethodType.GATEWAY
    },
    shippingMethodId: {
      type: Schema.Types.ObjectId,
      ref: 'ShipmentCompany',
      required: [true, 'Shipping method is required']
    },
    transactionId: {
      type: String,
      trim: true,
      index: true
    },
    orderNotes: {
      type: String,
      default: null,
      maxlength: [1000, 'Order notes cannot exceed 1000 characters']
    },
    trackingNumber: {
      type: String,
      default: null,
      trim: true
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    },
    paymentHistory: {
      type: [paymentHistorySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ transactionId: 1 });
orderSchema.index({ 'shippingAddress.mobileNumber': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'paymentHistory.gatewayTransactionId': 1 });
orderSchema.index({ paymentMethodUsed: 1 });

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Calculate grand total before saving
orderSchema.pre('save', function(next) {
  this.grandTotal = this.totalPrice + this.shippingFee + this.tax - this.discount;
  next();
});

// Virtual for checking if order is delivered
orderSchema.virtual('isDelivered').get(function() {
  return this.status === OrderStatus.DELIVERED;
});

// Virtual for checking if order can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return this.status === OrderStatus.PENDING || 
         this.status === OrderStatus.CONFIRMED ||
         this.status === OrderStatus.PREPARING_FOR_SHIPMENT;
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;