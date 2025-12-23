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
 *   description: User management endpoints
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
 *               email: { type: string, example: johndoe@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       201:
 *         description: Customer registered successfully
 */
router.post("/register/customer", userController.registerCustomer);

/**
 * @swagger
 * /users/register/vendor:
 *   post:
 *     summary: Register a new vendor
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
 *               - businessCRNumber
 *               - CRDocuments
 *               - isPrivacyPolicyAccepted
 *               - vendorSignature
 *               - vendorContract
 *               - isSellerPolicyAccepted
 *             properties:
 *               name: { type: string, example: Jane Vendor }
 *               email: { type: string, example: vendor@example.com }
 *               password: { type: string, example: secret123 }
 *               businessName: { type: string, example: Jane's Store }
 *               businessCRNumber: { type: string, example: CR123456 }
 *               CRDocuments: { type: string, example: "/uploads/cr.pdf" }
 *               businessType: { type: string, example: Retail }
 *               businessDescription: { type: string, example: "Medical supplies" }
 *               country: { type: string, example: USA }
 *               productCategory: { type: array, items: { type: string }, example: ["Analgesics"] }
 *               shippingLocation: { type: array, items: { type: string }, example: ["Local within city state"] }
 *               storeDescription: { type: string, example: "Best meds online" }
 *               paymentMethod: { type: string, example: BANK_ACCOUNT }
 *               bankAccountHolderName: { type: string, example: Jane Vendor }
 *               bankAccountNumber: { type: string, example: 12345678 }
 *               bankRoughingNumber: { type: string, example: 123456789 }
 *               taxId: { type: string, example: TAX12345 }
 *               isPrivacyPolicyAccepted: { type: boolean, example: true }
 *               vendorSignature: { type: string, example: "Jane Vendor" }
 *               vendorContract: { type: string, example: "/uploads/vendor_contract.pdf" }
 *               isSellerPolicyAccepted: { type: boolean, example: true }
 *               address: { type: string, example: "123 Street, City" }
 *               phone: { type: string, example: "+1234567890" }
 *     responses:
 *       201:
 *         description: Vendor registered successfully. Pending verification
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
 *               email: { type: string, example: admin@gmail.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Users]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", userController.refreshToken);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout user and clear cookies
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
 *     summary: Get logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 */
router.get("/profile", verifyToken, userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update logged-in user profile with optional image uploads
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: 
 *                 type: string
 *                 example: John Updated
 *               email: 
 *                 type: string
 *                 example: newemail@example.com
 *               address: 
 *                 type: string
 *                 example: "456 New Street, City"
 *               phone: 
 *                 type: string
 *                 example: "+1234567890"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: User profile image (JPEG, PNG, WebP, GIF - Max 10MB)
 *               storeBanner:
 *                 type: string
 *                 format: binary
 *                 description: Store banner image (JPEG, PNG, WebP, GIF - Max 10MB)
 *               currency:
 *                 type: string
 *                 example: USD
 *                 description: Preferred currency for transactions
 *               holdingTime:
 *                 type: number
 *                 example: 48
 *                 description: Order holding time in hours
 *               categories:
 *                 type: string
 *                 example: '["Electronics", "Clothing", "Books"]'
 *                 description: Array of product categories (send as JSON string)
 *               language:
 *                 type: string
 *                 example: en
 *                 description: Preferred language
 *               businessName: 
 *                 type: string
 *                 example: "Updated Business Name"
 *               businessCRNumber: 
 *                 type: string
 *                 example: CR789012
 *               CRDocuments: 
 *                 type: string
 *                 example: "/uploads/new-cr.pdf"
 *               businessType: 
 *                 type: string
 *                 example: "Wholesale"
 *               businessDescription: 
 *                 type: string
 *                 example: "Updated business description"
 *               country: 
 *                 type: string
 *                 example: "Canada"
 *               productCategory: 
 *                 type: string
 *                 example: '["Antibiotics", "Analgesics"]'
 *                 description: Medical product categories (send as JSON string)
 *               shippingLocation:
 *                 type: string
 *                 example: '["National within country", "International"]'
 *                 description: Shipping locations (send as JSON string)
 *               storeDescription: 
 *                 type: string
 *                 example: "Premium medical supplies online"
 *               paymentMethod: 
 *                 type: string
 *                 enum: ["Bank Account", "Paypal", "Stripe"]
 *                 example: "Paypal"
 *               bankAccountHolderName: 
 *                 type: string
 *                 example: "John Doe"
 *               bankAccountNumber: 
 *                 type: string
 *                 example: "87654321"
 *               bankRoughingNumber: 
 *                 type: string
 *                 example: "987654321"
 *               taxId: 
 *                 type: string
 *                 example: "TAX67890"
 *               isPrivacyPolicyAccepted: 
 *                 type: boolean
 *                 example: true
 *               vendorSignature: 
 *                 type: string
 *                 example: "John Doe Signature"
 *               vendorContract: 
 *                 type: string
 *                 example: "/uploads/updated_contract.pdf"
 *               isSellerPolicyAccepted: 
 *                 type: boolean
 *                 example: true
 *               orderNotification: 
 *                 type: string
 *                 example: "email"
 *               promotionNotification: 
 *                 type: string
 *                 example: "sms"
 *               communicationAlert: 
 *                 type: string
 *                 example: "push"
 *               newReviewsNotification: 
 *                 type: string
 *                 example: "email"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
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
 *     summary: Change password for logged-in user
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
 *               currentPassword: { type: string, example: "oldPassword123" }
 *               newPassword: { type: string, example: "newPassword123" }
 *               confirmPassword: { type: string, example: "newPassword123" }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input or password mismatch
 *       401:
 *         description: Current password is incorrect
 */
router.put("/change-password", verifyToken, userController.changePassword);

/**
 * @swagger
 * /users/deactivate/{id}:
 *   patch:
 *     summary: Deactivate a user with optional reason
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: "Requested by admin" }
 *     responses:
 *       200:
 *         description: User deactivated successfully
 */
router.patch("/deactivate/:id", verifyToken, authorizeRoles("ADMIN", "VENDOR", "CUSTOMER"), userController.deactivateUser);

// Add this route after the /vendors route (around line 367)

/**
 * @swagger
 * /users/vendors/pending:
 *   get:
 *     summary: Get all pending/unapproved vendors (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all pending vendors
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
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/vendors/pending", verifyToken, authorizeRoles("ADMIN"), userController.getPendingVendors);

// Add this route after the /vendors/pending route

/**
 * @swagger
 * /users/vendors/pending/{id}:
 *   get:
 *     summary: Get a single pending/unapproved vendor by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Pending vendor details retrieved successfully
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
 *                   description: Vendor details
 *       404:
 *         description: Pending vendor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Pending vendor not found"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/vendors/pending/:id", verifyToken, authorizeRoles("ADMIN"), userController.getPendingVendorById);

/**
 * @swagger
 * /users/vendors:
 *   get:
 *     summary: Get all vendors (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all vendors
 */
router.get("/vendors", verifyToken, authorizeRoles("ADMIN"), userController.getAllVendors);



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
 *         description: List of all customers
 */
router.get("/customers", verifyToken, authorizeRoles("ADMIN"), userController.getAllCustomers);

/**
 * @swagger
 * /users/vendor/verify/{id}:
 *   patch:
 *     summary: Verify a vendor (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor verified successfully
 */
router.patch("/vendor/verify/:id", verifyToken, authorizeRoles("ADMIN"), userController.verifyVendor);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/:id", verifyToken, authorizeRoles("ADMIN"), userController.deleteUser);

export const UserRoutes = router;