// src/routes/checkout.routes.ts

import { Router } from 'express';
import checkoutController from './afsPayment.controller'

const router = Router();

// Test connection
router.get('/test-connection', checkoutController.testConnection);

// Test merchant configuration
router.get('/test-config', checkoutController.testMerchantConfig);

// Check available operations
router.get('/operations', checkoutController.checkAvailableOperations);

// Initialize checkout session
router.post('/initialize', checkoutController.initializeCheckout);

// NEW: Handle payment callback from gateway (this is where gateway redirects after payment)
router.get('/callback', checkoutController.handlePaymentCallback);

// Handle payment result verification (for manual verification)
router.post('/result', checkoutController.handlePaymentResult);

// Get order details
router.get('/order/:orderId', checkoutController.getOrderDetails);

// Capture authorized payment
router.post('/capture', checkoutController.capturePayment);

// Refund payment
router.post('/refund', checkoutController.refundPayment);

// Void payment
router.post('/void', checkoutController.voidPayment);

export const AFSPayment = router;