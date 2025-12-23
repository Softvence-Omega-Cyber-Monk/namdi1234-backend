// // src/services/payment.service.ts

// import axios, { AxiosInstance } from 'axios';
// import { v4 as uuidv4 } from 'uuid';
// import { Payment, IPayment } from './paymets.model';
// import {
//   CreateSessionResponse,
//   PaymentRequest,
//   PaymentResponse,
//   GatewayPaymentRequest,
//   GatewayPaymentResponse,
//   PaymentHistory,
// } from './payments.interface'

// export class PaymentService {
//   private gatewayClient: AxiosInstance;
//   private merchantId: string;
//   private apiVersion: string;

//   constructor() {
//     this.merchantId = process.env.MASTERCARD_MERCHANT_ID || '';
//     this.apiVersion = process.env.MASTERCARD_API_VERSION || '100';
//     const baseURL = process.env.MASTERCARD_GATEWAY_URL || 'https://afs.gateway.mastercard.com';
//     const apiPassword = process.env.MASTERCARD_API_PASSWORD || '';

//     this.gatewayClient = axios.create({
//       baseURL: `${baseURL}/api/rest/version/${this.apiVersion}/merchant/${this.merchantId}`,
//       auth: {
//         username: `merchant.${this.merchantId}`,
//         password: apiPassword,
//       },
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   }

//   /**
//    * Create a new payment session
//    */
//   async createSession(authenticationLimit: number = 25): Promise<CreateSessionResponse> {
//     try {
//       const response = await this.gatewayClient.post('/session', {
//         session: {
//           authenticationLimit,
//         },
//       });

//       return response.data;
//     } catch (error: any) {
//       console.error('Error creating session:', error.response?.data || error.message);
//       throw new Error('Failed to create payment session');
//     }
//   }

//   /**
//    * Update session with order details
//    */
//   async updateSession(sessionId: string, amount: number, currency: string): Promise<void> {
//     try {
//       await this.gatewayClient.put(`/session/${sessionId}`, {
//         order: {
//           amount,
//           currency,
//         },
//       });
//     } catch (error: any) {
//       console.error('Error updating session:', error.response?.data || error.message);
//       throw new Error('Failed to update payment session');
//     }
//   }

//   /**
//    * Retrieve session details
//    */
//   async retrieveSession(sessionId: string): Promise<any> {
//     try {
//       const response = await this.gatewayClient.get(`/session/${sessionId}`);
//       return response.data;
//     } catch (error: any) {
//       console.error('Error retrieving session:', error.response?.data || error.message);
//       throw new Error('Failed to retrieve session details');
//     }
//   }

//   /**
//    * Process payment using session with 3DS support
//    */
//   async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
//     const orderId = paymentData.orderId || `ORD-${uuidv4()}`;
//     const transactionId = `TXN-${uuidv4()}`;

//     try {
//       console.log('🔍 Retrieving session details...');
      
//       const sessionDetails = await this.retrieveSession(paymentData.sessionId);

//       console.log('📋 Session details:', JSON.stringify(sessionDetails, null, 2));

//       if (sessionDetails.session.updateStatus !== 'SUCCESS') {
//         return {
//           success: false,
//           error: 'Session not properly updated with payment details',
//         };
//       }

//       // Step 1: Initiate authentication (3DS check)
//       const authRequest = {
//         apiOperation: 'INITIATE_AUTHENTICATION',
//         order: {
//           amount: sessionDetails.order.amount,
//           currency: sessionDetails.order.currency,
//         },
//         sourceOfFunds: {
//           type: 'CARD',
//         },
//         session: {
//           id: paymentData.sessionId,
//         },
//         authentication: {
//           acceptVersions: '3DS1,3DS2',
//           channel: 'PAYER_BROWSER',
//           purpose: 'PAYMENT_TRANSACTION',
//         },
//         correlationId: uuidv4(),
//       };

//       console.log('🔐 Initiating 3DS authentication...');
//       console.log('Auth URL:', `/order/${orderId}/transaction/${transactionId}`);
//       console.log('Auth Payload:', JSON.stringify(authRequest, null, 2));

//       const authResponse = await this.gatewayClient.put(
//         `/order/${orderId}/transaction/${transactionId}`,
//         authRequest
//       );

