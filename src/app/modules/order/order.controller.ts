import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { ICreateOrder, IUpdateOrderStatus, IUpdatePaymentWithHistory, OrderStatus, PaymentStatus } from './order.interface';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class OrderController {
  private service: OrderService;

  constructor() {
    this.service = new OrderService();
  }

  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const data: ICreateOrder = req.body;
      const order = await this.service.createOrder(userId, data);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          grandTotal: order.grandTotal,
          estimatedDeliveryDate: order.estimatedDeliveryDate
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order'
      });
    }
  };

  completeOrderPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId, transactionId, paymentGateway, currency, gatewayResponse } = req.body;

      if (!orderId || !transactionId || !paymentGateway || !currency) {
        res.status(400).json({
          success: false,
          error: 'Missing required payment parameters (orderId, transactionId, paymentGateway, amount, currency)'
        });
        return;
      }

      // Get the order from database
      const order = await this.service.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      // Check if already paid
      if (order.paymentStatus === PaymentStatus.COMPLETED) {
        res.status(400).json({
          success: false,
          error: 'Order is already paid'
        });
        return;
      }

      // Prepare payment history
      const paymentHistory = {
        paymentGateway: paymentGateway,
        gatewayTransactionId: transactionId,
        currency: currency,
        gatewayResponse: gatewayResponse
      };

      // Update order with payment details
      const updatedOrder = await this.service.updatePaymentWithHistory(
        orderId,
        {
          paymentStatus: PaymentStatus.COMPLETED,
          paymentHistory
        }
      );

      res.status(200).json({
        success: true,
        message: 'Payment completed successfully',
        data: {
          orderId: updatedOrder._id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          grandTotal: updatedOrder.grandTotal,
          transactionId: transactionId,
          paymentDetails: {
            transactionId: paymentHistory.gatewayTransactionId,
            currency: paymentHistory.currency,
            gateway: paymentHistory.paymentGateway
          }
        }
      });
    } catch (error) {
      console.error('Error completing payment:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete payment'
      });
    }
  };

  getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, paymentStatus, startDate, endDate, orderNumber } = req.query;

      const filters: any = {};

      if (status) filters.status = status as OrderStatus;
      if (paymentStatus) filters.paymentStatus = paymentStatus as PaymentStatus;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (orderNumber) filters.orderNumber = orderNumber as string;

      const orders = await this.service.getAllOrders(filters);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  };

  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.service.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order'
      });
    }
  };

  getOrderByOrderNumber = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderNumber } = req.params;
      const order = await this.service.getOrderByOrderNumber(orderNumber);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order'
      });
    }
  };

  getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { status } = req.query;
      const filters: any = {};

      if (status) filters.status = status as OrderStatus;

      const orders = await this.service.getUserOrders(userId, filters);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  };

  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: IUpdateOrderStatus = req.body;

      if (!data.status) {
        res.status(400).json({
          success: false,
          error: 'Status is required'
        });
        return;
      }

      const order = await this.service.updateOrderStatus(id, data);

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          statusHistory: order.statusHistory
        }
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status'
      });
    }
  };

  cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await this.service.cancelOrder(id, reason);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status
        }
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel order'
      });
    }
  };

  updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;

      if (!paymentStatus) {
        res.status(400).json({
          success: false,
          error: 'Payment status is required'
        });
        return;
      }

      const order = await this.service.updatePaymentStatus(id, paymentStatus);

      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus
        }
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment status'
      });
    }
  };

  updatePaymentWithHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: IUpdatePaymentWithHistory = req.body;

      if (!data.paymentStatus || !data.paymentHistory) {
        res.status(400).json({
          success: false,
          error: 'Payment status and payment history are required'
        });
        return;
      }

      const order = await this.service.updatePaymentWithHistory(id, data);

      res.status(200).json({
        success: true,
        message: 'Payment updated successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          status: order.status,
          paymentHistory: order.paymentHistory
        }
      });
    } catch (error) {
      console.error('Error updating payment with history:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment'
      });
    }
  };

  deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.service.deleteOrder(id);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete order'
      });
    }
  };

  getOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const filters: any = {};

      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const stats = await this.service.getOrderStats(filters);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order statistics'
      });
    }
  };

  getMyOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const stats = await this.service.getUserOrderStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching user order stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order statistics'
      });
    }
  };

  getRecentOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 10;

      const orders = await this.service.getRecentOrders(limitNum);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent orders'
      });
    }
  };
  // Add these methods to order.controller.ts

  getMyVendorOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      // Check if user is a vendor
      if (req.user?.role !== 'VENDOR' && req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Access denied. Only vendors can access this endpoint.'
        });
        return;
      }

      const { status, paymentStatus } = req.query;
      const filters: any = {};

      if (status) filters.status = status as OrderStatus;
      if (paymentStatus) filters.paymentStatus = paymentStatus as PaymentStatus;

      const orders = await this.service.getVendorOrders(vendorId, filters);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor orders'
      });
    }
  };

  getMyVendorOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      // Check if user is a vendor
      if (req.user?.role !== 'VENDOR' && req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Access denied. Only vendors can access this endpoint.'
        });
        return;
      }

      const stats = await this.service.getVendorOrderStats(vendorId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching vendor order stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor order statistics'
      });
    }
  };
}