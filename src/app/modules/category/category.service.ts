import { Category } from "./category.model";
import { ICategory } from "./category.interface";
import { cloudinary } from "../../config/cloudinary.config";
import fs from "fs";

export const CategoryService = {
  async createCategory(categoryName: string, filePath: string): Promise<ICategory> {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "categories",
    });

    // delete file from local after upload
    fs.unlinkSync(filePath);

    return Category.create({
      categoryName,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
    });
  },

  async getAllCategories(): Promise<ICategory[]> {
    return Category.find();
  },

  async getCategoryById(id: string): Promise<ICategory | null> {
    return Category.findById(id);
  },

  async updateCategory(id: string, categoryName?: string, filePath?: string): Promise<ICategory | null> {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");

    if (filePath) {
      // delete old image from cloudinary
      await cloudinary.uploader.destroy(category.cloudinaryId);

      // upload new image
      const result = await cloudinary.uploader.upload(filePath, { folder: "categories" });
      fs.unlinkSync(filePath);

      category.imageUrl = result.secure_url;
      category.cloudinaryId = result.public_id;
    }

    if (categoryName) category.categoryName = categoryName;

    await category.save();
    return category;
  },

  async deleteCategory(id: string): Promise<void> {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");

    await cloudinary.uploader.destroy(category.cloudinaryId);
    await Category.findByIdAndDelete(id);
  },
};
