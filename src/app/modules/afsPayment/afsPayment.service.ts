// src/services/checkout.service.ts

import axios, { AxiosError } from 'axios';
import { checkoutConfig, getAuthHeader, getApiEndpoint } from './afsPayment.config';
import {
  InitiateCheckoutRequest,
  InitiateCheckoutResponse,
  RetrieveOrderResponse,
  CaptureRequest,
  RefundRequest,
  VoidRequest,
  OrderDetails,
  InteractionConfig,
} from './afsPayment.interface';

export class CheckoutService {
  // Test basic connectivity and authentication
  async testConnection(): Promise<any> {
    try {
      // Try a simple API call to test credentials
      const testOrderId = `TEST-${Date.now()}`;
      const endpoint = getApiEndpoint(`/order/${testOrderId}`);
      
      console.log('Testing connection to:', endpoint);
      console.log('Using merchant ID:', checkoutConfig.merchant.id);
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': getAuthHeader(),
        },
        validateStatus: (status) => status < 500, // Don't throw on 4xx
      });

      return {
        status: response.status,
        connected: response.status !== 401 && response.status !== 403,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: error.response?.status,
          connected: false,
          error: error.message,
          data: error.response?.data,
        };
      }
      throw error;
    }
  }

  // Try to initiate checkout with fallback operations
  async initiateCheckoutWithFallback(
    orderDetails: OrderDetails,
    preferredOperation: 'AUTHORIZE' | 'PURCHASE' | 'VERIFY' = 'PURCHASE',
    customInteraction?: Partial<InteractionConfig>
  ): Promise<InitiateCheckoutResponse> {
    const operationFallbacks = {
      AUTHORIZE: ['AUTHORIZE', 'PURCHASE'],
      PURCHASE: ['PURCHASE', 'VERIFY'],
      VERIFY: ['VERIFY', 'PURCHASE'],
    };

    const operationsToTry = operationFallbacks[preferredOperation];

    for (const operation of operationsToTry) {
      try {
        return await this.initiateCheckout(orderDetails, operation as any, customInteraction);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          const errorData = error.response.data;
          if (errorData?.error?.field === 'interaction.operation') {
            console.log(`Operation ${operation} not available, trying next...`);
            continue;
          }
        }
        throw error;
      }
    }

    throw new Error('No supported payment operations available for your merchant account');
  }

  // Initiate a checkout session
  async initiateCheckout(
    orderDetails: OrderDetails,
    operation: 'AUTHORIZE' | 'PURCHASE' | 'VERIFY' = 'PURCHASE',
    customInteraction?: Partial<InteractionConfig>
  ): Promise<InitiateCheckoutResponse> {
    try {
      const endpoint = getApiEndpoint('/session');
      
      const requestBody: InitiateCheckoutRequest = {
        apiOperation: 'INITIATE_CHECKOUT',
        checkoutMode: 'WEBSITE',
        interaction: {
          operation,
          merchant: {
            name: checkoutConfig.merchant.name,
            url: checkoutConfig.merchant.url,
          },
          returnUrl: checkoutConfig.checkout.returnUrl,
          redirectMerchantUrl: checkoutConfig.checkout.redirectMerchantUrl,
          retryAttemptCount: checkoutConfig.checkout.retryAttemptCount,
          ...customInteraction,
        },
        order: orderDetails,
      };

      console.log('Initiating checkout with:', {
        endpoint,
        merchantId: checkoutConfig.merchant.id,
        operation,
        orderId: orderDetails.id,
      });

      const response = await axios.post<InitiateCheckoutResponse>(
        endpoint,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
        }
      );

      console.log('Checkout initiated successfully:', {
        sessionId: response.data.session.id,
        orderId: orderDetails.id,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const errorData = error.response.data;
        console.error('Full API Error Response:', JSON.stringify(errorData, null, 2));
        
        if (errorData?.error?.field === 'interaction.operation') {
          const explanation = errorData.error.explanation || '';
          throw new Error(
            `Operation '${operation}' is not enabled for your merchant account. ` +
            `API Error: ${explanation}. ` +
            `Please contact your payment service provider to enable payment operations.`
          );
        }
      }
      this.handleError(error, 'Failed to initiate checkout');
      throw error;
    }
  }

  // Retrieve order details
  async retrieveOrder(orderId: string): Promise<RetrieveOrderResponse> {
    try {
      const response = await axios.get<RetrieveOrderResponse>(
        getApiEndpoint(`/order/${orderId}`),
        {
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to retrieve order');
      throw error;
    }
  }

  // Capture an authorized transaction
  async captureTransaction(request: CaptureRequest): Promise<any> {
    try {
      const requestBody: any = {
        apiOperation: 'CAPTURE',
      };

      if (request.amount && request.currency) {
        requestBody.transaction = {
          amount: request.amount,
          currency: request.currency,
        };
      }

      const response = await axios.put(
        getApiEndpoint(`/order/${request.orderId}/transaction/${request.transactionId}`),
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to capture transaction');
      throw error;
    }
  }

  // Refund a transaction
  async refundTransaction(request: RefundRequest): Promise<any> {
    try {
      const requestBody: any = {
        apiOperation: 'REFUND',
      };

      if (request.amount && request.currency) {
        requestBody.transaction = {
          amount: request.amount,
          currency: request.currency,
        };
      }

      const response = await axios.put(
        getApiEndpoint(`/order/${request.orderId}/transaction/${request.transactionId}`),
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to refund transaction');
      throw error;
    }
  }

  // Void a transaction
  async voidTransaction(request: VoidRequest): Promise<any> {
    try {
      const requestBody = {
        apiOperation: 'VOID',
        transaction: {
          targetTransactionId: request.transactionId,
        },
      };

      const response = await axios.put(
        getApiEndpoint(`/order/${request.orderId}/transaction/${request.transactionId}`),
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to void transaction');
      throw error;
    }
  }

  // Verify payment result
  verifyPaymentResult(resultIndicator: string, successIndicator: string): boolean {
    return resultIndicator === successIndicator;
  }

  // Error handling
  private handleError(error: unknown, message: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(`${message}:`, {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
    } else {
      console.error(`${message}:`, error);
    }
  }
}

export default new CheckoutService();