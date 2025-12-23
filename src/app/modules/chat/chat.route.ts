// chat.route.ts
// This file defines all the API endpoints for chat

import { Router } from "express";
import chatController from "./chat.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and messaging APIs for customers and vendors
 */

/**
 * @swagger
 * /chat/conversations:
 *   post:
 *     summary: Start a new conversation or get an existing one
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "64f8a6b21c9e2b001a73ef45"
 *               vendorId:
 *                 type: string
 *                 example: "64f8a7b91c9e2b001a73ef46"
 *               productId:
 *                 type: string
 *                 example: "64f8a8c91c9e2b001a73ef47"
 *               initialMessage:
 *                 type: string
 *                 example: "Hi, I’m interested in your product!"
 *     responses:
 *       200:
 *         description: Conversation started or retrieved successfully
 *       400:
 *         description: Invalid data
 */
router.post("/conversations", chatController.startConversation.bind(chatController));

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     summary: Get all conversations for a specific user
 *     tags: [Chat]
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         example: "64f8a6b21c9e2b001a73ef45"
 *       - name: userType
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [customer, vendor]
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: List of user conversations
 *       404:
 *         description: No conversations found
 */
router.get("/conversations", chatController.getConversations.bind(chatController));

/**
 * @swagger
 * /chat/conversations/{conversationId}:
 *   get:
 *     summary: Get a single conversation by its ID, including all messages
 *     tags: [Chat]
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "6522b38b59f83e9b04b7b91a"
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         example: "64f8a6b21c9e2b001a73ef45"
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       404:
 *         description: Conversation not found
 */
router.get("/conversations/:conversationId", chatController.getConversationById.bind(chatController));

/**
 * @swagger
 * /chat/conversations/{conversationId}/read:
 *   put:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Chat]
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "6522b38b59f83e9b04b7b91a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [customer, vendor]
 *                 example: customer
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *       400:
 *         description: Invalid request body
 */
router.put("/conversations/:conversationId/read", chatController.markAsRead.bind(chatController));

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Chat]
 */
router.post(
    "/conversations/:conversationId/messages",
    chatController.sendMessage.bind(chatController)
);

/**
 * @swagger
 * /chat/conversations/{conversationId}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Chat]
 */
router.delete(
    "/conversations/:conversationId",
    chatController.deleteConversation.bind(chatController)
);

/**
 * @swagger
 * /chat/search:
 *   get:
 *     summary: Search conversations
 *     tags: [Chat]
 */
router.get(
    "/search",
    chatController.searchConversations.bind(chatController)
);

/**
 * @swagger
 * /chat/unread:
 *   get:
 *     summary: Get total unread message count for a user
 *     tags: [Chat]
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         example: "64f8a6b21c9e2b001a73ef45"
 *       - name: userType
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [customer, vendor]
 *     responses:
 *       200:
 *         description: Unread message count retrieved successfully
 *       404:
 *         description: No unread messages found
 */
router.get("/unread", chatController.getUnreadCount.bind(chatController));

export const ChatRoute = router;
