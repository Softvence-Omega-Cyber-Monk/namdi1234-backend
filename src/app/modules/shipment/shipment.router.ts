// src/routes/shipmentCompany.routes.ts

import { Router } from 'express';
import shipmentCompanyController from './shipment.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ShipmentCompany:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Company name
 *           example: Aramex
 *         code:
 *           type: string
 *           description: Company code (uppercase)
 *           example: ARAMEX
 *         description:
 *           type: string
 *           description: Company description
 *           example: International courier and package delivery company
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Contact email
 *           example: contact@aramex.com
 *         contactPhone:
 *           type: string
 *           description: Contact phone number
 *           example: +971-4-123-4567
 *         isActive:
 *           type: boolean
 *           description: Active status
 *           default: true
 *         logo:
 *           type: string
 *           description: Logo URL
 *           example: https://example.com/logo.png
 *         trackingUrl:
 *           type: string
 *           description: Tracking URL template
 *           example: https://www.aramex.com/track?tracking={trackingNumber}
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ShipmentCompanyCreate:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           example: DHL
 *         code:
 *           type: string
 *           example: DHL
 *         description:
 *           type: string
 *           example: Global logistics company
 *         contactEmail:
 *           type: string
 *           format: email
 *           example: info@dhl.com
 *         contactPhone:
 *           type: string
 *           example: +971-4-987-6543
 *         isActive:
 *           type: boolean
 *           default: true
 *         logo:
 *           type: string
 *           example: https://example.com/dhl-logo.png
 *         trackingUrl:
 *           type: string
 *           example: https://www.dhl.com/track?id={trackingNumber}
 *     
 *     ShipmentCompanyUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         description:
 *           type: string
 *         contactEmail:
 *           type: string
 *           format: email
 *         contactPhone:
 *           type: string
 *         isActive:
 *           type: boolean
 *         logo:
 *           type: string
 *         trackingUrl:
 *           type: string
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ShipmentCompany'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 50
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 10
 *             totalPages:
 *               type: number
 *               example: 5
 */

/**
 * @swagger
 * tags:
 *   name: Shipment Companies
 *   description: Shipment company management endpoints
 */

/**
 * @swagger
 * /shipment:
 *   post:
 *     summary: Create a new shipment company
 *     tags: [Shipment Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentCompanyCreate'
 *     responses:
 *       201:
 *         description: Shipment company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', shipmentCompanyController.create);

/**
 * @swagger
 * /shipment:
 *   get:
 *     summary: Get all shipment companies with pagination
 *     tags: [Shipment Companies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or code
 *     responses:
 *       200:
 *         description: List of shipment companies
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', shipmentCompanyController.getAll);

/**
 * @swagger
 * /shipment/active:
 *   get:
 *     summary: Get all active shipment companies (for order page)
 *     tags: [Shipment Companies]
 *     responses:
 *       200:
 *         description: List of active shipment companies
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       logo:
 *                         type: string
 *                       trackingUrl:
 *                         type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/active', shipmentCompanyController.getActiveCompanies);

/**
 * @swagger
 * /shipment/{id}:
 *   get:
 *     summary: Get shipment company by ID
 *     tags: [Shipment Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment company ID
 *     responses:
 *       200:
 *         description: Shipment company details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Shipment company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', shipmentCompanyController.getById);

/**
 * @swagger
 * /shipment/code/{code}:
 *   get:
 *     summary: Get shipment company by code
 *     tags: [Shipment Companies]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment company code (e.g., ARAMEX, DHL)
 *     responses:
 *       200:
 *         description: Shipment company details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Shipment company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/code/:code', shipmentCompanyController.getByCode);

/**
 * @swagger
 * /shipment/{id}:
 *   put:
 *     summary: Update shipment company
 *     tags: [Shipment Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentCompanyUpdate'
 *     responses:
 *       200:
 *         description: Shipment company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Shipment company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', shipmentCompanyController.update);

/**
 * @swagger
 * /shipment/{id}:
 *   delete:
 *     summary: Delete shipment company
 *     tags: [Shipment Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment company ID
 *     responses:
 *       200:
 *         description: Shipment company deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Shipment company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', shipmentCompanyController.delete);

/**
 * @swagger
 * /shipment/{id}/toggle-status:
 *   patch:
 *     summary: Toggle shipment company active status
 *     tags: [Shipment Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment company ID
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Shipment company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/toggle-status', shipmentCompanyController.toggleStatus);

export const ShipmentRouter = router;