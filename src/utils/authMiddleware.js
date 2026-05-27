/**
 * Identity & Permission Verification Middleware
 * Enforces compliance auth metrics:
 * 1. Verifies JWT (Firebase ID token) on every request.
 * 2. Checks explicit roles/permissions on admin routes & sensitive operations.
 * 3. Enforces tenant boundaries (UID must match the requested shop).
 * 4. Implements account lockout trackers for brute-force prevention.
 */

import admin from "firebase-admin";

// Initialize Firebase Admin SDK (Expects private service credentials loaded in env)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (error) {
    console.warn("Firebase Admin SDK credentials not loaded in local environment. Running in sandbox mode.");
  }
}

// 1. JWT ID Token and Identity Verifier
export const verifyIdentity = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication token missing. Access Denied."
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Decodes the Firebase JWT (Verified on Google Serverless Keys with 1-hour short expiry)
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Populate request context with authenticated user token data
    
    // Check if account is flagged as locked
    const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();
    if (userDoc.exists && userDoc.data().isLocked) {
      return res.status(403).json({
        success: false,
        error: "Your merchant account is locked due to repeated failed login attempts. Contact support."
      });
    }

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication credentials.",
      details: error.message
    });
  }
};

// 2. Strict Tenant Boundary Checker (Verifies user permission to access shop database resources)
export const verifyTenantPermission = (req, res, next) => {
  const requestedShopId = req.headers["x-shop-id"] || req.query.shopId || req.body.shopId;
  
  if (!requestedShopId) {
    return res.status(400).json({
      success: false,
      error: "Target Shop Tenant ID must be provided to complete database operations."
    });
  }

  // Ensure user can access ONLY their own shop profile
  if (req.user.shopId !== requestedShopId && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Permission Denied: You do not possess clearance for this shop's datasets."
    });
  }

  return next();
};

// 3. Admin & Role Permissions Checker
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Access Denied: Exclusive permissions are required to perform this administrative task."
      });
    }
    return next();
  };
};

// 4. Failed Attempt Account Lockout Tracker
// Targets credential failure increments inside Firestore to enforce lockout after 5 attempts
export const trackFailedLogin = async (uid) => {
  const userRef = admin.firestore().collection("users").doc(uid);
  
  await admin.firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const currentFailures = (userData.failedLoginAttempts || 0) + 1;

    if (currentFailures >= 5) {
      transaction.update(userRef, {
        failedLoginAttempts: currentFailures,
        isLocked: true,
        lockedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      transaction.update(userRef, {
        failedLoginAttempts: currentFailures
      });
    }
  });
};
