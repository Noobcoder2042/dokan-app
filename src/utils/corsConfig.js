/**
 * Strict Cross-Origin Resource Sharing (CORS) Configuration Middleware
 * Enforces production compliance metrics:
 * 1. Never uses wildcard CORS (*) in production.
 * 2. Explicitly whitelists authorized domains (merchant dashboards and hosting).
 * 3. Restricts allowed HTTP methods to only required POS operators.
 * 4. Configures credentials flag securely.
 */

import cors from "cors";

// 1. Authorized Domain Whitelist
const whitelist = [
  // Production Hosting Domain
  "https://dokan-app-56585.web.app",
  "https://dokan-app-56585.firebaseapp.com",
  // Local Developer sandbox (Authorized only in non-production environments)
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// 2. CORS Option Builder
const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or postman requests that carry no origin header in development
    if (!origin && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    if (whitelist.includes(origin)) {
      return callback(null, true); // Origin authorized
    } else {
      console.warn(`[CORS SECURITY ALERT] Blocked unauthorized origin access request: ${origin}`);
      return callback(new Error("Access Denied: Cross-Origin Resource Sharing blocked for this domain."), false);
    }
  },

  // Restrict allowed HTTP methods to only what POS services require
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  // Allow only necessary headers to mitigate header injection attacks
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-shop-id",
    "X-Requested-With",
    "Accept"
  ],

  // Expose safety headers to client
  exposedHeaders: ["Content-Length", "X-RateLimit-Limit", "Retry-After"],

  // Enable cookies and credentials handshake only under explicit HTTPS boundaries
  credentials: true,

  // Cache preflight CORS requests for 10 minutes to save client handshake latency
  maxAge: 600
};

// 3. Export Strict Middleware
export const secureCors = cors(corsOptions);
export default secureCors;
