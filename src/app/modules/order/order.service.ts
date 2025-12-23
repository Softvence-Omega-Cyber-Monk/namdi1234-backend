import Order from './order.model';
import { payoutService } from '../payout/payout.service';
import { emailService } from './email.service';
import mongoose from 'mongoose';
import {
  IOrder,
  IUpdateOrderStatus,
  IOrderFilters,
  IOrderStats,
  IUserOrderStats,
  OrderStatus,
  PaymentStatus,
  PaymentMethodType
} from './order.interface';
import { walletService } from '../wallet/wallet.service';

export class OrderService {
  async createOrder(userId: string, data: any): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch products from database to populate product details
      const Product = mongoose.model('Product');
      const productIds = data.products.map((p: { productId: number; }) => new mongoose.Types.ObjectId(p.productId));

      const products = await Product.find({ _id: { $in: productIds } })
        .select('_id pricePerUnit specialPrice specialPriceStartingDate specialPriceEndingDate productName userId')
        .populate('userId', 'name email role businessName');

      if (products.length !== data.products.length) {
        throw new Error('One or more products not found');
      }

      // Create a map for quick price lookup
      const productMap = new Map();
      const vendorProductsMap = new Map(); // For email notifications

      products.forEach((product: any) => {
        let currentPrice = product.pricePerUnit;

        if (
          product.specialPrice &&
          product.specialPriceStartingDate &&
          product.specialPriceEndingDate
        ) {
          const now = new Date();
          const startDate = new Date(product.specialPriceStartingDate);
          const endDate = new Date(product.specialPriceEndingDate);

          if (now >= startDate && now <= endDate) {
            currentPrice = product.specialPrice;
          }
        }

        productMap.set(product._id.toString(), {
          price: currentPrice,
          productName: product.productName,
          vendor: product.userId
        });

        // Group products by vendor for email notification
        if (product.userId && product.userId.email) {
          const vendorId = product.userId._id.toString();
          if (!vendorProductsMap.has(vendorId)) {
            vendorProductsMap.set(vendorId, {
              vendorEmail: product.userId.email,
              vendorName: product.userId.name || product.userId.businessName || 'Vendor',
              products: []
            });
          }
        }
      });

      // Map products with prices and totals
      const orderProducts = data.products.map((item: { productId: number; quantity: number; }) => {
        const productData = productMap.get(item.productId);
        if (!productData) {
          throw new Error(`Price not found for product ${item.productId}`);
        }

        // Add to vendor's product list for email
        if (productData.vendor && productData.vendor.email) {
          const vendorId = productData.vendor._id.toString();
          const vendorData = vendorProductsMap.get(vendorId);
          if (vendorData) {
            vendorData.products.push({
              productName: productData.productName,
              quantity: item.quantity,
              price: productData.price,
              total: item.quantity * productData.price
            });
          }
        }

        return {
          productId: new mongoose.Types.ObjectId(item.productId),
          quantity: item.quantity,
          price: productData.price,
          total: item.quantity * productData.price
        };
      });

      // Use values from frontend
      const discount = data.discount || 0;
      const grandTotal = data.totalPrice + data.shippingFee + data.tax - discount;

