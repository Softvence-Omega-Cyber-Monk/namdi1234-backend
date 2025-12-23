import { Router } from 'express';
import { NewsletterController } from './newsletter.controller';

const router = Router();
const controller = new NewsletterController();

/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: Newsletter subscription management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Newsletter:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         status:
 *           type: string
 *           enum: [active, unsubscribed]
 *         subscribedAt:
 *           type: string
 *           format: date-time
 *         unsubscribedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     SubscribeNewsletter:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *     
 *     NewsletterStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *         active:
 *           type: number
 *         unsubscribed:
 *           type: number
 */

/**
 * @swagger
 * /newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     description: Subscribe an email address to the newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscribeNewsletter'
 *     responses:
 *       201:
 *         description: Successfully subscribed
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
 *                     email:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Bad request or email already subscribed
 */
router.post('/subscribe', controller.subscribe);

/**
 * @swagger
 * /newsletter/unsubscribe:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     description: Unsubscribe an email address from the newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Successfully unsubscribed
 *       400:
 *         description: Bad request or email not found
 */
router.post('/unsubscribe', controller.unsubscribe);

/**
 * @swagger
 * /newsletter/admin/subscribers:
 *   get:
 *     summary: Get all subscribers (Admin)
 *     description: Retrieve all newsletter subscribers with optional status filter
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, unsubscribed]
 *     responses:
 *       200:
 *         description: Subscribers retrieved successfully
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
 *                     $ref: '#/components/schemas/Newsletter'
 */
router.get('/admin/subscribers', controller.getAllSubscribers);

/**
 * @swagger
 * /newsletter/admin/subscribers/stats:
 *   get:
 *     summary: Get newsletter statistics (Admin)
 *     description: Retrieve statistics about newsletter subscribers
 *     tags: [Newsletter]
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
 *                   $ref: '#/components/schemas/NewsletterStats'
 */
router.get('/admin/subscribers/stats', controller.getStats);

/**
 * @swagger
 * /newsletter/admin/subscribers/{email}:
 *   get:
 *     summary: Get subscriber by email (Admin)
 *     description: Retrieve a specific subscriber by email address
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscriber found
 *       404:
 *         description: Subscriber not found
 */
router.get('/admin/subscribers/:email', controller.getSubscriberByEmail);

/**
 * @swagger
 * /newsletter/admin/subscribers/{email}:
 *   delete:
 *     summary: Delete subscriber (Admin)
 *     description: Permanently delete a subscriber from the database
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscriber deleted successfully
 *       404:
 *         description: Subscriber not found
 */
router.delete('/admin/subscribers/:email', controller.deleteSubscriber);

/**
 * @swagger
 * /newsletter/admin/bulk-subscribe:
 *   post:
 *     summary: Bulk subscribe emails (Admin)
 *     description: Subscribe multiple email addresses at once
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emails
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *     responses:
 *       200:
 *         description: Bulk subscription completed
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
 *                     success:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post('/admin/bulk-subscribe', controller.bulkSubscribe);

export const NewsletterRoute = router;