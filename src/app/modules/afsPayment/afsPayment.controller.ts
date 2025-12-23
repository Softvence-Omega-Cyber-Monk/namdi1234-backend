// src/controllers/checkout.controller.ts

import { Request, Response, NextFunction } from 'express';
import checkoutService from './afsPayment.service';
import { OrderDetails } from './afsPayment.interface';
import { v4 as uuidv4 } from 'uuid';

export class CheckoutController {
  // Test connection and credentials
  async testConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const connectionTest = await checkoutService.testConnection();
      
      res.status(200).json({
        success: connectionTest.connected,
        message: connectionTest.connected 
          ? 'Successfully connected to Mastercard Gateway'
          : 'Failed to connect - check your credentials',
        details: connectionTest,
      });
    } catch (error) {
      next(error);
    }
  }

  // Test merchant configuration
  async testMerchantConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testOperations = ['PURCHASE', 'AUTHORIZE', 'VERIFY'];
      const results: any = {};

      for (const operation of testOperations) {
        try {
          const orderDetails: OrderDetails = {
            id: `TEST-${Date.now()}`,
            amount: '1.00',
            currency: 'USD',
            description: 'Configuration test',
          };

          await checkoutService.initiateCheckout(
            orderDetails,
            operation as any
          );

          results[operation] = { enabled: true, status: 'SUCCESS' };
        } catch (error: any) {
          results[operation] = { 
            enabled: false, 
            status: 'DISABLED',
            error: error.message 
          };
        }
      }

      res.status(200).json({
        success: true,
        merchantId: process.env.MERCHANT_ID,
        results,
        recommendation: 'Contact your payment service provider to enable the required operations',
      });
    } catch (error) {
      next(error);
    }
  }

  // Check available operations for merchant
  async checkAvailableOperations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Contact your payment service provider to enable operations',
        note: 'Your account has VERIFY and PURCHASE enabled',
        operations: {
          PURCHASE: 'Enabled - Immediate payment (same as PAY)',
          AUTHORIZE: 'Requires enablement - Authorization only',
          VERIFY: 'Enabled - Card verification',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Initialize checkout session
  async initializeCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, currency, description, operation } = req.body;

      // Validate required fields
      if (!amount || !currency) {
        res.status(400).json({
          success: false,
          message: 'Amount and currency are required',
        });
        return;
      }

      // Generate unique order ID
      const orderId = `ORDER-${Date.now()}-${uuidv4().substring(0, 8)}`;

      const orderDetails: OrderDetails = {
        id: orderId,
        amount: amount.toString(),
        currency: currency.toUpperCase(),
        description: description || 'Payment for goods and services',
      };

      const result = await checkoutService.initiateCheckout(
        orderDetails,
        operation || 'PURCHASE'
      );

      res.status(200).json({
        success: true,
        data: {
          sessionId: result.session.id,
          successIndicator: result.successIndicator,
          orderId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // NEW: Handle payment callback from gateway (GET request)
  async handlePaymentCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resultIndicator, sessionId } = req.query;

      if (!resultIndicator || !sessionId) {
        res.status(400).json({
          success: false,
          message: 'Missing payment callback parameters',
        });
      }

      // Extract orderId from session if needed, or get from query params
      const orderId = req.query.orderId as string;

      // Get the success indicator from your session storage or database
      // For now, we'll try to retrieve the order to get transaction details
      let paymentResponse: any = {
        success: false,
        resultIndicator,
        sessionId,
        orderId,
        message: 'Payment processing',
      };

      if (orderId) {
        try {
          const orderDetails = await checkoutService.retrieveOrder(orderId);
          
          // Check if payment was successful based on order status
          const isSuccess = orderDetails.order.status === 'CAPTURED' || 
                           orderDetails.order.status === 'AUTHORIZED';
          
          paymentResponse = {
            success: isSuccess,
            resultIndicator,
            sessionId,
            orderId,
            orderStatus: orderDetails.order.status,
            amount: orderDetails.order.amount,
            currency: orderDetails.order.currency,
            transaction: orderDetails.transaction,
            message: isSuccess ? 'Payment successful' : 'Payment failed or pending',
          };
        } catch (error) {
          console.error('Failed to retrieve order details:', error);
        }
      }

      // Return JSON response instead of redirecting
      res.status(200).json(paymentResponse);
    } catch (error) {
      next(error);
    }
  }

  // UPDATED: Handle payment result verification
  async handlePaymentResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resultIndicator, sessionId, orderId, successIndicator } = req.body;

      if (!resultIndicator || !successIndicator) {
        res.status(400).json({
          success: false,
          message: 'Missing payment result parameters',
        });
        return;
      }

      const isSuccess = checkoutService.verifyPaymentResult(
        resultIndicator,
        successIndicator
      );

      // Retrieve full order details
      let orderDetails = null;
      if (orderId && isSuccess) {
        try {
          orderDetails = await checkoutService.retrieveOrder(orderId);
        } catch (error) {
          console.error('Failed to retrieve order details:', error);
        }
      }

      // Return complete payment response
      res.status(200).json({
        success: isSuccess,
        message: isSuccess ? 'Payment verified successfully' : 'Payment verification failed',
        data: {
          orderId,
          sessionId,
          resultIndicator,
          isSuccess,
          orderDetails: orderDetails ? {
            status: orderDetails.order.status,
            amount: orderDetails.order.amount,
            currency: orderDetails.order.currency,
            totalAuthorizedAmount: orderDetails.order.totalAuthorizedAmount,
            totalCapturedAmount: orderDetails.order.totalCapturedAmount,
            totalRefundedAmount: orderDetails.order.totalRefundedAmount,
            transactions: orderDetails.transaction,
          } : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order details
  async getOrderDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
        return;
      }

      const orderDetails = await checkoutService.retrieveOrder(orderId);

      res.status(200).json({
        success: true,
        data: orderDetails,
      });
    } catch (error) {
      next(error);
    }
  }

  // Capture authorized payment
  async capturePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, transactionId, amount, currency } = req.body;

      if (!orderId || !transactionId) {
        res.status(400).json({
          success: false,
          message: 'Order ID and Transaction ID are required',
        });
        return;
      }

      const result = await checkoutService.captureTransaction({
        orderId,
        transactionId,
        amount,
        currency,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Refund payment
  async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, transactionId, amount, currency } = req.body;

      if (!orderId || !transactionId) {
        res.status(400).json({
          success: false,
          message: 'Order ID and Transaction ID are required',
        });
        return;
      }

      const result = await checkoutService.refundTransaction({
        orderId,
        transactionId,
        amount,
        currency,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Void payment
  async voidPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, transactionId } = req.body;

      if (!orderId || !transactionId) {
        res.status(400).json({
          success: false,
          message: 'Order ID and Transaction ID are required',
        });
        return;
      }

      const result = await checkoutService.voidTransaction({
        orderId,
        transactionId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CheckoutController();