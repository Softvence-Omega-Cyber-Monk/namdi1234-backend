// src/app/modules/energyUsage/energyUsage.routes.ts
import { Router } from "express";
import { energyUsageController } from "./energyUsage.controller";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Energy Usage
 *   description: Energy usage and procurement management APIs
 */

/* ===========================
   📝 POST ROUTES
=========================== */

/**
 * @swagger
 * /energy-usage:
 *   post:
 *     summary: Create a new energy usage record (Admin only)
 *     tags: [Energy Usage]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  energyUsageController.createEnergyUsage
);

/**
 * @swagger
 * /energy-usage/bulk:
 *   post:
 *     summary: Bulk create energy usage records (Admin only)
 *     tags: [Energy Usage]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/bulk",
  verifyToken,
  authorizeRoles("ADMIN"),
  energyUsageController.bulkCreateEnergyUsage
);

/* ===========================
   📖 GET ROUTES
=========================== */

/**
 * @swagger
 * /energy-usage/admin:
 *   get:
 *     summary: Get all energy usage records (Admin only)
 *     tags: [Energy Usage]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/admin",
  verifyToken,
  authorizeRoles("ADMIN"),
  energyUsageController.getAllEnergyUsage
);

/**
 * @swagger
 * /energy-usage/active:
 *   get:
 *     summary: Get active energy usage records (Public)
 *     tags: [Energy Usage]
 */
router.get("/active", energyUsageController.getActiveEnergyUsage);

/**
 * @swagger
 * /energy-usage/stats:
 *   get:
 *     summary: Get energy usage statistics (Admin only)
 *     tags: [Energy Usage]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/stats",
  verifyToken,
  authorizeRoles("ADMIN"),
  energyUsageController.getStats
);

/**
 * @swagger
 * /energy-usage/ref/{refNumber}:
 *   get:
 *     summary: Get energy usage by reference number
 *     tags: [Energy Usage]
 */
router.get("/ref/:refNumber", energyUsageController.getEnergyUsageByRefNumber);

/**
 * @swagger
 * /energy-usage/{id}:
 *   get:
 *     summary: Get energy usage by ID
 *     tags: [Energy Usage]
 */
router.get("/:id", energyUsageController.getEnergyUsageById);

/* ===========================
   ✏️ PATCH ROUTES
=========================== */

/**
 * @swagger
 * /energy-usage/{id}:
 *   patch:
 *     summary: Update energy usage record (Admin only)
 *     tags: [Energy Usage]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  energyUsageController.updateEnergyUsage
);

/**
 * @swagger
 * /energy-usage/{id}/toggle:
 *   patch:
 *     summary: Toggle energy usage status (Admin only)
 *     tags: [Energy Usage]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/toggle",
  verifyToken,
  authorizeRoles("ADMIN"),
  energyUsageController.toggleEnergyUsageStatus
);

/* ===========================
   ❌ DELETE ROUTES
=========================== */

/**
 * @swagger
 * /energy-usage/{id}:
 *   delete:
 *     summary: Delete energy usage record (Admin only)
 *     tags: [Energy Usage]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  energyUsageController.deleteEnergyUsage
);

export const EnergyUsageRoutes = router;