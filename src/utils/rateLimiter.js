/**
 * Rate Limiting Middleware for Dokan Pro SaaS Backend Endpoints
 * Enforces strict compliance metrics for API, Auth, and AI routes.
 * 
 * Requirements:
 * - Auth endpoints: 5 requests per 15 mins per IP
 * - General API: 60 requests per min per IP
 * - AI and LLM endpoints: 10 requests per min per authenticated user
 */

import rateLimit from "express-rate-limit";

// Helper handler to dynamically inject Retry-After headers
const handleRateLimitError = (customMessage, windowMs) => {
  return (req, res, next, options) => {
    const retrySeconds = Math.ceil(windowMs / 1000);
    res.setHeader("Retry-After", retrySeconds);
    res.status(429).json({
      success: false,
      status: 429,
      error: customMessage,
      retryAfter: retrySeconds
    });
  };
};

// 1. Auth Endpoint Rate Limiter (brute-force defense)
// Targets: /api/auth/login, /api/auth/register, /api/auth/reset-password
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  handler: handleRateLimitError("Too many authentication attempts. Please try again after 15 minutes.", 15 * 60 * 1000),
  standardHeaders: true, // Return standard rate limit info in headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

// 2. General API Rate Limiter (DoS/Spam defense)
// Targets: /api/inventory, /api/bills, /api/customers
export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  handler: handleRateLimitError("Rate limit exceeded. General API requests are restricted to 60 per minute.", 1 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

// 3. AI and LLM Proxy Rate Limiter (Billing exploitation defense)
// Targets: /api/ai/insights, /api/ai/forecasts
export const aiProxyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each user to 10 requests per minute
  handler: handleRateLimitError("AI computational request limit reached. restricted to 10 requests per minute per user.", 1 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user.uid) {
      return req.user.uid;
    }
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

// 4. File Uploads Rate Limiter (Malicious asset-upload flooding defense)
// Targets: /api/storage/upload, /api/merchant/logo
export const uploadRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute
  handler: handleRateLimitError("Too many file upload requests. Uploads are restricted to 5 requests per minute.", 1 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

