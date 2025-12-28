// src/app/modules/testimonial/testimonial.routes.ts
import { Router } from "express";
import { testimonialController } from "./testimonial.controller";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Testimonials & Marquee
 *   description: Manage customer testimonials and marquee text
 */

/* ===========================
   TESTIMONIAL ROUTES
=========================== */

router.post(
  "/testimonials",
  verifyToken,
  authorizeRoles("ADMIN"),
  testimonialController.createTestimonial
);

router.get("/testimonials/admin", verifyToken, authorizeRoles("ADMIN"), testimonialController.getAllTestimonials);
router.get("/testimonials/active", testimonialController.getActiveTestimonials);

router.get("/testimonials/:id", testimonialController.getTestimonialById);

router.patch(
  "/testimonials/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  testimonialController.updateTestimonial
);

router.patch(
  "/testimonials/:id/toggle",
  verifyToken,
  authorizeRoles("ADMIN"),
  testimonialController.toggleTestimonialStatus
);

router.delete(
  "/testimonials/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  testimonialController.deleteTestimonial
);

/* ===========================
   MARQUEE ROUTES
=========================== */

router.post(
  "/marquee",
  verifyToken,
  authorizeRoles("ADMIN"),
  testimonialController.createOrUpdateMarquee
);

router.get("/marquee", testimonialController.getMarquee); // Public

router.get("/marquee/admin", verifyToken, authorizeRoles("ADMIN"), testimonialController.getMarqueeAdmin);

export const TestimonialRoutes = router;