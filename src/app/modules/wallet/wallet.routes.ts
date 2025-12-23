import { Router } from 'express';
import { walletController } from './wallet.controller';
import { verifyToken } from '../../middlewares/auth';
import { authorizeRoles } from '../../middlewares/roleAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WalletBalance:
 *       type: object
 *       properties:
 *         balance:
 *           type: number
 *           example: 150.50
 *         currency:
 *           type: string
 *           example: BHD
 *         userId:
 *           type: string
 *           example: 6723abc123def456
 *     WalletTransaction:
 *       type: object
 *       properties:
 *         transactionId:
 *           type: string
 *           example: TXN-CREDIT-uuid-1234
 *         type:
 *           type: string
 *           enum: [Credit, Debit, Refund, Withdrawal]
 *           example: Credit
 *         amount:
 *           type: number
 *           example: 100.50
 *         balanceBefore:
 *           type: number
 *           example: 150.00
 *         balanceAfter:
 *           type: number
 *           example: 250.50
 *         description:
 *           type: string
 *           example: Wallet credited via Card
 *         status:
 *           type: string
 *           enum: [Pending, Completed, Failed, Cancelled]
 *           example: Completed
 *         paymentMethod:
 *           type: string
 *           enum: [Card, Bank Transfer, Mastercard Gateway]
 *           example: Card
 *         gatewayTransactionId:
 *           type: string
 *           example: TXN-123456789
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-11-15T10:30:00Z
 *     WalletStats:
 *       type: object
 *       properties:
 *         currentBalance:
 *           type: number
 *           example: 250.50
 *         totalCredits:
 *           type: number
 *           example: 500.00
 *         totalDebits:
 *           type: number
 *           example: 249.50
 *         totalRefunds:
 *           type: number
 *           example: 0
 *         totalTransactions:
 *           type: integer
 *           example: 15
 *         currency:
 *           type: string
 *           example: BHD
 *     CreditWalletRequest:
 *       type: object
 *       required:
 *         - userId
 *         - amount
 *         - paymentMethod
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user whose wallet to credit
 *           example: 6723abc123def456
 *         amount:
 *           type: number
 *           description: Amount to credit
 *           example: 100.50
 *           minimum: 0.01
 *         paymentMethod:
 *           type: string
 *           enum: [Card, Bank Transfer, Mastercard Gateway]
 *           description: Payment method used
 *           example: Card
 *         gatewayTransactionId:
 *           type: string
 *           description: Transaction ID from payment gateway
 *           example: TXN-123456789
 *         description:
 *           type: string
 *           description: Optional description for the transaction
 *           example: Manual wallet credit
 */

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet management, balance checking, credits, debits, and transaction history
 */

/**
 * @swagger
 * /wallet:
 *   get:
 *     summary: Get user's wallet details
 *     description: Retrieve complete wallet information including balance, currency, and transaction history for the authenticated user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet details retrieved successfully
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
 *                     userId:
 *                       type: string
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WalletTransaction'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to fetch wallet
 */
router.get('/', verifyToken, authorizeRoles('CUSTOMER', 'VENDOR', 'ADMIN'), walletController.getWallet);

/**
 * @swagger
 * /wallet/check-balance:
 *   get:
 *     summary: Check if wallet has sufficient balance
 *     description: Check if the user's wallet has sufficient balance for a transaction
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: Amount to check
 *         example: 100.50
 *     responses:
 *       200:
 *         description: Balance check successful
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
 *                     hasSufficientBalance:
 *                       type: boolean
 *                       example: true
 *                     requestedAmount:
 *                       type: number
 *                       example: 100.50
 *       400:
 *         description: Invalid amount
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to check balance
 */
router.get('/check-balance', verifyToken, authorizeRoles('CUSTOMER', 'VENDOR', 'ADMIN'), walletController.checkBalanceSufficiency);

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     description: Retrieve only the balance information of the user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WalletBalance'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to fetch wallet balance
 */
router.get('/balance', verifyToken, authorizeRoles('CUSTOMER', 'VENDOR', 'ADMIN'), walletController.getWalletBalance);

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get wallet transactions with filters
 *     description: Retrieve wallet transaction history with optional filters for type, status, date range, and amount range
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Credit, Debit, Refund, Withdrawal]
 *         description: Filter by transaction type
 *         example: Credit
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Completed, Failed, Cancelled]
 *         description: Filter by transaction status
 *         example: Completed
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions from this date
 *         example: 2025-11-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions until this date
 *         example: 2025-11-30
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Filter transactions with amount greater than or equal to this value
 *         example: 10.00
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Filter transactions with amount less than or equal to this value
 *         example: 1000.00
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
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
 *                     $ref: '#/components/schemas/WalletTransaction'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to fetch transactions
 */
router.get('/transactions', verifyToken, authorizeRoles('CUSTOMER', 'VENDOR', 'ADMIN'), walletController.getTransactions);

/**
 * @swagger
 * /wallet/stats:
 *   get:
 *     summary: Get wallet statistics
 *     description: Retrieve comprehensive wallet statistics including total credits, debits, refunds, and current balance
 *     tags: [Wallet]
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
 *                   $ref: '#/components/schemas/WalletStats'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to fetch wallet statistics
 */
router.get('/stats', verifyToken, authorizeRoles('CUSTOMER', 'VENDOR', 'ADMIN'), walletController.getWalletStats);

/**
 * @swagger
 * /wallet/admin/credit:
 *   post:
 *     summary: Credit wallet manually (Admin only)
 *     description: Manually add funds to a user's wallet. Typically used after payment verification or for promotional credits.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreditWalletRequest'
 *     responses:
 *       200:
 *         description: Wallet credited successfully
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
 *                   example: Wallet credited successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 250.50
 *                     currency:
 *                       type: string
 *                       example: BHD
 *                     transaction:
 *                       $ref: '#/components/schemas/WalletTransaction'
 *       400:
 *         description: Invalid request or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post('/admin/credit', verifyToken, authorizeRoles('ADMIN'), walletController.creditWallet);

/**
 * @swagger
 * /wallet/admin/refund:
 *   post:
 *     summary: Process refund to wallet (Admin/Vendor only)
 *     description: Refund an amount to a user's wallet, typically used for order cancellations or returns
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *               - orderId
 *               - description
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to refund
 *                 example: 6723abc123def456
 *               amount:
 *                 type: number
 *                 description: Amount to refund
 *                 example: 75.50
 *                 minimum: 0.01
 *               orderId:
 *                 type: string
 *                 description: Order ID related to the refund
 *                 example: 6723def456ghi789
 *               description:
 *                 type: string
 *                 description: Reason for refund
 *                 example: Refund for cancelled order
 *     responses:
 *       200:
 *         description: Refund processed successfully
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
 *                   example: Refund processed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     transaction:
 *                       $ref: '#/components/schemas/WalletTransaction'
 *       400:
 *         description: Invalid request or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post('/admin/refund', verifyToken, authorizeRoles('ADMIN', 'VENDOR'), walletController.refundToWallet);

/**
 * @swagger
 * /wallet/admin/all:
 *   get:
 *     summary: Get all wallets (Admin only)
 *     description: Retrieve a paginated list of all user wallets in the system
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of wallets to retrieve
 *         example: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of wallets to skip
 *         example: 0
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
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
 *                   example: 50
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch wallets
 */
router.get('/admin/all', verifyToken, authorizeRoles('ADMIN'), walletController.getAllWallets);

export const WalletRoutes = router;