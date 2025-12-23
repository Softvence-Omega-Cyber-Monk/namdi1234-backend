// src/modules/reviews/review.service.ts
import { Review } from "./review.model";
import { ICreateReview, IUpdateReview, IReviewQuery } from "./review.interface";
import { ProductModel } from "../products/product.model";

class ReviewService {
  async createReview(data: ICreateReview) {
    // 1. Validate product exists
    const product = await ProductModel.findById(data.product);
    if (!product) {
      throw new Error("Product not found");
    }

    // 2. Create the review
    const newReview = await Review.create(data);

    // 3. Recalculate average rating for the product
    const reviews = await Review.find({ product: data.product }).select(
      "rating"
    );
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // 4. Update product's avgRating
    await ProductModel.findByIdAndUpdate(
      data.product,
      { avgRating: parseFloat(avgRating.toFixed(2)) },
      { new: true }
    );

    return newReview;
  }
  async getReviews(query: IReviewQuery) {
    const {
      product,
      user,
      rating,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const filter: any = {};
    if (product) filter.product = product;
    if (user) filter.user = user;
    if (rating) filter.rating = rating;

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email avatar")
        .populate("product", "name images")
        .populate("replies.user", "name avatar")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewById(id: string) {
    return await Review.findById(id)
      .populate("user", "name email avatar")
      .populate("product", "name images")
      .populate("replies.user", "name avatar");
  }

  async updateReview(id: string, data: IUpdateReview) {
    return await Review.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email avatar")
      .populate("product", "name images");
  }

  async deleteReview(id: string) {
    return await Review.findByIdAndDelete(id);
  }

  async upvoteReview(id: string) {
    return await Review.findByIdAndUpdate(
      id,
      { $inc: { upVotes: 1 } },
      { new: true }
    )
      .populate("user", "name email avatar")
      .populate("product", "name images");
  }

  async downvoteReview(id: string) {
    return await Review.findByIdAndUpdate(
      id,
      { $inc: { downVotes: 1 } },
      { new: true }
    )
      .populate("user", "name email avatar")
      .populate("product", "name images");
  }

  async addReply(id: string, userId: string, text: string) {
    return await Review.findByIdAndUpdate(
      id,
      {
        $push: {
          replies: { user: userId, text, createdAt: new Date() },
        },
      },
      { new: true }
    )
      .populate("user", "name avatar email")
      .populate("product", "name images")
      .populate("replies.user", "name avatar")
      .lean();
  }
}

export default new ReviewService();
