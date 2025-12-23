import { Router } from 'express';
import { PaymentController } from './payments.controller';

const router = Router();
const paymentController = new PaymentController();

/**
 * @route   POST /api/payment/session
 * @desc    Create a new payment session
 * @access  Private
 */
router.post('/session', paymentController.createSession);

/**
 * @route   PUT /api/payment/session/:sessionId
 * @desc    Update session with order details
 * @access  Private
 */
router.put('/session/:sessionId', paymentController.updateSession);

/**
 * @route   GET /api/payment/session/:sessionId
 * @desc    Retrieve session details
 * @access  Private
 */
router.get('/session/:sessionId', paymentController.retrieveSession);

/**
 * @route   POST /api/payment/process
 * @desc    Process payment using session
 * @access  Private
 */
router.post('/process', paymentController.processPayment);

/**
 * @route   GET /api/payment/history/:userId
 * @desc    Get user payment history
 * @access  Private
 */
router.get('/history/:userId', paymentController.getPaymentHistory);

/**
 * @route   GET /api/payment/transaction/:transactionId
 * @desc    Get payment details by transaction ID
 * @access  Private
 */
router.get('/transaction/:transactionId', paymentController.getPaymentDetails);

// src/routes/payment.routes.ts - ADD THIS ROUTE

/**
 * @route   POST /api/payment/complete-3ds
 * @desc    Complete 3DS authenticated payment
 * @access  Private
 */
router.post('/complete-3ds', paymentController.complete3DSPayment);

export const PaymentsRoutes = router;