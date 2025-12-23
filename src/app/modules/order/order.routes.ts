import { Router } from 'express';
import { OrderController } from './order.controller';
import { ValidationMiddleware } from '../../middlewares/validation.middleware';
import { verifyToken } from '../../middlewares/auth';
import { authorizeRoles } from '../../middlewares/roleAuth';

const router = Router();
const controller = new OrderController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrder:
 *       type: object
 *       required:
 *         - fullName
 *         - mobileNumber
 *         - country
 *         - addressSpecific
 *         - city
 *         - state
 *         - zipCode
 *         - products
 *         - shippingMethodId
 *         - totalPrice
 *         - shippingFee
 *         - tax
 *       properties:
 *         fullName:
 *           type: string
 *           example: John Doe
 *         mobileNumber:
 *           type: string
 *           example: +973-12345678
 *         country:
 *           type: string
 *           example: Bahrain
 *         addressSpecific:
 *           type: string
 *           example: Building 123, Road 456, Block 789
 *         city:
 *           type: string
 *           example: Manama
 *         state:
 *           type: string
 *           example: Capital
 *         zipCode:
 *           type: string
 *           example: 12345
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 672304d53d6b4eee48e94e0e
 *               quantity:
 *                 type: integer
 *                 example: 2
 *         shippingMethodId:
 *           type: string
 *           example: 67230a1c3d6b4eee48e94e20
 *         totalPrice:
 *           type: number
 *           example: 100.00
 *         shippingFee:
 *           type: number
 *           example: 5.00
 *         discount:
 *           type: number
 *           example: 0
 *         tax:
 *           type: number
 *           example: 5.00
 *         promoCode:
 *           type: string
 *           example: SAVE10
 *         paymentMethod:
 *           type: string
 *           enum: [WALLET, GATEWAY, CASH_ON_DELIVERY]
 *           example: WALLET
 *           description: Payment method to use (WALLET for wallet payment, GATEWAY for credit card)
 *         transactionId:
 *           type: string
 *           example: TXN-1234567890
 *         estimatedDeliveryDate:
 *           type: string
 *           format: date
 *           example: 2025-11-22
 *         orderNotes:
 *           type: string
 *           example: Please ring the doorbell
 *     OrderResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *         orderNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Pending, Confirmed, Preparing for Shipment, Out for Delivery, Delivered, Cancelled]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         grandTotal:
 *           type: number
 *         estimatedDeliveryDate:
 *           type: string
 *           format: date-time
 *     UpdateOrderStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [Pending, Confirmed, Preparing for Shipment, Out for Delivery, Delivered, Cancelled]
 *           example: Confirmed
 *         note:
 *           type: string
 *           example: Order confirmed and being processed
 *         trackingNumber:
 *           type: string
 *           example: TRACK123456789
 *     CompletePayment:
 *       type: object
 *       required:
 *         - orderId
 *         - transactionId
 *         - paymentGateway
 *         - amount
 *         - currency
 *       properties:
 *         orderId:
 *           type: string
 *           description: Database ID of the order
 *           example: 6723abc123def456
 *         transactionId:
 *           type: string
 *           description: Payment gateway transaction ID
 *           example: TXN-1234567890
 *         paymentGateway:
 *           type: string
 *           description: Name of the payment gateway used
 *           example: Stripe
 *         paymentMethod:
 *           type: string
 *           description: Payment method used
 *           example: Credit Card
 *         amount:
 *           type: number
 *           description: Payment amount
 *           example: 110.00
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: BHD
 *         cardType:
 *           type: string
 *           description: Type of card used (optional)
 *           example: Visa
 *         lastFourDigits:
 *           type: string
 *           description: Last 4 digits of card (optional)
 *           example: 4242
 *         gatewayResponse:
 *           type: object
 *           description: Raw response from payment gateway (optional)
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management including creation, payment processing, tracking, and status updates
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with payment method selection. Use paymentMethod WALLET for instant wallet payment or GATEWAY for credit card payment.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 data:
 *                   $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Validation error or insufficient wallet balance
 *       401:
 *         description: Not authenticated
 */
router.post('/', verifyToken, authorizeRoles('CUSTOMER', 'ADMIN', 'VENDOR'), controller.createOrder);

