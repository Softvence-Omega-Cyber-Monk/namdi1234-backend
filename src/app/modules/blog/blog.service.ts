import { IBlog } from "./blog.interface";
import { BlogModel } from "./blog.model";

class BlogService {
  // Create a new blog
  async createBlog(data: Partial<IBlog>): Promise<IBlog> {
    const blog = await BlogModel.create(data);
    return blog;
  }

  // Get all blogs (admin)
  async getAllBlogs(): Promise<IBlog[]> {
    return BlogModel.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get published blogs (public)
  async getPublishedBlogs({
    category,
    search,
    page,
    limit,
  }: {
    category?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const query: any = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
        { excerpt: { $regex: regex } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      BlogModel.find(query)
        .populate("author", "name email")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      BlogModel.countDocuments(query),
    ]);

    return {
      data,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    };
  }

  // Get blog by ID
  async getBlogById(id: string): Promise<IBlog | null> {
    return BlogModel.findById(id).populate("author", "name email").exec();
  }

  // Get blog by slug
  async getBlogBySlug(slug: string): Promise<IBlog | null> {
    return BlogModel.findOne({ slug }).populate("author", "name email").exec();
  }

  // Update blog
  async updateBlog(id: string, data: Partial<IBlog>): Promise<IBlog | null> {
    return BlogModel.findByIdAndUpdate(id, data, { new: true })
      .populate("author", "name email")
      .exec();
  }

  // Delete blog
  async deleteBlog(id: string): Promise<void> {
    await BlogModel.findByIdAndDelete(id).exec();
  }

  // Publish blog
  async publishBlog(id: string): Promise<IBlog | null> {
    return BlogModel.findByIdAndUpdate(
      id,
      {
        status: "published",
        isPublished: true,
        publishedAt: new Date(),
      },
      { new: true }
    )
      .populate("author", "name email")
      .exec();
  }

  // Unpublish blog
  async unpublishBlog(id: string): Promise<IBlog | null> {
    return BlogModel.findByIdAndUpdate(
      id,
      {
        status: "draft",
        isPublished: false,
      },
      { new: true }
    )
      .populate("author", "name email")
      .exec();
  }

  // Increment views
  async incrementViews(id: string): Promise<void> {
    await BlogModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
  }

  // Get blogs by author
  async getBlogsByAuthor(authorId: string): Promise<IBlog[]> {
    return BlogModel.find({ author: authorId })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    const categories = await BlogModel.distinct("category").exec();
    return categories;
  }
}

export const blogService = new BlogService();