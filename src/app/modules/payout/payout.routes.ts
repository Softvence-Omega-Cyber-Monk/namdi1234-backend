import { Router } from 'express';
import { payoutController } from './payout.controller';
import { verifyToken } from '../../middlewares/auth';
import { authorizeRoles } from '../../middlewares/roleAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     VendorWallet:
 *       type: object
 *       properties:
 *         vendorId:
 *           type: string
 *         availableBalance:
 *           type: number
 *           example: 5000.50
 *         pendingBalance:
 *           type: number
 *           example: 1000.00
 *         totalEarned:
 *           type: number
 *           example: 10000.00
 *         totalWithdrawn:
 *           type: number
 *           example: 4000.00
 *         currency:
 *           type: string
 *           example: BHD
 *         lastPayoutDate:
 *           type: string
 *           format: date-time
 *     PayoutRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         vendorId:
 *           type: string
 *         requestedAmount:
 *           type: number
 *         currency:
 *           type: string
 *         payoutMethod:
 *           type: string
 *           enum: [BANK_TRANSFER, PAYPAL, STRIPE]
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, PROCESSING, COMPLETED, REJECTED, FAILED]
 *         requestedDate:
 *           type: string
 *           format: date-time
 *     CreatePayoutRequest:
 *       type: object
 *       required:
 *         - requestedAmount
 *         - payoutMethod
 *       properties:
 *         requestedAmount:
 *           type: number
 *           example: 1000.00
 *           minimum: 0.01
 *         payoutMethod:
 *           type: string
 *           enum: [BANK_TRANSFER, PAYPAL, STRIPE]
 *           example: BANK_TRANSFER
 *         bankDetails:
 *           type: object
 *           properties:
 *             accountHolderName:
 *               type: string
 *               example: John Doe
 *             accountNumber:
 *               type: string
 *               example: 1234567890
 *             bankName:
 *               type: string
 *               example: ABC Bank
 *             bankCode:
 *               type: string
 *               example: ABC123
 *             routingNumber:
 *               type: string
 *               example: 987654321
 *             swiftCode:
 *               type: string
 *               example: ABCDEFGH
 *             iban:
 *               type: string
 *               example: BH12345678901234567890
 *         paypalEmail:
 *           type: string
 *           example: vendor@example.com
 *         stripeAccountId:
 *           type: string
 *           example: acct_1234567890
 *         notes:
 *           type: string
 *           example: Regular monthly payout
 */

/**
 * @swagger
 * tags:
 *   name: Payouts
 *   description: Vendor payout management, earnings tracking, and commission statistics
 */

// ========== VENDOR ROUTES ==========

/**
 * @swagger
 * /payouts/vendor/wallet:
 *   get:
 *     summary: Get vendor's wallet details
 *     description: Retrieve complete wallet information including available balance, pending balance, and earnings history
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/VendorWallet'
 *       401:
 *         description: Unauthorized
 */
router.get('/vendor/wallet', verifyToken, authorizeRoles('VENDOR'), payoutController.getVendorWallet);

/**
 * @swagger
 * /payouts/vendor/stats:
 *   get:
 *     summary: Get vendor's sales statistics
 *     description: Retrieve comprehensive sales statistics including total sales, orders, earnings, and commissions
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2025-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2025-12-31
 *     responses:
 *       200:
 *         description: Sales statistics retrieved successfully
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
 *                     totalSales:
 *                       type: number
 *                     totalOrders:
 *                       type: integer
 *                     vendorEarnings:
 *                       type: number
 *                     platformCommission:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     pendingEarnings:
 *                       type: number
 *                     paidEarnings:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/vendor/stats', verifyToken, authorizeRoles('VENDOR'), payoutController.getVendorSalesStats);

/**
 * @swagger
 * /payouts/vendor/monthly-sales:
 *   get:
 *     summary: Get vendor's monthly sales breakdown
 *     description: Retrieve month-by-month sales data for the specified year
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         example: 2025
 *         description: Year for monthly breakdown (defaults to current year)
 *     responses:
 *       200:
 *         description: Monthly sales data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       year:
 *                         type: integer
 *                       totalSales:
 *                         type: number
 *                       totalOrders:
 *                         type: integer
 *                       vendorEarnings:
 *                         type: number
 *                       platformCommission:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/vendor/monthly-sales', verifyToken, authorizeRoles('VENDOR'), payoutController.getVendorMonthlySales);

/**
 * @swagger
 * /payouts/vendor/earnings:
 *   get:
 *     summary: Get vendor's earnings history
 *     description: Retrieve detailed list of all earnings from delivered orders
 *     tags: [Payouts]
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
 *         description: Earnings history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/vendor/earnings', verifyToken, authorizeRoles('VENDOR'), payoutController.getVendorEarnings);

/**
 * @swagger
 * /payouts/vendor/requests:
 *   post:
 *     summary: Create a payout request
 *     description: Submit a new payout request with bank details or payment method information
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayoutRequest'
 *     responses:
 *       201:
 *         description: Payout request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PayoutRequest'
 *       400:
 *         description: Invalid request or insufficient balance
 *       401:
 *         description: Unauthorized
 */