/**
 * @swagger
 * /orders/complete-payment:
 *   post:
 *     summary: Complete payment for an order
 *     description: Mark an order's payment as completed and record payment details including transaction ID and payment history. This endpoint should be called after successful payment processing.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompletePayment'
 *     responses:
 *       200:
 *         description: Payment completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: Confirmed
 *                     paymentStatus:
 *                       type: string
 *                       example: completed
 *                     grandTotal:
 *                       type: number
 *                     transactionId:
 *                       type: string
 *                     paymentDetails:
 *                       type: object
 *                       properties:
 *                         transactionId:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                         gateway:
 *                           type: string
 *       400:
 *         description: Invalid request or order already paid
 *       404:
 *         description: Order not found
 */
router.post('/complete-payment', controller.completeOrderPayment);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     description: Retrieve all orders belonging to the authenticated user with optional status filter
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Confirmed, Preparing for Shipment, Out for Delivery, Delivered, Cancelled]
 *         description: Filter orders by status
 *         example: Confirmed
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/my-orders', verifyToken, authorizeRoles('CUSTOMER', 'ADMIN', 'VENDOR'), controller.getMyOrders);

/**
 * @swagger
 * /orders/my-stats:
 *   get:
 *     summary: Get statistics of logged-in user's orders
 *     description: Retrieve comprehensive statistics including total orders, total spent, pending and completed orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                       example: 15
 *                     totalSpent:
 *                       type: number
 *                       example: 1250.50
 *                     pendingOrders:
 *                       type: integer
 *                       example: 3
 *                     completedOrders:
 *                       type: integer
 *                       example: 12
 *       401:
 *         description: Unauthorized
 */
router.get('/my-stats', verifyToken, authorizeRoles('CUSTOMER', 'ADMIN', 'VENDOR'), controller.getMyOrderStats);

/**
 * @swagger
 * /orders/track/{orderNumber}:
 *   get:
 *     summary: Track an order by its order number
 *     description: Public endpoint to track order status using order number. No authentication required.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number to track
 *         example: ORD-1234567890-ABCD
 *     responses:
 *       200:
 *         description: Order tracking information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       404:
 *         description: Order not found
 */
router.get('/track/:orderNumber', controller.getOrderByOrderNumber);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     description: Cancel an existing order. Only orders that are Pending, Confirmed, or Preparing for Shipment can be cancelled. If paid via wallet, amount is automatically refunded.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order database ID
 *         example: 6723abc123def456
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Changed my mind
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: Cancelled
 *       400:
 *         description: Cannot cancel order (already delivered or out for delivery)
 *       404:
 *         description: Order not found
 */
router.put('/:id/cancel', verifyToken, authorizeRoles('CUSTOMER', 'ADMIN', 'VENDOR'), ValidationMiddleware.validateObjectId, controller.cancelOrder);

/**
 * @swagger
 * /orders/admin:
 *   get:
 *     summary: Get all orders (Admin/Vendor)
 *     description: Retrieve all orders with optional filters for status, payment status, date range, and order number
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Confirmed, Preparing for Shipment, Out for Delivery, Delivered, Cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/admin', verifyToken, authorizeRoles('ADMIN', 'VENDOR'), controller.getAllOrders);

/**
 * @swagger
 * /orders/admin/stats:
 *   get:
 *     summary: Get admin/vendor order statistics
 *     description: Retrieve comprehensive order statistics including counts by status, total revenue, and average order value
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     confirmed:
 *                       type: integer
 *                     preparingForShipment:
 *                       type: integer
 *                     outForDelivery:
 *                       type: integer
 *                     delivered:
 *                       type: integer
 *                     cancelled:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/stats', verifyToken, authorizeRoles('ADMIN', 'VENDOR'), controller.getOrderStats);

/**
 * @swagger
 * /orders/admin/recent:
 *   get:
 *     summary: Get recent orders (Admin/Vendor)
 *     description: Retrieve the most recent orders with configurable limit
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent orders to retrieve
 *     responses:
 *       200:
 *         description: Recent orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/recent', verifyToken, authorizeRoles('ADMIN', 'VENDOR'), controller.getRecentOrders);

/**
 * @swagger
 * /orders/admin/{id}:
 *   get:
 *     summary: Get an order by ID (Admin/Vendor)
 *     description: Retrieve detailed information about a specific order including products, shipping, and payment details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order database ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get('/admin/:id', verifyToken, authorizeRoles('ADMIN', 'VENDOR'), ValidationMiddleware.validateObjectId, controller.getOrderById);

/**
 * @swagger
 * /orders/admin/{id}/status:
 *   put:
 *     summary: Update order status (Admin/Vendor)
 *     description: Update the status of an order with optional note and tracking number. Status transitions are validated.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatus'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Order not found
 */
