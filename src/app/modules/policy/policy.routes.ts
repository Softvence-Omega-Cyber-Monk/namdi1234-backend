import { Router } from 'express';
import { policyController } from './policy.controller';
import { verifyToken } from '../../middlewares/auth';
import { authorizeRoles } from '../../middlewares/roleAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Policy:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - Seller Protection Policy
 *             - Privacy Policy
 *             - Privacy Policy for MDitems
 *             - Delivery Return Policy
 *             - Cookie Policy
 *             - Buyer Protection Policy
 *             - Terms and Conditions
 *             - Shipping Policy for MDItems
 *         slug:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         contentFormat:
 *           type: string
 *           enum: [plain, html]
 *         isActive:
 *           type: boolean
 *         metaDescription:
 *           type: string
 *         metaKeywords:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreatePolicy:
 *       type: object
 *       required:
 *         - type
 *         - title
 *         - content
 *       properties:
 *         type:
 *           type: string
 *           enum:
 *             - Seller Protection Policy
 *             - Privacy Policy
 *             - Privacy Policy for MDitems
 *             - Delivery Return Policy
 *             - Cookie Policy
 *             - Buyer Protection Policy
 *             - Terms and Conditions
 *             - Shipping Policy for MDItems
 *         title:
 *           type: string
 *           example: Privacy Policy
 *         content:
 *           type: string
 *           example: <h1>Privacy Policy</h1><p>We value your privacy...</p>
 *         contentFormat:
 *           type: string
 *           enum: [plain, html]
 *           default: html
 *         metaDescription:
 *           type: string
 *           example: Our comprehensive privacy policy
 *         metaKeywords:
 *           type: array
 *           items:
 *             type: string
 *           example: ["privacy", "policy", "data protection"]
 *     UpdatePolicy:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         contentFormat:
 *           type: string
 *           enum: [plain, html]
 *         isActive:
 *           type: boolean
 *         metaDescription:
 *           type: string
 *         metaKeywords:
 *           type: array
 *           items:
 *             type: string
 *     PolicyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Policy'
 *     PoliciesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         count:
 *           type: integer
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Policy'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Policies
 *   description: Policy and legal document management
 */

// =====================
// PUBLIC ROUTES
// =====================

