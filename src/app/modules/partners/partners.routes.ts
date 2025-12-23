import { Router } from "express";
import { partnerController } from "./partners.controller";
import { multerUpload } from "../../middlewares/multerUpload";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Partner:
 *       type: object
 *       properties:
 *         companyName:
 *           type: string
 *           example: TechCorp Solutions
 *         logoUrl:
 *           type: string
 *         cloudinaryId:
 *           type: string
 *         website:
 *           type: string
 *           example: https://techcorp.com
 *         description:
 *           type: string
 *           example: Leading technology solutions provider
 *         isActive:
 *           type: boolean
 *         displayOrder:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Partners
 *   description: Partner company management APIs
 */

// =====================
// PUBLIC ROUTES
// =====================

/**
 * @swagger
 * /partners/active:
 *   get:
 *     summary: Get all active partner companies (Public)
 *     tags: [Partners]
 *     responses:
 *       200:
 *         description: Active partners retrieved successfully
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
 *                     $ref: '#/components/schemas/Partner'
 */
router.get("/active", partnerController.getActivePartners);

// =====================
// ADMIN/VENDOR ROUTES
// =====================

/**
 * @swagger
 * /partners:
 *   post:
 *     summary: Create a new partner company (Admin/Vendor only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - logo
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: TechCorp Solutions
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Partner company logo (JPEG, PNG, WebP - Max 10MB)
 *               website:
 *                 type: string
 *                 example: https://techcorp.com
 *               description:
 *                 type: string
 *                 example: Leading technology solutions provider
 *               displayOrder:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Partner created successfully
 *       400:
 *         description: Invalid input or partner already exists
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "VENDOR"),
  multerUpload.single("logo"),
  partnerController.createPartner
);

/**
 * @swagger
 * /partners:
 *   get:
 *     summary: Get all partners with filters (Admin/Vendor only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search in company name and description
 *     responses:
 *       200:
 *         description: Partners retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "VENDOR"),
  partnerController.getAllPartners
);

/**
 * @swagger
 * /partners/count:
 *   get:
 *     summary: Get partners count (Admin/Vendor only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Count retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/count",
  verifyToken,
  authorizeRoles("ADMIN", "VENDOR"),
  partnerController.getPartnersCount
);

/**
 * @swagger
 * /partners/reorder:
 *   put:
 *     summary: Reorder partners (Admin/Vendor only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderData
 *             properties:
 *               orderData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 6723abc123def456
 *                     displayOrder:
 *                       type: number
 *                       example: 1
 *     responses:
 *       200:
 *         description: Partners reordered successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/reorder",
  verifyToken,
  authorizeRoles("ADMIN", "VENDOR"),
  partnerController.reorderPartners
);

/**
 * @swagger
 * /partners/{id}:
 *   get:
 *     summary: Get partner by ID
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     responses:
 *       200:
 *         description: Partner retrieved successfully
 *       404:
 *         description: Partner not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "VENDOR"),
  partnerController.getPartnerById
);

/**
 * @swagger
 * /partners/{id}:
 *   put:
 *     summary: Update a partner (Admin/Vendor only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: Updated Company Name
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: New partner logo (optional)
 *               website:
 *                 type: string
 *                 example: https://newwebsite.com
 *               description:
 *                 type: string
 *                 example: Updated description
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               displayOrder:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Partner updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Partner not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "VENDOR"),
  multerUpload.single("logo"),
  partnerController.updatePartner
);

/**
 * @swagger
 * /partners/{id}:
 *   delete:
 *     summary: Delete a partner (Admin only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     responses:
 *       200:
 *         description: Partner deleted successfully
 *       404:
 *         description: Partner not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  partnerController.deletePartner
);

/**
 * @swagger
 * /partners/{id}/toggle-status:
 *   patch:
 *     summary: Toggle partner active status (Admin/Vendor only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     responses:
 *       200:
 *         description: Partner status toggled successfully
 *       404:
 *         description: Partner not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id/toggle-status",
  verifyToken,
  authorizeRoles("ADMIN", "VENDOR"),
  partnerController.togglePartnerStatus
);

export const PartnerRoutes = router;