router.put('/admin/:id/status', verifyToken, authorizeRoles('ADMIN', 'VENDOR'), ValidationMiddleware.validateObjectId, controller.updateOrderStatus);

/**
 * @swagger
 * /orders/admin/{id}/payment-status:
 *   put:
 *     summary: Update payment status (Admin/Vendor)
 *     description: Manually update the payment status of an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       400:
 *         description: Invalid payment status
 *       404:
 *         description: Order not found
 */
router.put('/admin/:id/payment-status', controller.updatePaymentStatus);

/**
 * @swagger
 * /orders/admin/{id}/payment-history:
 *   put:
 *     summary: Update payment status with payment history
 *     description: Update payment status and add detailed payment history record with gateway transaction details
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *               - paymentHistory
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *               paymentHistory:
 *                 type: object
 *                 required:
 *                   - paymentGateway
 *                   - gatewayTransactionId
 *                   - amount
 *                   - currency
 *                 properties:
 *                   paymentGateway:
 *                     type: string
 *                     example: Mastercard AFS
 *                   gatewayTransactionId:
 *                     type: string
 *                   sessionId:
 *                     type: string
 *                   resultIndicator:
 *                     type: string
 *                   successIndicator:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   paymentMethod:
 *                     type: string
 *                   cardType:
 *                     type: string
 *                   lastFourDigits:
 *                     type: string
 *                   gatewayResponse:
 *                     type: object
 *     responses:
 *       200:
 *         description: Payment updated successfully with history
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Order not found
 */
router.put('/admin/:id/payment-history', ValidationMiddleware.validateObjectId, controller.updatePaymentWithHistory);

// Add these routes to order.routes.ts (after the /my-stats route)

/**
 * @swagger
 * /orders/vendor/my-orders:
 *   get:
 *     summary: Get logged-in vendor's orders
 *     description: Retrieve all orders containing products that belong to the authenticated vendor. Each order is filtered to show only the vendor's products and includes calculated vendor total.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PREPARING_FOR_SHIPMENT, OUT_FOR_DELIVERY, DELIVERED, CANCELLED]
 *         description: Filter orders by status
 *         example: CONFIRMED
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *         description: Filter orders by payment status
 *         example: COMPLETED
 *     responses:
 *       200:
 *         description: List of vendor's orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 12
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       orderNumber:
 *                         type: string
 *                       status:
 *                         type: string
 *                       paymentStatus:
 *                         type: string
 *                       products:
 *                         type: array
 *                         description: Only products belonging to this vendor
 *                       vendorTotal:
 *                         type: number
 *                         description: Total amount for vendor's products only
 *                       shippingAddress:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - only vendors can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/vendor/my-orders', verifyToken, authorizeRoles('VENDOR', 'ADMIN'), controller.getMyVendorOrders);

/**
 * @swagger
 * /orders/vendor/my-stats:
 *   get:
 *     summary: Get statistics for logged-in vendor's orders
 *     description: Retrieve comprehensive statistics for orders containing the vendor's products, including total orders by status, total revenue from vendor's products, and average order value.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor order statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                       example: 45
 *                       description: Total number of orders containing vendor's products
 *                     pending:
 *                       type: integer
 *                       example: 5
 *                     confirmed:
 *                       type: integer
 *                       example: 8
 *                     preparingForShipment:
 *                       type: integer
 *                       example: 12
 *                     outForDelivery:
 *                       type: integer
 *                       example: 7
 *                     delivered:
 *                       type: integer
 *                       example: 10
 *                     cancelled:
 *                       type: integer
 *                       example: 3
 *                     totalRevenue:
 *                       type: number
 *                       example: 5420.500
 *                       description: Total revenue from vendor's products only
 *                     averageOrderValue:
 *                       type: number
 *                       example: 120.456
 *                       description: Average revenue per order from vendor's products
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - only vendors can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/vendor/my-stats', verifyToken, authorizeRoles('VENDOR', 'ADMIN'), controller.getMyVendorOrderStats);

/**
 * @swagger
 * /orders/admin/{id}:
 *   delete:
 *     summary: Delete an order (Admin only)
 *     description: Permanently delete an order from the system. This action cannot be undone.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/admin/:id', verifyToken, authorizeRoles('ADMIN'), ValidationMiddleware.validateObjectId, controller.deleteOrder);

export const OrderRoute = router;