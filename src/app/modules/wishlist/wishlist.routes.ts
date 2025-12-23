import { Router } from "express";
import { WishlistController } from "./wishlist.controller";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management APIs
 */

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID to add to wishlist
 *                 example: "6711b03d1122334455667788"
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product to add to wishlist
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product added to wishlist
 *       400:
 *         description: Product already in wishlist or invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post("/", verifyToken, authorizeRoles("CUSTOMER", "ADMIN" , "VENDOR"), WishlistController.addToWishlist);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           description: ID of the product to remove
 *           example: "6711b03d1122334455667788"
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 *       400:
 *         description: Invalid product ID or not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.delete("/:productId", verifyToken, authorizeRoles("CUSTOMER", "ADMIN"), WishlistController.removeFromWishlist);

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get all wishlist products of the authenticated user
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Wishlist'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get("/", verifyToken, authorizeRoles("CUSTOMER", "ADMIN"), WishlistController.getUserWishlist);

export const WishlistRoutes = router;