import { Request, Response } from "express";
import { CategoryService } from "./category.service";

export const CategoryController = {
  async createCategory(req: Request, res: Response) {
    try {
      const { categoryName } = req.body;
      const file = req.file;
      if (!file) return res.status(400).json({ success: false, message: "Image is required" });

      const category = await CategoryService.createCategory(categoryName, file.path);
      res.status(201).json({ success: true, message: "Category created successfully", data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAllCategories(req: Request, res: Response) {
    const categories = await CategoryService.getAllCategories();
    res.json({ success: true, data: categories });
  },

  async getCategoryById(req: Request, res: Response) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      if (!category) return res.status(404).json({ success: false, message: "Category not found" });
      res.json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const { categoryName } = req.body;
      const file = req.file;
      const category = await CategoryService.updateCategory(req.params.id, categoryName, file?.path);
      res.json({ success: true, message: "Category updated successfully", data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      await CategoryService.deleteCategory(req.params.id);
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
