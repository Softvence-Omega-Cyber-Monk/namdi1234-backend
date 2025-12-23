import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Check for token in cookies first, then fallback to Authorization header
  let token = req.cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader
    }
  }

  if (!token) {
    return res.status(403).json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET || "secretkey";
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
