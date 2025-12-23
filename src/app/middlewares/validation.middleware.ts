import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export class ValidationMiddleware {
  static validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
      return;
    }

    next();
  };
}