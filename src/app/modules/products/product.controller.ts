import { Request, Response } from "express";
import { productService } from "./product.service";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";

class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageUrls: any = {};

      // Upload each file manually to Cloudinary
      if (files?.mainImage?.[0])
        imageUrls.mainImageUrl = await uploadToCloudinary(files.mainImage[0].path);
      if (files?.sideImage?.[0])
        imageUrls.sideImageUrl = await uploadToCloudinary(files.sideImage[0].path);
      if (files?.sideImage2?.[0])
        imageUrls.sideImage2Url = await uploadToCloudinary(files.sideImage2[0].path);
      if (files?.lastImage?.[0])
        imageUrls.lastImageUrl = await uploadToCloudinary(files.lastImage[0].path);
      if (files?.video?.[0])
        imageUrls.videoUrl = await uploadToCloudinary(files.video[0].path);

      // Parse variations if they exist
      let variations = [];
      if (req.body.variations) {
        try {
          variations = JSON.parse(req.body.variations);
        } catch (e) {
          variations = req.body.variations;
        }
      }

      // Merge form data with Cloudinary URLs
      const productData = {
        ...req.body,
        ...imageUrls,
        variations,
        hasVariations: req.body.hasVariations === 'true' || req.body.hasVariations === true,
        userId,
      };

      const product = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (err: any) {
      console.error("Create Product Error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async createBulkProducts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const products = req.body.map((p: any) => ({ ...p, userId }));
      const inserted = await productService.createBulkProducts(products);
      res.status(201).json({ success: true, data: inserted });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async searchProducts(req: Request, res: Response) {
    try {
      const { productCategory, search } = req.query;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 100);

      const result = await productService.searchProducts({
        productCategory: productCategory as string | undefined,
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
      console.error("Failed to search products:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product)
        return res.status(404).json({ success: false, message: "Product not found" });
      res.json({ success: true, data: product });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageUrls: any = {};

      // Upload updated files to Cloudinary (if provided)
      if (files?.mainImage?.[0])
        imageUrls.mainImageUrl = await uploadToCloudinary(files.mainImage[0].path);
      if (files?.sideImage?.[0])
        imageUrls.sideImageUrl = await uploadToCloudinary(files.sideImage[0].path);
      if (files?.sideImage2?.[0])
        imageUrls.sideImage2Url = await uploadToCloudinary(files.sideImage2[0].path);
      if (files?.lastImage?.[0])
        imageUrls.lastImageUrl = await uploadToCloudinary(files.lastImage[0].path);
      if (files?.video?.[0])
        imageUrls.videoUrl = await uploadToCloudinary(files.video[0].path);

      // Parse variations if they exist
      let variations = undefined;
      if (req.body.variations) {
        try {
          variations = JSON.parse(req.body.variations);
        } catch (e) {
          variations = req.body.variations;
        }
      }

      const updateData = {
        ...req.body,
        ...imageUrls,
        ...(variations !== undefined && { variations }),
        ...(req.body.hasVariations !== undefined && {
          hasVariations: req.body.hasVariations === 'true' || req.body.hasVariations === true
        })
      };

      const updated = await productService.updateProduct(id, updateData);
      if (!updated)
        return res.status(404).json({ success: false, message: "Product not found" });

      res.json({
        success: true,
        message: "Product updated successfully",
        data: updated,
      });
    } catch (err: any) {
      console.error("Update Product Error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getProductsByUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const products = await productService.getProductsByUser(userId);
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getProductWithSellerName(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductWithSellerName(id);
      res.json({
        success: true,
        message: "Product with seller details fetched successfully",
        data: product,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAllProductsWithSellerName(req: Request, res: Response) {
    try {
      const products = await productService.getAllProductsWithSellerName();
      res.json({
        success: true,
        message: "All products with seller details fetched successfully",
        data: products,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
  async toggleProductMark(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { markType, value } = req.body;

      const validMarkTypes = ['isInCatalogueList', 'isExclusive', 'isFeatured', 'isInWeekendDeals'];
      if (!validMarkTypes.includes(markType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mark type. Must be one of: isInCatalogueList, isExclusive, isFeatured, isInWeekendDeals"
        });
      }

      const product = await productService.toggleProductMark(id, markType, value);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.json({
        success: true,
        message: `Product ${markType} updated successfully`,
        data: product,
      });
    } catch (err: any) {
      console.error("Toggle Product Mark Error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getProductsByMark(req: Request, res: Response) {
    try {
      const { markType } = req.params;

      const validMarkTypes = ['isInCatalogueList', 'isExclusive', 'isFeatured', 'isInWeekendDeals'];
      if (!validMarkTypes.includes(markType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mark type. Must be one of: isInCatalogueList, isExclusive, isFeatured, isInWeekendDeals"
        });
      }

      const products = await productService.getProductsByMark(markType as any);
      res.json({
        success: true,
        message: `Products with ${markType} fetched successfully`,
        data: products,
      });
    } catch (err: any) {
      console.error("Get Products By Mark Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
  async bulkToggleProductMarks(req: Request, res: Response) {
    try {
      const { productIds, markType, value } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "productIds must be a non-empty array"
        });
      }

      const validMarkTypes = ['isInCatalogueList', 'isExclusive', 'isFeatured', 'isInWeekendDeals'];
      if (!validMarkTypes.includes(markType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mark type. Must be one of: isInCatalogueList, isExclusive, isFeatured, isInWeekendDeals"
        });
      }

      const result = await productService.bulkToggleProductMarks(productIds, markType, value);
      res.json({
        success: true,
        message: `${result.modifiedCount} products updated successfully`,
        data: result,
      });
    } catch (err: any) {
      console.error("Bulk Toggle Product Marks Error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const productController = new ProductController();