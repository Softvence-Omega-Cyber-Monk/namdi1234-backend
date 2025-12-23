import { Request, Response } from "express";
import { productService } from "./product.service";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";

class ProductController {
  // ✅ Create a new product with Cloudinary upload
  async createProduct(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageUrls: any = {};

      // Upload each file manually to Cloudinary
      if (files?.mainImage?.[0])
        imageUrls.mainImageUrl = await uploadToCloudinary(
          files.mainImage[0].path
        );
      if (files?.sideImage?.[0])
        imageUrls.sideImageUrl = await uploadToCloudinary(
          files.sideImage[0].path
        );
      if (files?.sideImage2?.[0])
        imageUrls.sideImage2Url = await uploadToCloudinary(
          files.sideImage2[0].path
        );
      if (files?.lastImage?.[0])
        imageUrls.lastImageUrl = await uploadToCloudinary(
          files.lastImage[0].path
        );
      if (files?.video?.[0])
        imageUrls.videoUrl = await uploadToCloudinary(files.video[0].path);

      // Merge form data with Cloudinary URLs
      const productData = {
        ...req.body,
        ...imageUrls,
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

  // ✅ Create multiple products (bulk)
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

  // ✅ Get all products
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
      const limit = Math.min(
        parseInt(req.query.limit as string, 10) || 10,
        100
      );

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
  // ✅ Get product by ID
  async getProductById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      res.json({ success: true, data: product });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ✅ Update product (re-upload changed files)
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageUrls: any = {};

      // Upload updated files to Cloudinary (if provided)
      if (files?.mainImage?.[0])
        imageUrls.mainImageUrl = await uploadToCloudinary(
          files.mainImage[0].path
        );
      if (files?.sideImage?.[0])
        imageUrls.sideImageUrl = await uploadToCloudinary(
          files.sideImage[0].path
        );
      if (files?.sideImage2?.[0])
        imageUrls.sideImage2Url = await uploadToCloudinary(
          files.sideImage2[0].path
        );
      if (files?.lastImage?.[0])
        imageUrls.lastImageUrl = await uploadToCloudinary(
          files.lastImage[0].path
        );
      if (files?.video?.[0])
        imageUrls.videoUrl = await uploadToCloudinary(files.video[0].path);

      const updateData = {
        ...req.body,
        ...imageUrls,
      };

      const updated = await productService.updateProduct(id, updateData);
      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

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

  // ✅ Delete product
  async deleteProduct(req: Request, res: Response) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // ✅ Get all products created by a specific user
  async getProductsByUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const products = await productService.getProductsByUser(userId);
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ✅ Get single product with seller details populated
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

  // ✅ Get all products with seller details
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
}

export const productController = new ProductController();
