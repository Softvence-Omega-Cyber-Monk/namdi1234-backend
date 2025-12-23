import { Router } from "express";
import ReviewController from "./review.controller";
import { verifyToken } from "../../middlewares/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product review management APIs
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - rating
 *               - feedback
 *             properties:
 *               product:
 *                 type: string
 *                 example: "6705ad7d23127e4af1346b1e"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               feedback:
 *                 type: string
 *                 minLength: 10
 *                 example: "Great product! Highly recommended. Very satisfied with my purchase."
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", verifyToken, ReviewController.createReview);

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews with filtering and pagination
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Filter by rating
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of all reviews with pagination
 */
router.get("/", ReviewController.getReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a specific review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
router.get("/:id", ReviewController.getReviewById);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               feedback:
 *                 type: string
 *                 minLength: 10
 *                 example: "Updated review message with more details about the product."
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 */
router.patch("/:id", verifyToken, ReviewController.updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
router.delete("/:id", verifyToken, ReviewController.deleteReview);

/**
 * @swagger
 * /reviews/{id}/upvote:
 *   post:
 *     summary: Upvote a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review upvoted successfully
 *       404:
 *         description: Review not found
 */
router.post("/:id/upvote", verifyToken, ReviewController.upvoteReview);

/**
 * @swagger
 * /reviews/{id}/downvote:
 *   post:
 *     summary: Downvote a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review downvoted successfully
 *       404:
 *         description: Review not found
 */
router.post("/:id/downvote",verifyToken, ReviewController.downvoteReview);

/**
 * @swagger
 * /reviews/{id}/reply:
 *   post:
 *     summary: Add a reply to a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Thank you for your feedback!"
 *     responses:
 *       201:
 *         description: Reply added successfully
 *       404:
 *         description: Review not found
 */
router.post("/:id/reply", verifyToken, ReviewController.addReply);

export const ReviewRoutes = router;