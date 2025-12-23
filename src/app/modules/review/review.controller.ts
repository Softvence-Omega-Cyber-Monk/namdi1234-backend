// src/modules/reviews/review.controller.ts
import { Request, Response, NextFunction } from 'express';
import reviewService from './review.service';

class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id; // from auth middleware
      const reviewData = {
        ...req.body,
        user: userId,
      };
      const review = await reviewService.createReview(reviewData);
      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewService.getReviews(req.query);
      res.status(200).json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: result.reviews,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Review retrieved successfully',
        data: review 
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.updateReview(req.params.id, req.body);
      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Review updated successfully', 
        data: review 
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.deleteReview(req.params.id);
      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Review deleted successfully' 
      });
    } catch (error) {
      next(error);
    }
  }

  async upvoteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.upvoteReview(req.params.id);
      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Review upvoted successfully', 
        data: review 
      });
    } catch (error) {
      next(error);
    }
  }

  async downvoteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.downvoteReview(req.params.id);
      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review downvoted successfully' 
        });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Downvoted successfully', 
        data: review 
      });
    } catch (error) {
      next(error);
    }
  }

  async addReply(req: Request, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      const userId = (req as any).user.id; // from auth middleware
      const review = await reviewService.addReply(req.params.id, userId, text);
      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found' 
        });
      }
      res.status(201).json({ 
        success: true, 
        message: 'Reply added successfully', 
        data: review 
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();