import { Router } from "express";
import { userController } from "./user.controller";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";
import { multerUpload } from "../../middlewares/multerUpload";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication, profiles and admin management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: Jane Vendor
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, VENDOR, CUSTOMER]
 *         isActive:
 *           type: boolean
 *           default: true
 *         isVerified:
 *           type: boolean
 *           description: Relevant only for vendors
 *           default: false
 *         profileImage:
 *           type: string
 *           nullable: true
 *         storeBanner:
 *           type: string
 *           nullable: true
 *         businessName:
 *           type: string
 *           nullable: true
 *         businessType:
 *           type: string
 *           nullable: true
 *         businessDescription:
 *           type: string
 *           nullable: true
 *         country:
 *           type: string
 *           nullable: true
 *         shippingLocation:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Local within city state, National within country, International]
 *         currency:
 *           type: string
 *           example: NGN
 *         language:
 *           type: string
 *           default: en
 *         holdingTime:
 *           type: number
 *           description: Order holding time in hours (vendors)
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         phone:
 *           type: string
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users/register/customer:
 *   post:
 *     summary: Register a new customer
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, format: email, example: john@example.com }
 *               password: { type: string, minLength: 6, example: secret123 }
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
router.post("/register/customer", userController.registerCustomer);

/**
 * @swagger
 * /users/register/vendor:
 *   post:
 *     summary: Register a new vendor (pending admin approval)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - businessName
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Vendor
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               businessName:
 *                 type: string
 *               businessType:
 *                 type: string
 *               businessDescription:
 *                 type: string
 *               country:
 *                 type: string
 *               shippingLocation:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Local within city state, National within country, International]
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               bankAccountHolderName:
 *                 type: string
 *               bankAccountNumber:
 *                 type: string
 *               bankRoughingNumber:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [Bank Account, PAYSTACK, Stripe]
 *               taxId:
 *                 type: string
 *               isPrivacyPolicyAccepted:
 *                 type: boolean
 *               isSellerPolicyAccepted:
 *                 type: boolean
 *               vendorSignature:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendor registered successfully. Account is pending admin verification
 *       400:
 *         description: Validation error or email already exists
 */
router.post("/register/vendor", userController.registerVendor);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user (customer/vendor/admin)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials or unverified vendor
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", userController.refreshToken);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout user and clear authentication cookies
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", verifyToken, userController.logout);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", verifyToken, userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update authenticated user profile (customer or vendor)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               storeBanner:
 *                 type: string
 *                 format: binary
 *               language:
 *                 type: string
 *               currency:
 *                 type: string
 *               # Vendor fields (ignored for customers)
 *               businessName:
 *                 type: string
 *               businessType:
 *                 type: string
 *               businessDescription:
 *                 type: string
 *               country:
 *                 type: string
 *               shippingLocation:
 *                 type: string
 *                 description: JSON string array e.g. ["Local within city state"]
 *               categories:
 *                 type: string
 *                 description: JSON string array of categories
 *               holdingTime:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [Bank Account, PAYSTACK, Stripe]
 *               bankAccountHolderName:
 *                 type: string
 *               bankAccountNumber:
 *                 type: string
 *               bankRoughingNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/profile",
  verifyToken,
  multerUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "storeBanner", maxCount: 1 }
  ]),
  userController.updateUser
);

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change password for authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *               confirmPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or incorrect current password
 */
router.put("/change-password", verifyToken, userController.changePassword);

/**
 * @swagger
 * /users/deactivate/{id}:
 *   patch:
 *     summary: Deactivate a user (self or admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.patch("/deactivate/:id", verifyToken, authorizeRoles("ADMIN", "VENDOR", "CUSTOMER"), userController.deactivateUser);

/**
 * @swagger
 * /users/vendors:
 *   get:
 *     summary: Get all approved vendors (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/vendors", verifyToken, authorizeRoles("ADMIN"), userController.getAllVendors);

/**
 * @swagger
 * /users/vendors/pending:
 *   get:
 *     summary: Get all pending vendors (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending vendors
 */
router.get("/vendors/pending", verifyToken, authorizeRoles("ADMIN"), userController.getPendingVendors);

/**
 * @swagger
 * /users/vendors/pending/{id}:
 *   get:
 *     summary: Get details of a single pending vendor (Admin only)
 *     tags: [Users]
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
 *         description: Pending vendor details
 *       404:
 *         description: Pending vendor not found
 */
router.get("/vendors/pending/:id", verifyToken, authorizeRoles("ADMIN"), userController.getPendingVendorById);

/**
 * @swagger
 * /users/customers:
 *   get:
 *     summary: Get all customers (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get("/customers", verifyToken, authorizeRoles("ADMIN"), userController.getAllCustomers);

/**
 * @swagger
 * /users/vendor/verify/{id}:
 *   patch:
 *     summary: Verify/approve a vendor (Admin only)
 *     tags: [Users]
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
 *         description: Vendor verified successfully
 */
router.patch("/vendor/verify/:id", verifyToken, authorizeRoles("ADMIN"), userController.verifyVendor);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Permanently delete a user (Admin only)
 *     tags: [Users]
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
 *         description: User deleted successfully
 */
router.delete("/:id", verifyToken, authorizeRoles("ADMIN"), userController.deleteUser);

router.post(
  "/vendor/create-subaccount",
  verifyToken,
  authorizeRoles("VENDOR"),
  userController.createVendorSubaccount
);


export const UserRoutes = router;