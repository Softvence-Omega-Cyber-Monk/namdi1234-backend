// src/app/modules/countdown/countdown.routes.ts
import { Router } from "express";
import { countdownController } from "./countdown.controller";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Countdown Timers
 *   description: Countdown timer management APIs
 */

/* ===========================
   📝 POST ROUTES
=========================== */

/**
 * @swagger
 * /countdown:
 *   post:
 *     summary: Create a new countdown timer (Admin only)
 *     tags: [Countdown Timers]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  countdownController.createCountdown
);

/* ===========================
   📖 GET ROUTES
=========================== */

/**
 * @swagger
 * /countdown/admin:
 *   get:
 *     summary: Get all countdown timers (Admin only)
 *     tags: [Countdown Timers]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/admin",
  verifyToken,
  authorizeRoles("ADMIN"),
  countdownController.getAllCountdowns
);

/**
 * @swagger
 * /countdown/active:
 *   get:
 *     summary: Get all active countdown timers (Public)
 *     tags: [Countdown Timers]
 */
router.get("/active", countdownController.getActiveCountdowns);

/**
 * @swagger
 * /countdown/type/{type}:
 *   get:
 *     summary: Get active countdown by type (Public)
 *     tags: [Countdown Timers]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [exclusive_offer, weekend_deals, flash_sale, general]
 */
router.get("/type/:type", countdownController.getActiveCountdownByType);

/**
 * @swagger
 * /countdown/stats:
 *   get:
 *     summary: Get countdown statistics (Admin only)
 *     tags: [Countdown Timers]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/stats",
  verifyToken,
  authorizeRoles("ADMIN"),
  countdownController.getStats
);

/**
 * @swagger
 * /countdown/{id}:
 *   get:
 *     summary: Get countdown by ID
 *     tags: [Countdown Timers]
 */
router.get("/:id", countdownController.getCountdownById);

/* ===========================
   ✏️ PATCH ROUTES
=========================== */

/**
 * @swagger
 * /countdown/{id}:
 *   patch:
 *     summary: Update countdown timer (Admin only)
 *     tags: [Countdown Timers]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  countdownController.updateCountdown
);

/**
 * @swagger
 * /countdown/{id}/toggle:
 *   patch:
 *     summary: Toggle countdown status (Admin only)
 *     tags: [Countdown Timers]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/toggle",
  verifyToken,
  authorizeRoles("ADMIN"),
  countdownController.toggleCountdownStatus
);

/* ===========================
   ❌ DELETE ROUTES
=========================== */

/**
 * @swagger
 * /countdown/{id}:
 *   delete:
 *     summary: Delete countdown timer (Admin only)
 *     tags: [Countdown Timers]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  countdownController.deleteCountdown
);

export const CountdownRoutes = router;