//       console.log('🔐 Auth response:', JSON.stringify(authResponse.data, null, 2));

//       // Step 2: Authenticate payer (if required)
//       const gatewayRecommendation = authResponse.data?.response?.gatewayRecommendation;
      
//       if (gatewayRecommendation === 'PROCEED') {
//         // 3DS authentication not required or frictionless - proceed with payment
//         console.log('✅ 3DS not required or frictionless - proceeding with payment');
//         return await this.executePayment(orderId, sessionDetails, paymentData);
//       } else if (authResponse.data?.authentication?.redirectHtml) {
//         // 3DS challenge required - return redirect HTML
//         console.log('🔄 3DS challenge required');
//         return {
//           success: false,
//           require3DS: true,
//           redirectHtml: authResponse.data.authentication.redirectHtml,
//           orderId: orderId,
//           transactionId: transactionId,
//           message: '3D Secure authentication required',
//         };
//       } else {
//         // Proceed with payment anyway
//         console.log('⚠️ No specific 3DS recommendation, proceeding with payment');
//         return await this.executePayment(orderId, sessionDetails, paymentData);
//       }

//     } catch (error: any) {
//       console.error('💥 Payment processing error:', error.response?.data || error.message);
//       console.error('Full error:', JSON.stringify(error.response?.data, null, 2));

//       await this.savePaymentHistory({
//         userId: paymentData.userId,
//         transactionId: `FAILED-${uuidv4()}`,
//         orderId: orderId,
//         sessionId: paymentData.sessionId,
//         amount: paymentData.amount,
//         currency: paymentData.currency,
//         status: 'FAILURE',
//         description: paymentData.description,
//       });

//       return {
//         success: false,
//         error: error.response?.data?.error?.explanation || 'Payment processing failed',
//         message: 'Payment could not be processed. Please try again.',
//       };
//     }
//   }

//   /**
//    * Execute payment after authentication
//    */
//   private async executePayment(orderId: string, sessionDetails: any, paymentData: PaymentRequest): Promise<PaymentResponse> {
//     const transactionId = `TXN-${uuidv4()}`;
    
//     try {
//       const paymentRequest = {
//         apiOperation: 'PAY',
//         order: {
//           amount: sessionDetails.order.amount,
//           currency: sessionDetails.order.currency,
//         },
//         sourceOfFunds: {
//           type: 'CARD',
//         },
//         session: {
//           id: paymentData.sessionId,
//         },
//         transaction: {
//           reference: paymentData.description || `Order ${orderId}`,
//         },
//       };

//       console.log('💳 Executing payment...');
//       console.log('Payment URL:', `/order/${orderId}/transaction/${transactionId}`);
//       console.log('Payment Payload:', JSON.stringify(paymentRequest, null, 2));

//       const response = await this.gatewayClient.put(
//         `/order/${orderId}/transaction/${transactionId}`,
//         paymentRequest
//       );

//       const gatewayResponse: GatewayPaymentResponse = response.data;
//       console.log('✅ Gateway response:', JSON.stringify(gatewayResponse, null, 2));

//       await this.savePaymentHistory({
//         userId: paymentData.userId,
//         transactionId: gatewayResponse.transaction.id,
//         orderId: orderId,
//         sessionId: paymentData.sessionId,
//         amount: parseFloat(gatewayResponse.transaction.amount),
//         currency: gatewayResponse.transaction.currency,
//         status: gatewayResponse.result,
//         gatewayCode: gatewayResponse.response?.gatewayCode,
//         description: paymentData.description,
//       });

//       return {
//         success: gatewayResponse.result === 'SUCCESS',
//         transactionId: gatewayResponse.transaction.id,
//         orderId: orderId,
//         amount: parseFloat(gatewayResponse.transaction.amount),
//         currency: gatewayResponse.transaction.currency,
//         status: gatewayResponse.result,
//         gatewayCode: gatewayResponse.response?.gatewayCode,
//         message: this.getPaymentMessage(gatewayResponse.result, gatewayResponse.response?.gatewayCode),
//       };
//     } catch (error: any) {
//       console.error('💥 Payment execution error:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   /**
//    * Complete 3DS authenticated payment
//    */
//   async complete3DSPayment(orderId: string, sessionId: string, userId: string, description?: string): Promise<PaymentResponse> {
//     const transactionId = `TXN-${uuidv4()}`;
    
