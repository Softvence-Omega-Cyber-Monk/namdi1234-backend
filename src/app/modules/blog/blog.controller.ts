import { Request, Response } from "express";
import { blogService } from "./blog.service";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";

class BlogController {
  // Create blog
  async createBlog(req: Request, res: Response) {
    try {
      const authorId = (req as any).user.id;
      const file = req.file as Express.Multer.File;

      let featuredImage = undefined;
      if (file) {
        featuredImage = await uploadToCloudinary(file.path);
      }

      // Generate slug from title
      const slug = req.body.slug || req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Parse tags if they exist
      let tags = [];
      if (req.body.tags) {
        try {
          tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        } catch (e) {
          tags = req.body.tags;
        }
      }

      const blogData = {
        ...req.body,
        slug,
        tags,
        author: authorId,
        ...(featuredImage && { featuredImage }),
      };

      const blog = await blogService.createBlog(blogData);

      res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blog,
      });
    } catch (err: any) {
      console.error("Create Blog Error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Get all blogs (admin)
  async getAllBlogs(req: Request, res: Response) {
    try {
      const blogs = await blogService.getAllBlogs();
      res.json({ success: true, data: blogs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get published blogs (public)
  async getPublishedBlogs(req: Request, res: Response) {
    try {
      const { category, search } = req.query;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 100);

      const result = await blogService.getPublishedBlogs({
        category: category as string | undefined,
        search: search as string | undefined,
        page,
        limit,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get blog by ID
  async getBlogById(req: Request, res: Response) {
    try {
      const blog = await blogService.getBlogById(req.params.id);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      res.json({ success: true, data: blog });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get blog by slug
  async getBlogBySlug(req: Request, res: Response) {
    try {
      const blog = await blogService.getBlogBySlug(req.params.slug);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }

      // Increment views
      await blogService.incrementViews((blog as any)._id.toString());

      res.json({ success: true, data: blog });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Update blog
  async updateBlog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const file = req.file as Express.Multer.File;

      let featuredImage = undefined;
      if (file) {
        featuredImage = await uploadToCloudinary(file.path);
      }

      // Parse tags if they exist
      let tags = undefined;
      if (req.body.tags) {
        try {
          tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        } catch (e) {
          tags = req.body.tags;
        }
      }

      const updateData = {
        ...req.body,
        ...(featuredImage && { featuredImage }),
        ...(tags !== undefined && { tags }),
      };

      const blog = await blogService.updateBlog(id, updateData);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }

      res.json({
        success: true,
        message: "Blog updated successfully",
        data: blog,
      });
    } catch (err: any) {
      console.error("Update Blog Error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Delete blog
  async deleteBlog(req: Request, res: Response) {
    try {
      await blogService.deleteBlog(req.params.id);
      res.json({ success: true, message: "Blog deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Publish blog
  async publishBlog(req: Request, res: Response) {
    try {
      const blog = await blogService.publishBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      res.json({
        success: true,
        message: "Blog published successfully",
        data: blog,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Unpublish blog
  async unpublishBlog(req: Request, res: Response) {
    try {
      const blog = await blogService.unpublishBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      res.json({
        success: true,
        message: "Blog unpublished successfully",
        data: blog,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Get blogs by author
  async getBlogsByAuthor(req: Request, res: Response) {
    try {
      const authorId = (req as any).user.id;
      const blogs = await blogService.getBlogsByAuthor(authorId);
      res.json({ success: true, data: blogs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get categories
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await blogService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const blogController = new BlogController();