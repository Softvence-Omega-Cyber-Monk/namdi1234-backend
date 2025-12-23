import { Router } from 'express';
import { SupportMessageController } from './support.controller';
import { ValidationMiddleware } from '../../middlewares/validation.middleware';

const router = Router();
const controller = new SupportMessageController();

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Customer support message management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SupportMessage:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - subject
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the message
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Name of the person sending the message
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the sender
 *           example: john.doe@example.com
 *         subject:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           description: Subject of the support message
 *           example: Question about my order
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           description: The support message content
 *           example: I have a question about my recent order #12345
 *         status:
 *           type: string
 *           enum: [pending, resolved]
 *           description: Current status of the message
 *           example: pending
 *         adminReply:
 *           type: string
 *           nullable: true
 *           maxLength: 2000
 *           description: Admin's reply to the message
 *           example: Thank you for your message. Your order is being processed.
 *         repliedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Timestamp when admin replied
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Message creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     CreateSupportMessage:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - subject
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         subject:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           example: Question about my order
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           example: I have a question about my recent order #12345. Can you help me?
 *     
 *     ReplyToMessage:
 *       type: object
 *       required:
 *         - reply
 *       properties:
 *         reply:
 *           type: string
 *           maxLength: 2000
 *           description: Admin's reply to the support message
 *           example: Thank you for contacting us. Your order #12345 is currently being processed and will be shipped within 2 business days.
 *     
 *     MessageStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Total number of messages
 *           example: 150
 *         pending:
 *           type: number
 *           description: Number of pending messages
 *           example: 45
 *         resolved:
 *           type: number
 *           description: Number of resolved messages
 *           example: 105
 */

/**
 * @swagger
 * /support/messages:
 *   post:
 *     summary: Create a new support message
 *     description: Submit a support message from a customer. An automatic confirmation email will be sent.
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSupportMessage'
 *     responses:
 *       201:
 *         description: Message sent successfully
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
 *                   example: Your message has been sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Validation error - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: All fields are required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to send message
 */
router.post('/messages', controller.createMessage);

/**
 * @swagger
 * /support/admin/messages:
 *   get:
 *     summary: Get all support messages (Admin)
 *     description: Retrieve all support messages with optional status filtering
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, resolved]
 *         description: Filter messages by status
 *         example: pending
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupportMessage'
 *       500:
 *         description: Server error
 */
router.get('/admin/messages', controller.getAllMessages);

/**
 * @swagger
 * /support/admin/messages/stats:
 *   get:
 *     summary: Get support message statistics (Admin)
 *     description: Retrieve statistics about total, pending, and resolved messages
 *     tags: [Support]
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
 *                   $ref: '#/components/schemas/MessageStats'
 *       500:
 *         description: Server error
 */
router.get('/admin/messages/stats', controller.getStats);

/**
 * @swagger
 * /support/admin/messages/{id}:
 *   get:
 *     summary: Get a specific support message (Admin)
 *     description: Retrieve details of a specific support message by ID
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the support message
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SupportMessage'
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Message not found
 *       500:
 *         description: Server error
 */
router.get(
  '/admin/messages/:id',
  ValidationMiddleware.validateObjectId,
  controller.getMessageById
);

/**
 * @swagger
 * /support/admin/messages/{id}/reply:
 *   put:
 *     summary: Reply to a support message (Admin)
 *     description: Send a reply to a support message and mark it as resolved. An email will be sent to the customer.
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the support message
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReplyToMessage'
 *     responses:
 *       200:
 *         description: Reply sent successfully
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
 *                   example: Reply sent successfully and message marked as resolved
 *                 data:
 *                   $ref: '#/components/schemas/SupportMessage'
 *       400:
 *         description: Validation error - empty reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Reply message is required
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error or email sending failed
 */
router.put(
  '/admin/messages/:id/reply',
  ValidationMiddleware.validateObjectId,
  controller.replyToMessage
);

/**
 * @swagger
 * /support/admin/messages/{id}:
 *   delete:
 *     summary: Delete a support message (Admin)
 *     description: Permanently delete a support message from the system
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the support message
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Message deleted successfully
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
 *                   example: Support message deleted successfully
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Message not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/admin/messages/:id',
  ValidationMiddleware.validateObjectId,
  controller.deleteMessage
);

export const SupportRoute = router;