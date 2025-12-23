// src/middleware/csp.middleware.ts

import { Request, Response, NextFunction } from 'express';

/**
 * CSP Middleware to allow Mastercard Gateway iframe embedding
 * This fixes the "frame-ancestors 'self'" CSP error
 */
export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set CSP headers to allow Mastercard iframe
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "frame-src 'self' https://afs.gateway.mastercard.com https://ap.gateway.mastercard.com https://test-gateway.mastercard.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://afs.gateway.mastercard.com https://ap.gateway.mastercard.com",
      "style-src 'self' 'unsafe-inline' https://afs.gateway.mastercard.com https://ap.gateway.mastercard.com",
      "img-src 'self' data: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' https://afs.gateway.mastercard.com https://ap.gateway.mastercard.com",
      "frame-ancestors 'self'"
    ].join('; ')
  );

  // Additional security headers
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
};

/**
 * CORS Middleware for payment gateway
 */
export const paymentCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://afs.gateway.mastercard.com',
    'https://ap.gateway.mastercard.com',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};