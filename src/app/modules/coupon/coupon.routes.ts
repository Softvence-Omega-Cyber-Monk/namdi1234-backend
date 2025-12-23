import { Router } from 'express';
import { CouponController } from './coupon.controller';
import { ValidationMiddleware } from '../../middlewares/validation.middleware';

const router = Router();
const controller = new CouponController();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon and discount code management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         code:
 *           type: string
 *           example: SAVE20
 *         description:
 *           type: string
 *           example: Get 20% off on all products
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed]
 *         discountValue:
 *           type: number
 *           example: 20
 *         minPurchaseAmount:
 *           type: number
 *           example: 50
 *         maxDiscountAmount:
 *           type: number
 *           nullable: true
 *           example: 100
 *         usageLimit:
 *           type: number
 *           nullable: true
 *           example: 100
 *         usedCount:
 *           type: number
 *           example: 25
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, inactive, expired]
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateCoupon:
 *       type: object
 *       required:
 *         - code
 *         - description
 *         - discountType
 *         - discountValue
 *         - startDate
 *         - endDate
 *       properties:
 *         code:
 *           type: string
 *           example: SAVE20
 *         description:
 *           type: string
 *           example: Get 20% off on all products
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed]
 *           example: percentage
 *         discountValue:
 *           type: number
 *           example: 20
 *         minPurchaseAmount:
 *           type: number
 *           example: 50
 *         maxDiscountAmount:
 *           type: number
 *           example: 100
 *         usageLimit:
 *           type: number
 *           example: 100
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: 2024-01-01T00:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: 2024-12-31T23:59:59.999Z
 *     
 *     UpdateCoupon:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *         discountValue:
 *           type: number
 *         minPurchaseAmount:
 *           type: number
 *         maxDiscountAmount:
 *           type: number
 *         usageLimit:
 *           type: number
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, inactive, expired]
 *         isActive:
 *           type: boolean
 *     
 *     ValidateCoupon:
 *       type: object
 *       required:
 *         - code
 *         - purchaseAmount
 *       properties:
 *         code:
 *           type: string
 *           example: SAVE20
 *         purchaseAmount:
 *           type: number
 *           example: 100
 *     
 *     CouponStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *         active:
 *           type: number
 *         inactive:
 *           type: number
 *         expired:
 *           type: number
 *         totalUsage:
 *           type: number
 */

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate a coupon code
 *     description: Check if a coupon code is valid and calculate the discount
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateCoupon'
 *     responses:
 *       200:
 *         description: Coupon is valid
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
 *                   type: object
 *                   properties:
 *                     discount:
 *                       type: number
 *                     finalAmount:
 *                       type: number
 *       400:
 *         description: Invalid coupon or does not meet requirements
 */
router.post('/validate', controller.validateCoupon);

/**
 * @swagger
 * /coupons/active:
 *   get:
 *     summary: Get all active coupons
 *     description: Retrieve all currently active and valid coupons
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: Active coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 */
router.get('/active', controller.getActiveCoupons);

/**
 * @swagger
 * /coupons/code/{code}:
 *   get:
 *     summary: Get coupon by code
 *     description: Retrieve coupon details by coupon code
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: SAVE20
 *     responses:
 *       200:
 *         description: Coupon found
 *       404:
 *         description: Coupon not found
 */
router.get('/code/:code', controller.getCouponByCode);

/**
 * @swagger
 * /coupons/admin:
 *   post:
 *     summary: Create a new coupon (Admin)
 *     description: Create a new discount coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCoupon'
 *     responses:
 *       201:
 *         description: Coupon created successfully
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
 *                   $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: Validation error or coupon code already exists
 */
router.post('/admin', controller.createCoupon);

/**
 * @swagger
 * /coupons/admin:
 *   get:
 *     summary: Get all coupons (Admin)
 *     description: Retrieve all coupons with optional filters
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, expired]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 */
router.get('/admin', controller.getAllCoupons);

/**
 * @swagger
 * /coupons/admin/stats:
 *   get:
 *     summary: Get coupon statistics (Admin)
 *     description: Retrieve statistics about all coupons
 *     tags: [Coupons]
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
 *                 data:
 *                   $ref: '#/components/schemas/CouponStats'
 */
router.get('/admin/stats', controller.getStats);

/**
 * @swagger
 * /coupons/admin/{id}:
 *   get:
 *     summary: Get coupon by ID (Admin)
 *     description: Retrieve a specific coupon by its ID
 *     tags: [Coupons]
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
 *         description: Coupon found
 *       404:
 *         description: Coupon not found
 */
router.get('/admin/:id', ValidationMiddleware.validateObjectId, controller.getCouponById);

/**
 * @swagger
 * /coupons/admin/{id}:
 *   put:
 *     summary: Update coupon (Admin)
 *     description: Update an existing coupon
 *     tags: [Coupons]
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
 *             $ref: '#/components/schemas/UpdateCoupon'
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       404:
 *         description: Coupon not found
 */
router.put('/admin/:id', ValidationMiddleware.validateObjectId, controller.updateCoupon);

/**
 * @swagger
 * /coupons/admin/{id}:
 *   delete:
 *     summary: Delete coupon (Admin)
 *     description: Permanently delete a coupon
 *     tags: [Coupons]
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
 *         description: Coupon deleted successfully
 *       404:
 *         description: Coupon not found
 */
router.delete('/admin/:id', ValidationMiddleware.validateObjectId, controller.deleteCoupon);

/**
 * @swagger
 * /coupons/admin/apply:
 *   post:
 *     summary: Apply/use a coupon (Admin)
 *     description: Increment the usage count of a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid coupon
 */
router.post('/admin/apply', controller.applyCoupon);

export const CouponRoute = router;