router.post('/vendor/requests', verifyToken, authorizeRoles('VENDOR'), payoutController.createPayoutRequest);

/**
 * @swagger
 * /payouts/vendor/requests:
 *   get:
 *     summary: Get vendor's payout requests
 *     description: Retrieve all payout requests submitted by the vendor
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payout requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PayoutRequest'
 *       401:
 *         description: Unauthorized
 */
router.get('/vendor/requests', verifyToken, authorizeRoles('VENDOR'), payoutController.getVendorPayoutRequests);

// ========== ADMIN ROUTES ==========

/**
 * @swagger
 * /payouts/admin/requests:
 *   get:
 *     summary: Get all payout requests (Admin)
 *     description: Retrieve all payout requests from all vendors with optional filters
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, PROCESSING, COMPLETED, REJECTED, FAILED]
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
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Payout requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/requests', verifyToken, authorizeRoles('ADMIN'), payoutController.getAllPayoutRequests);

/**
 * @swagger
 * /payouts/admin/requests/{id}:
 *   get:
 *     summary: Get payout request by ID
 *     description: Retrieve detailed information about a specific payout request
 *     tags: [Payouts]
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
 *         description: Payout request retrieved successfully
 *       404:
 *         description: Payout request not found
 */
router.get('/admin/requests/:id', verifyToken, authorizeRoles('ADMIN'), payoutController.getPayoutRequestById);

/**
 * @swagger
 * /payouts/admin/requests/{id}/process:
 *   put:
 *     summary: Process payout request (Admin)
 *     description: Approve, reject, or mark payout request as completed
 *     tags: [Payouts]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, PROCESSING, COMPLETED, REJECTED, FAILED]
 *                 example: COMPLETED
 *               rejectionReason:
 *                 type: string
 *                 example: Invalid bank details
 *               transactionReference:
 *                 type: string
 *                 example: TXN-123456789
 *               notes:
 *                 type: string
 *                 example: Payout completed via bank transfer
 *     responses:
 *       200:
 *         description: Payout request processed successfully
 *       400:
 *         description: Invalid request or payout already processed
 *       404:
 *         description: Payout request not found
 */
router.put('/admin/requests/:id/process', verifyToken, authorizeRoles('ADMIN'), payoutController.processPayoutRequest);

/**
 * @swagger
 * /payouts/admin/commission-stats:
 *   get:
 *     summary: Get platform commission statistics (Admin)
 *     description: Retrieve comprehensive statistics about platform commissions (10% from each order)
 *     tags: [Payouts]
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
 *         description: Commission statistics retrieved successfully
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
 *                     totalCommission:
 *                       type: number
 *                       example: 5000.00
 *                     totalVendorEarnings:
 *                       type: number
 *                       example: 45000.00
 *                     totalOrders:
 *                       type: integer
 *                       example: 150
 *                     averageCommissionPerOrder:
 *                       type: number
 *                       example: 33.33
 *                     monthlyBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/commission-stats', verifyToken, authorizeRoles('ADMIN'), payoutController.getAdminCommissionStats);

/**
 * @swagger
 * /payouts/admin/vendor-wallets:
 *   get:
 *     summary: Get all vendor wallets (Admin)
 *     description: Retrieve a list of all vendor wallets with pagination
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Vendor wallets retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/vendor-wallets', verifyToken, authorizeRoles('ADMIN'), payoutController.getAllVendorWallets);

/**
 * @swagger
 * /payouts/admin/vendor-wallets/{vendorId}:
 *   get:
 *     summary: Get specific vendor wallet (Admin)
 *     description: Retrieve detailed wallet information for a specific vendor
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor wallet retrieved successfully
 *       404:
 *         description: Vendor wallet not found
 */
router.get('/admin/vendor-wallets/:vendorId', verifyToken, authorizeRoles('ADMIN'), payoutController.getVendorWalletById);

export const PayoutRoutes = router;