/**
 * @swagger
 * /policy/active:
 *   get:
 *     summary: Get all active policies
 *     description: Retrieve all active policies for public viewing
 *     tags: [Policies]
 *     responses:
 *       200:
 *         description: Active policies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PoliciesResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/active', policyController.getActivePolicies);

/**
 * @swagger
 * /policy/search:
 *   get:
 *     summary: Search policies
 *     description: Search for policies by keyword
 *     tags: [Policies]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *         example: privacy
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PoliciesResponse'
 *       400:
 *         description: Search term is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', policyController.searchPolicies);

/**
 * @swagger
 * /policy/type/{type}:
 *   get:
 *     summary: Get policy by type
 *     description: Retrieve a specific policy by its type
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - Seller Protection Policy
 *             - Privacy Policy
 *             - Privacy Policy for MDitems
 *             - Delivery Return Policy
 *             - Cookie Policy
 *             - Buyer Protection Policy
 *             - Terms and Conditions
 *             - Shipping Policy for MDItems
 *         description: Policy type
 *         example: Privacy Policy
 *     responses:
 *       200:
 *         description: Policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PolicyResponse'
 *       404:
 *         description: Policy not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/type/:type', policyController.getPolicyByType);

/**
 * @swagger
 * /policy/slug/{slug}:
 *   get:
 *     summary: Get policy by slug
 *     description: Retrieve a specific policy by its slug
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy slug
 *         example: privacy-policy
 *     responses:
 *       200:
 *         description: Policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PolicyResponse'
 *       404:
 *         description: Policy not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/slug/:slug', policyController.getPolicyBySlug);

// =====================
// ADMIN ROUTES
// =====================

/**
 * @swagger
 * /policy/admin/initialize:
 *   post:
 *     summary: Initialize default policies
 *     description: Create default policies for all policy types (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default policies initialized successfully
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
 *                   example: Default policies initialized successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/admin/initialize', verifyToken, authorizeRoles('ADMIN'), policyController.initializeDefaultPolicies);

/**
 * @swagger
 * /policy/admin:
 *   post:
 *     summary: Create a new policy
 *     description: Create a new policy document (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePolicy'
 *     responses:
 *       201:
 *         description: Policy created successfully
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
 *                   example: Policy created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Policy'
 *       400:
 *         description: Invalid input or policy already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/admin', verifyToken, authorizeRoles('ADMIN'), policyController.createPolicy);

/**
 * @swagger
 * /policy/admin/all:
 *   get:
 *     summary: Get all policies with filters
 *     description: Retrieve all policies with optional filtering (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum:
 *             - Seller Protection Policy
 *             - Privacy Policy
 *             - Privacy Policy for MDitems
 *             - Delivery Return Policy
 *             - Cookie Policy
 *             - Buyer Protection Policy
 *             - Terms and Conditions
 *             - Shipping Policy for MDItems
 *         description: Filter by policy type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by active status
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: Policies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PoliciesResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/all', verifyToken, authorizeRoles('ADMIN'), policyController.getAllPolicies);

/**
 * @swagger
 * /policy/admin/{id}:
 *   get:
 *     summary: Get policy by ID
 *     description: Retrieve a specific policy by its ID (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PolicyResponse'
 *       404:
 *         description: Policy not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/:id', verifyToken, authorizeRoles('ADMIN'), policyController.getPolicyById);

/**
 * @swagger
 * /policy/admin/{id}:
 *   put:
 *     summary: Update policy
 *     description: Update an existing policy (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePolicy'
 *     responses:
 *       200:
 *         description: Policy updated successfully
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
 *                   example: Policy updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Policy'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Policy not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/admin/:id', verifyToken, authorizeRoles('ADMIN'), policyController.updatePolicy);

/**
 * @swagger
 * /policy/admin/{id}:
 *   delete:
 *     summary: Delete policy
 *     description: Delete a policy permanently (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Policy deleted successfully
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
 *                   example: Policy deleted successfully
 *       404:
 *         description: Policy not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/admin/:id', verifyToken, authorizeRoles('ADMIN'), policyController.deletePolicy);

/**
 * @swagger
 * /policy/admin/{id}/toggle-status:
 *   patch:
 *     summary: Toggle policy active status
 *     description: Activate or deactivate a policy (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Policy status toggled successfully
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
 *                   example: Policy activated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Policy'
 *       404:
 *         description: Policy not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/admin/:id/toggle-status', verifyToken, authorizeRoles('ADMIN'), policyController.togglePolicyStatus);

/**
 * @swagger
 * /policy/admin/{id}/versions:
 *   get:
 *     summary: Get policy version history
 *     description: Retrieve all versions of a policy (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Version history retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       version:
 *                         type: number
 *                       content:
 *                         type: string
 *                       createdBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       isActive:
 *                         type: boolean
 *       404:
 *         description: Policy not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/:id/versions', verifyToken, authorizeRoles('ADMIN'), policyController.getPolicyVersionHistory);

/**
 * @swagger
 * /policy/admin/{id}/restore:
 *   post:
 *     summary: Restore a specific policy version
 *     description: Restore a policy to a previous version (Admin only)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - versionNumber
 *             properties:
 *               versionNumber:
 *                 type: number
 *                 description: The version number to restore
 *                 example: 2
 *     responses:
 *       200:
 *         description: Policy version restored successfully
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
 *                   example: Policy version restored successfully
 *                 data:
 *                   $ref: '#/components/schemas/Policy'
 *       400:
 *         description: Invalid version number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Policy or version not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/admin/:id/restore', verifyToken, authorizeRoles('ADMIN'), policyController.restorePolicyVersion);

export const PolicyRoutes = router;