      // Generate a unique order number (always uppercase)
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Set estimated delivery date (7 days from now if not provided)
      const estimatedDeliveryDate = data.estimatedDeliveryDate
        ? new Date(data.estimatedDeliveryDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Initialize payment variables
      let paymentStatus = PaymentStatus.PENDING;
      let orderStatus = OrderStatus.PENDING;
      let transactionId = data.transactionId || null;
      let paymentMethodUsed = data.paymentMethod || PaymentMethodType.GATEWAY;
      const paymentHistory: any[] = [];

      // Handle wallet payment - check balance first
      if (data.paymentMethod === 'WALLET') {
        console.log('Processing wallet payment for order:', orderNumber);

        // Check if user has sufficient balance BEFORE creating order
        const hasSufficient = await walletService.hasSufficientBalance(userId, grandTotal);

        if (!hasSufficient) {
          const balance = await walletService.getWalletBalance(userId);
          throw new Error(
            `Insufficient wallet balance. Available: ${balance.balance.toFixed(3)} BHD, Required: ${grandTotal.toFixed(3)} BHD`
          );
        }

        // Generate wallet transaction ID
        transactionId = `WALLET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        console.log('Wallet balance verified. Proceeding with order creation.');

        // Set payment as completed for wallet
        paymentStatus = PaymentStatus.COMPLETED;
        orderStatus = OrderStatus.CONFIRMED;
        paymentMethodUsed = PaymentMethodType.WALLET;

        // Add wallet payment to history
        paymentHistory.push({
          paymentGateway: 'Wallet System',
          gatewayTransactionId: transactionId,
          currency: 'BHD',
          paymentStatus: PaymentStatus.COMPLETED,
          paymentMethod: 'Wallet',
          paymentDate: new Date(),
          gatewayResponse: {
            success: true,
            message: 'Payment processed via wallet',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // Gateway payment - will be processed later
        paymentMethodUsed = PaymentMethodType.GATEWAY;
      }

      const orderData = {
        orderNumber,
        userId: new mongoose.Types.ObjectId(userId),
        shippingAddress: {
          fullName: data.fullName,
          mobileNumber: data.mobileNumber,
          country: data.country,
          addressSpecific: data.addressSpecific,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        },
        products: orderProducts,
        totalPrice: data.totalPrice,
        shippingFee: data.shippingFee,
        discount: discount,
        tax: data.tax,
        grandTotal: grandTotal,
        promoCode: data.promoCode || null,
        estimatedDeliveryDate,
        shippingMethodId: new mongoose.Types.ObjectId(data.shippingMethodId),
        orderNotes: data.orderNotes || null,
        status: orderStatus,
        paymentStatus: paymentStatus,
        paymentMethodUsed: paymentMethodUsed,
        transactionId: transactionId,
        paymentHistory: paymentHistory,
        statusHistory: [{
          status: orderStatus,
          timestamp: new Date(),
          note: paymentMethodUsed === PaymentMethodType.WALLET
            ? 'Order created and paid via wallet'
            : 'Order created - awaiting payment'
        }]
      };

      const order = new Order(orderData);
      await order.save({ session });

      // Now debit wallet AFTER order is created (so we have the order ID)
      if (data.paymentMethod === 'WALLET') {
        try {
          const walletResult = await walletService.debitWallet(userId, {
            amount: grandTotal,
            orderId: (order._id as string).toString(),
            description: `Payment for order ${orderNumber}`
          });

          console.log('✅ Wallet debited successfully:', walletResult.balance, 'BHD');
        } catch (walletError) {
          // If wallet debit fails, we need to rollback the order creation
          throw new Error(`Failed to debit wallet: ${walletError instanceof Error ? walletError.message : 'Unknown error'}`);
        }
      }

      await session.commitTransaction();

      // Populate product details for response
      await order.populate('products.productId', 'productName mainImageUrl pricePerUnit specialPrice');
      await order.populate('userId', 'name email');

      // ===== Send email notifications =====
      try {
        console.log('📧 Sending order notification emails...');

        // Send email to each vendor
        for (const [vendorId, vendorData] of vendorProductsMap) {
          try {
            await emailService.sendVendorOrderNotification({
              vendorEmail: vendorData.vendorEmail,
              vendorName: vendorData.vendorName,
              order: order.toObject(),
              products: vendorData.products
            });
            console.log(`✅ Vendor notification sent to: ${vendorData.vendorEmail}`);
          } catch (vendorEmailError) {
            console.error(`❌ Failed to send email to vendor ${vendorData.vendorEmail}:`, vendorEmailError);
          }
        }

        // Send confirmation email to customer
        const customer = order.userId as any;
        if (customer && customer.email) {
          try {
            await emailService.sendCustomerOrderConfirmation(
              customer.email,
              customer.name || data.fullName,
              order.toObject()
            );
            console.log(`✅ Customer confirmation sent to: ${customer.email}`);
          } catch (customerEmailError) {
            console.error(`❌ Failed to send email to customer ${customer.email}:`, customerEmailError);
          }
        }

        // Send notification to admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail) {
          try {
            await emailService.sendAdminOrderNotification(adminEmail, order.toObject());
            console.log(`✅ Admin notification sent to: ${adminEmail}`);
          } catch (adminEmailError) {
            console.error(`❌ Failed to send email to admin:`, adminEmailError);
          }
        }
      } catch (emailError) {
        console.error('❌ Error in email notification process:', emailError);
        // Don't throw - order is already created
      }

      return order;
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Error creating order:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllOrders(filters: IOrderFilters = {}): Promise<IOrder[]> {
    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters.orderNumber) {
      query.orderNumber = filters.orderNumber.toUpperCase();
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone address')
      .populate('products.productId')
      .populate('shippingMethodId', 'name code contactEmail contactPhone trackingUrl')
      .sort({ createdAt: -1 });

    return orders;
  }

  async getOrderById(orderId: string): Promise<IOrder | null> {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone address')
      .populate('products.productId')
      .populate('shippingMethodId', 'name code description contactEmail contactPhone trackingUrl logo');

    return order;
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() })
      .populate('userId', 'name email phone')
      .populate('products.productId')
      .populate('shippingMethodId', 'name code trackingUrl');

    return order;
  }

  async getUserOrders(userId: string, filters?: { status?: OrderStatus }): Promise<IOrder[]> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters?.status) {
      query.status = filters.status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('products.productId')
      .populate('shippingMethodId', 'name code trackingUrl')
      .sort({ createdAt: -1 });

    return orders;
  }

  async updateOrderStatus(
    orderId: string,
    data: IUpdateOrderStatus
  ): Promise<IOrder> {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate({
        path: 'products.productId',
        select: 'userId productName',
        populate: {
          path: 'userId',
          select: '_id name email businessName'
        }
      });

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, data.status);

    const previousStatus = order.status;

    // Update status
    order.status = data.status;

    // Add to status history
    order.statusHistory.push({
      status: data.status,
      timestamp: new Date(),
      note: data.note
    });

    // Update tracking number if provided
    if (data.trackingNumber) {
      order.trackingNumber = data.trackingNumber;
    }

    // Set actual delivery date if status is delivered
    if (data.status === OrderStatus.DELIVERED && !order.actualDeliveryDate) {
      order.actualDeliveryDate = new Date();

      // Create vendor earning when order is delivered
      try {
        console.log(`📦 Order ${order.orderNumber} marked as DELIVERED. Creating vendor earnings...`);

        // Get unique vendors from products
        const vendorIds = new Set<string>();
        const vendorOrderAmounts = new Map<string, number>();

        for (const orderProduct of order.products) {
          const product = orderProduct.productId as any;

          if (product?.userId?._id) {
            const vendorId = product.userId._id.toString();
            vendorIds.add(vendorId);

            // Calculate vendor's share of this order based on their products
            const currentAmount = vendorOrderAmounts.get(vendorId) || 0;
            vendorOrderAmounts.set(vendorId, currentAmount + orderProduct.total);
          }
        }

        if (vendorIds.size === 0) {
          console.error(`❌ No vendors found for order ${order.orderNumber}`);
        } else {
          console.log(`Found ${vendorIds.size} vendor(s) for order ${order.orderNumber}`);

          // Create earnings for each vendor based on their products
          for (const vendorId of vendorIds) {
            const vendorAmount = vendorOrderAmounts.get(vendorId) || 0;

            try {
              const earning = await payoutService.createVendorEarning(
                vendorId,
                (order._id as any).toString(),
                order.orderNumber,
                vendorAmount
              );

              console.log(`✅ Vendor earning created for vendor ${vendorId}. Amount: ${earning.vendorShare} BHD (90% of ${vendorAmount} BHD)`);
            } catch (vendorError) {
              console.error(`❌ Error creating earning for vendor ${vendorId}:`, vendorError);
            }
          }

          // Create admin commission record (10% of total order)
          try {
            await payoutService.createAdminCommission(
              (order._id as any).toString(),
              order.orderNumber,
              order.grandTotal
            );
            console.log(`✅ Admin commission recorded for order ${order.orderNumber}`);
          } catch (commissionError) {
            console.error(`❌ Error creating admin commission:`, commissionError);
          }
        }
      } catch (error) {
        console.error('❌ Error creating vendor earning:', error);
        // Don't throw error to prevent order status update failure
      }
    }

    await order.save();

    // Send email notification to customer about status change
    try {
      const customer = order.userId as any;
      if (customer && customer.email) {
        await emailService.sendOrderStatusUpdateEmail(
          customer.email,
          customer.name || order.shippingAddress.fullName,
          order.toObject(),
          previousStatus,
          data.status
        );
        console.log(`✅ Status update email sent to customer: ${customer.email}`);
      }
    } catch (emailError) {
      console.error('❌ Error sending status update email:', emailError);
      // Don't throw - order is already updated
    }

    return order;
  }

  async cancelOrder(orderId: string, reason?: string): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId)
        .populate('userId', 'name email')
        .session(session);

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (order.status === OrderStatus.DELIVERED) {
        throw new Error('Cannot cancel a delivered order');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new Error('Order is already cancelled');
      }

      if (order.status === OrderStatus.OUT_FOR_DELIVERY) {
        throw new Error('Cannot cancel order that is out for delivery');
      }

      // If order was paid via wallet, refund to wallet
      if (order.paymentStatus === PaymentStatus.COMPLETED &&
        order.paymentHistory.some(p => p.paymentGateway === 'Wallet System')) {
        await walletService.refundToWallet(
          order.userId.toString(),
          order.grandTotal,
          order.id.toString(),
          `Refund for cancelled order ${order.orderNumber}`
        );
        console.log(`✅ Refunded ${order.grandTotal} BHD to wallet for cancelled order ${order.orderNumber}`);
      }

      // Update status to cancelled
      order.status = OrderStatus.CANCELLED;
      order.paymentStatus = PaymentStatus.REFUNDED;
      order.statusHistory.push({
        status: OrderStatus.CANCELLED,
        timestamp: new Date(),
        note: reason || 'Order cancelled by user'
      });

      await order.save({ session });
      await session.commitTransaction();

      // Send cancellation email to customer
      try {
        const customer = order.userId as any;
        if (customer && customer.email) {
          await emailService.sendOrderCancellationEmail(
            customer.email,
            customer.name || order.shippingAddress.fullName,
            order.toObject(),
            reason
          );
          console.log(`✅ Cancellation email sent to customer: ${customer.email}`);
        }
      } catch (emailError) {
        console.error('❌ Error sending cancellation email:', emailError);
      }

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    return order;
  }

  async updatePaymentWithHistory(
    orderId: string,
    data: any
  ): Promise<any> {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email');

    if (!order) {
      throw new Error('Order not found');
    }

    // Update payment status
    order.paymentStatus = data.paymentStatus;

    // Add payment history entry
    order.paymentHistory.push({
      paymentGateway: data.paymentHistory.paymentGateway,
      gatewayTransactionId: data.paymentHistory.gatewayTransactionId,
      currency: data.paymentHistory.currency,
      paymentStatus: data.paymentStatus,
      paymentDate: new Date(),
      gatewayResponse: data.paymentHistory.gatewayResponse
    });

    // If payment is successful, update order status to Confirmed
    if (data.paymentStatus === PaymentStatus.COMPLETED && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.CONFIRMED;
      order.statusHistory.push({
        status: OrderStatus.CONFIRMED,
        timestamp: new Date(),
        note: 'Payment completed - Order confirmed'
      });

      // Send confirmation email
      try {
        const customer = order.userId as any;
        if (customer && customer.email) {
          await emailService.sendOrderStatusUpdateEmail(
            customer.email,
            customer.name || order.shippingAddress.fullName,
            order.toObject(),
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED
          );
          console.log(`✅ Payment confirmation email sent to customer: ${customer.email}`);
        }
      } catch (emailError) {
        console.error('❌ Error sending payment confirmation email:', emailError);
      }
    }

    await order.save();
    return order;
  }

  async deleteOrder(orderId: string): Promise<IOrder | null> {
    const order = await Order.findByIdAndDelete(orderId);
    return order;
  }

  async getOrderStats(filters?: IOrderFilters): Promise<IOrderStats> {
    const query: any = {};

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const totalOrders = await Order.countDocuments(query);
    const pending = await Order.countDocuments({ ...query, status: OrderStatus.PENDING });
    const confirmed = await Order.countDocuments({ ...query, status: OrderStatus.CONFIRMED });
    const preparingForShipment = await Order.countDocuments({
      ...query,
      status: OrderStatus.PREPARING_FOR_SHIPMENT
    });
    const outForDelivery = await Order.countDocuments({
      ...query,
      status: OrderStatus.OUT_FOR_DELIVERY
    });
    const delivered = await Order.countDocuments({ ...query, status: OrderStatus.DELIVERED });
    const cancelled = await Order.countDocuments({ ...query, status: OrderStatus.CANCELLED });

    const revenueResult = await Order.aggregate([
      { $match: { ...query, status: { $ne: OrderStatus.CANCELLED } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const averageOrderValue = revenueResult.length > 0 && revenueResult[0].count > 0
      ? totalRevenue / revenueResult[0].count
      : 0;

    return {
      totalOrders,
      pending,
      confirmed,
      preparingForShipment,
      outForDelivery,
      delivered,
      cancelled,
      totalRevenue: Math.round(totalRevenue * 1000) / 1000,
      averageOrderValue: Math.round(averageOrderValue * 1000) / 1000
    };
  }

  async getUserOrderStats(userId: string): Promise<IUserOrderStats> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totalOrders = await Order.countDocuments({ userId: userObjectId });
    const pendingOrders = await Order.countDocuments({
      userId: userObjectId,
      status: {
        $in: [
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING_FOR_SHIPMENT,
          OrderStatus.OUT_FOR_DELIVERY
        ]
      }
    });
    const completedOrders = await Order.countDocuments({
      userId: userObjectId,
      status: OrderStatus.DELIVERED
    });

    const spentResult = await Order.aggregate([
      { $match: { userId: userObjectId, status: { $ne: OrderStatus.CANCELLED } } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$grandTotal' }
        }
      }
    ]);

    const totalSpent = spentResult.length > 0 ? spentResult[0].totalSpent : 0;

    return {
      totalOrders,
      totalSpent: Math.round(totalSpent * 1000) / 1000,
      pendingOrders,
      completedOrders
    };
  }

  async getRecentOrders(limit: number = 10): Promise<IOrder[]> {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('products.productId')
      .populate('shippingMethodId', 'name code trackingUrl')
      .sort({ createdAt: -1 })
      .limit(limit);

    return orders;
  }

  // Add this method to order.service.ts

  async getVendorOrders(vendorId: string, filters?: { status?: OrderStatus; paymentStatus?: PaymentStatus }): Promise<IOrder[]> {
    try {
      // First, get all products that belong to this vendor
      const Product = mongoose.model('Product');
      const vendorProducts = await Product.find({
        userId: new mongoose.Types.ObjectId(vendorId)
      }).select('_id');

      const vendorProductIds = vendorProducts.map(p => p._id);

      if (vendorProductIds.length === 0) {
        // Vendor has no products, return empty array
        return [];
      }

      // Build query to find orders containing vendor's products
      const query: any = {
        'products.productId': { $in: vendorProductIds }
      };

      // Apply additional filters if provided
      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }

      // Fetch orders
      const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .populate({
          path: 'products.productId',
          select: 'productName mainImageUrl pricePerUnit specialPrice userId'
        })
        .populate('shippingMethodId', 'name code trackingUrl')
        .sort({ createdAt: -1 });

      // Filter products in each order to only show vendor's products
      const filteredOrders = orders.map(order => {
        const orderObj = order.toObject() as any;
        orderObj.products = orderObj.products.filter((p: any) =>
          vendorProductIds.some(vpId => vpId.toString() === p.productId._id.toString())
        );

        // Recalculate totals based on vendor's products only
        const vendorTotal = orderObj.products.reduce((sum: number, p: any) => sum + p.total, 0);
        orderObj.vendorTotal = vendorTotal;

        return orderObj;
      });

      return filteredOrders as any;
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      throw error;
    }
  }

  async getVendorOrderStats(vendorId: string): Promise<any> {
    try {
      // Get all products that belong to this vendor
      const Product = mongoose.model('Product');
      const vendorProducts = await Product.find({
        userId: new mongoose.Types.ObjectId(vendorId)
      }).select('_id');

      const vendorProductIds = vendorProducts.map(p => p._id);

      if (vendorProductIds.length === 0) {
        return {
          totalOrders: 0,
          pending: 0,
          confirmed: 0,
          preparingForShipment: 0,
          outForDelivery: 0,
          delivered: 0,
          cancelled: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        };
      }

      // Build base query
      const baseQuery = {
        'products.productId': { $in: vendorProductIds }
      };

      // Get order counts by status
      const totalOrders = await Order.countDocuments(baseQuery);
      const pending = await Order.countDocuments({ ...baseQuery, status: OrderStatus.PENDING });
      const confirmed = await Order.countDocuments({ ...baseQuery, status: OrderStatus.CONFIRMED });
      const preparingForShipment = await Order.countDocuments({
        ...baseQuery,
        status: OrderStatus.PREPARING_FOR_SHIPMENT
      });
      const outForDelivery = await Order.countDocuments({
        ...baseQuery,
        status: OrderStatus.OUT_FOR_DELIVERY
      });
      const delivered = await Order.countDocuments({ ...baseQuery, status: OrderStatus.DELIVERED });
      const cancelled = await Order.countDocuments({ ...baseQuery, status: OrderStatus.CANCELLED });

      // Calculate revenue from vendor's products only
      const orders = await Order.find({
        ...baseQuery,
        status: { $ne: OrderStatus.CANCELLED }
      });

      let totalRevenue = 0;
      orders.forEach(order => {
        order.products.forEach(product => {
          if (vendorProductIds.some(vpId => vpId.toString() === product.productId.toString())) {
            totalRevenue += product.total;
          }
        });
      });

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalOrders,
        pending,
        confirmed,
        preparingForShipment,
        outForDelivery,
        delivered,
        cancelled,
        totalRevenue: Math.round(totalRevenue * 1000) / 1000,
        averageOrderValue: Math.round(averageOrderValue * 1000) / 1000
      };
    } catch (error) {
      console.error('Error fetching vendor order stats:', error);
      throw error;
    }
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: { [key: string]: OrderStatus[] } = {
      [OrderStatus.PENDING]: [
        OrderStatus.CONFIRMED,
        OrderStatus.CANCELLED
      ],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.PREPARING_FOR_SHIPMENT,
        OrderStatus.CANCELLED
      ],
      [OrderStatus.PREPARING_FOR_SHIPMENT]: [
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.CANCELLED
      ],
      [OrderStatus.OUT_FOR_DELIVERY]: [
        OrderStatus.DELIVERED
      ],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }
  }
}

export const orderService = new OrderService();