//     try {
//       const sessionDetails = await this.retrieveSession(sessionId);

//       const paymentRequest = {
//         apiOperation: 'PAY',
//         order: {
//           amount: sessionDetails.order.amount,
//           currency: sessionDetails.order.currency,
//         },
//         sourceOfFunds: {
//           type: 'CARD',
//         },
//         session: {
//           id: sessionId,
//         },
//         transaction: {
//           reference: description || `Order ${orderId}`,
//         },
//       };

//       console.log('💳 Completing 3DS payment...');
//       console.log('URL:', `/order/${orderId}/transaction/${transactionId}`);

//       const response = await this.gatewayClient.put(
//         `/order/${orderId}/transaction/${transactionId}`,
//         paymentRequest
//       );

//       const gatewayResponse: GatewayPaymentResponse = response.data;

//       await this.savePaymentHistory({
//         userId: userId,
//         transactionId: gatewayResponse.transaction.id,
//         orderId: orderId,
//         sessionId: sessionId,
//         amount: parseFloat(gatewayResponse.transaction.amount),
//         currency: gatewayResponse.transaction.currency,
//         status: gatewayResponse.result,
//         gatewayCode: gatewayResponse.response?.gatewayCode,
//         description: description,
//       });

//       return {
//         success: gatewayResponse.result === 'SUCCESS',
//         transactionId: gatewayResponse.transaction.id,
//         orderId: orderId,
//         amount: parseFloat(gatewayResponse.transaction.amount),
//         currency: gatewayResponse.transaction.currency,
//         status: gatewayResponse.result,
//         gatewayCode: gatewayResponse.response?.gatewayCode,
//         message: this.getPaymentMessage(gatewayResponse.result, gatewayResponse.response?.gatewayCode),
//       };
//     } catch (error: any) {
//       console.error('💥 3DS payment completion error:', error.response?.data || error.message);
//       return {
//         success: false,
//         error: error.response?.data?.error?.explanation || '3DS payment completion failed',
//         message: 'Payment could not be completed. Please try again.',
//       };
//     }
//   }

//   /**
//    * Save payment history to database
//    */
//   private async savePaymentHistory(data: Omit<PaymentHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPayment> {
//     try {
//       const payment = new Payment(data);
//       return await payment.save();
//     } catch (error: any) {
//       console.error('Error saving payment history:', error.message);
//       throw error;
//     }
//   }

//   /**
//    * Get payment history for a user
//    */
//   async getUserPaymentHistory(userId: string, limit: number = 10, offset: number = 0): Promise<IPayment[]> {
//     try {
//       return await Payment.find({ userId })
//         .sort({ createdAt: -1 })
//         .limit(limit)
//         .skip(offset)
//         .exec();
//     } catch (error: any) {
//       console.error('Error fetching payment history:', error.message);
//       throw new Error('Failed to fetch payment history');
//     }
//   }

//   /**
//    * Get payment by transaction ID
//    */
//   async getPaymentByTransactionId(transactionId: string): Promise<IPayment | null> {
//     try {
//       return await Payment.findOne({ transactionId }).exec();
//     } catch (error: any) {
//       console.error('Error fetching payment:', error.message);
//       throw new Error('Failed to fetch payment details');
//     }
//   }

//   /**
//    * Get human-readable payment message
//    */
//   private getPaymentMessage(result: string, gatewayCode?: string): string {
//     if (result === 'SUCCESS') {
//       return 'Payment processed successfully';
//     }

//     if (!gatewayCode) {
//       return 'Payment failed. Please check your details and try again';
//     }

//     const errorMessages: Record<string, string> = {
//       DECLINED: 'Payment was declined by the card issuer',
//       INSUFFICIENT_FUNDS: 'Insufficient funds in the account',
//       INVALID_CARD: 'Invalid card details provided',
//       EXPIRED_CARD: 'Card has expired',
//       BLOCKED_CARD: 'Card has been blocked',
//       BLOCKED: 'Payment was blocked. Please try a different card',
//       TIMEOUT: 'Payment request timed out. Please try again',
//     };

//     return errorMessages[gatewayCode] || 'Payment failed. Please check your details and try again';
//   }
// }