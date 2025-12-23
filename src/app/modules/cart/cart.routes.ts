import { Router } from "express";
import { CartController } from "./cart.controller";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";

const router = Router();

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
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
 *                 description: Product ID to add to cart
 *                 example: "6711b03d1122334455667788"
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: Quantity to add
 *                 example: 2
 *     responses:
 *       201:
 *         description: Product added or updated in cart
 *       400:
 *         description: Invalid input or product not found
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, authorizeRoles("CUSTOMER", "VENDOR"), CartController.addToCart);

/**
 * @swagger
 * /cart/{productId}:
 *   patch:
 *     summary: Update product quantity in cart (increment/decrement)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [increment, decrement]
 *                 example: "increment"
 *     responses:
 *       200:
 *         description: Cart updated
 *       400:
 *         description: Invalid action or product not in cart
 *       404:
 *         description: Cart item not found
 */
router.patch("/:productId", verifyToken, authorizeRoles("CUSTOMER", "VENDOR"), CartController.updateCartItem);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove a product from cart
 *     tags: [Cart]
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
 *         description: Product removed from cart
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in cart
 */
router.delete("/:productId", verifyToken, authorizeRoles("CUSTOMER", "VENDOR"), CartController.removeFromCart);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's full cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get("/", verifyToken, authorizeRoles("CUSTOMER", "VENDOR"), CartController.getUserCart);

export const CartRoutes = router;
