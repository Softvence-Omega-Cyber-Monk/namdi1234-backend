import { Router } from "express";
import { blogController } from "./blog.controller";
import { verifyToken } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleAuth";
import { multerUpload } from "../../middlewares/multerUpload";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management APIs
 */

/* ===========================
   📝 POST ROUTES
=========================== */

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  multerUpload.single("featuredImage"),
  blogController.createBlog
);

/* ===========================
   🔍 GET ROUTES
=========================== */

/**
 * @swagger
 * /blogs/admin:
 *   get:
 *     summary: Get all blogs (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/admin",
  verifyToken,
  authorizeRoles("ADMIN"),
  blogController.getAllBlogs
);

/**
 * @swagger
 * /blogs/published:
 *   get:
 *     summary: Get published blogs (Public)
 *     tags: [Blogs]
 */
router.get("/published", blogController.getPublishedBlogs);

/**
 * @swagger
 * /blogs/categories:
 *   get:
 *     summary: Get all blog categories
 *     tags: [Blogs]
 */
router.get("/categories", blogController.getCategories);

/**
 * @swagger
 * /blogs/my:
 *   get:
 *     summary: Get blogs by logged-in author
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/my",
  verifyToken,
  authorizeRoles("ADMIN"),
  blogController.getBlogsByAuthor
);

/**
 * @swagger
 * /blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags: [Blogs]
 */
router.get("/slug/:slug", blogController.getBlogBySlug);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 */
router.get("/:id", blogController.getBlogById);

/* ===========================
   ✏️ PATCH ROUTES
=========================== */

/**
 * @swagger
 * /blogs/{id}:
 *   patch:
 *     summary: Update blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  multerUpload.single("featuredImage"),
  blogController.updateBlog
);

/**
 * @swagger
 * /blogs/{id}/publish:
 *   patch:
 *     summary: Publish blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/publish",
  verifyToken,
  authorizeRoles("ADMIN"),
  blogController.publishBlog
);

/**
 * @swagger
 * /blogs/{id}/unpublish:
 *   patch:
 *     summary: Unpublish blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/unpublish",
  verifyToken,
  authorizeRoles("ADMIN"),
  blogController.unpublishBlog
);

/* ===========================
   ❌ DELETE ROUTES
=========================== */

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  blogController.deleteBlog
);

export const BlogRoutes = router;