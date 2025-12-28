import { Router } from "express";
import { sliderBannerController } from "./sliderBanner.controller";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";
import { sliderImagesUpload, bannerImageUpload } from "../../middlewares/multerUpload";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sliders & Banners
 *   description: Slider and Banner management APIs
 */

/* ===========================
   🎠 SLIDER ROUTES
=========================== */

// POST - Create slider (multiple images)
router.post(
  "/sliders",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderImagesUpload,
  sliderBannerController.createSlider
);

// GET - Get all sliders (admin only)
router.get(
  "/sliders/admin",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderBannerController.getAllSliders
);

// GET - Get active sliders (public)
router.get("/sliders/active", sliderBannerController.getActiveSliders);

// GET - Get sliders by location (public)
router.get("/sliders/location/:location", sliderBannerController.getSlidersByLocation);

// GET - Get slider by ID (public)
router.get("/sliders/:id", sliderBannerController.getSliderById);

// PATCH - Update slider (multiple images allowed)
router.patch(
  "/sliders/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderImagesUpload,
  sliderBannerController.updateSlider
);

// PATCH - Toggle slider status
router.patch(
  "/sliders/:id/toggle",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderBannerController.toggleSliderStatus
);

// PATCH - Update slider order
router.patch(
  "/sliders/:id/order",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderBannerController.updateSliderOrder
);

// DELETE - Delete slider
router.delete(
  "/sliders/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderBannerController.deleteSlider
);

/* ===========================
   🎯 BANNER ROUTES
=========================== */

// POST - Create banner (single image)
router.post(
  "/banners",
  verifyToken,
  authorizeRoles("ADMIN"),
  bannerImageUpload,
  sliderBannerController.createBanner
);

// GET - Get all banners (admin only)
router.get(
  "/banners/admin",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderBannerController.getAllBanners
);

// GET - Get active banners (public)
router.get("/banners/active", sliderBannerController.getActiveBanners);

// GET - Get banners by position (public)
router.get("/banners/position/:position", sliderBannerController.getBannersByPosition);

// GET - Get banners by location (public)
router.get("/banners/location/:location", sliderBannerController.getBannersByLocation);

// GET - Get banner by ID (public)
router.get("/banners/:id", sliderBannerController.getBannerById);

// PATCH - Update banner (single image)
router.patch(
  "/banners/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  bannerImageUpload,
  sliderBannerController.updateBanner
);

// PATCH - Toggle banner status
router.patch(
  "/banners/:id/toggle",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderBannerController.toggleBannerStatus
);

// PATCH - Update banner order
router.patch(
  "/banners/:id/order",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderBannerController.updateBannerOrder
);

// DELETE - Delete banner
router.delete(
  "/banners/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  sliderBannerController.deleteBanner
);

export const SliderBannerRoutes = router;