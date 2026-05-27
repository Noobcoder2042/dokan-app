/**
 * Centralized Logging & Telemetry Manager
 * Enforces compliance error-handling guidelines:
 * 1. Logs full context server-side (timestamp, user ID, route, sanitized input).
 * 2. Translates internal exceptions and returns generic client-safe messages.
 * 3. Maps correct semantic HTTP status codes (400/403/429 for 4xx, 500/503 for 5xx).
 * 4. Interfaces with telemetry services (e.g. Sentry / Datadog).
 */

// Simulated telemetry hooks (Easy drop-in for Sentry.init / Sentry.captureException)
const captureProductionTelemetry = (error, context = {}) => {
  if (typeof window !== "undefined" && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
};

/**
 * Standard Server-Side Context Logger
 * Logs full diagnostic context safely without leaking details to frontends.
 */
export const logInternalException = (error, reqContext = {}) => {
  const logPayload = {
    timestamp: new Date().toISOString(),
    message: error.message || "Unknown error",
    stack: error.stack || "No stack trace available",
    userId: reqContext.userId || reqContext.uid || "UNAUTHENTICATED",
    route: reqContext.route || reqContext.url || "UNKNOWN_ROUTE",
    // Ensure all inputs are sanitized to avoid logging sensitive user credentials
    sanitizedInput: reqContext.sanitizedInput 
      ? JSON.parse(JSON.stringify(reqContext.sanitizedInput)) 
      : null
  };

  // Secure server-side audit trail log
  console.error("[SECURE TELEMETRY METRIC]", JSON.stringify(logPayload, null, 2));

  // Forward to Sentry/Datadog
  captureProductionTelemetry(error, logPayload);
};

/**
 * Global HTTP / Semantic Exception Mapper
 * Translates raw exceptions into user-safe generic feedback payloads with correct status codes.
 */
export const formatClientResponseError = (error, reqContext = {}) => {
  // First, capture and audit full context server-side
  logInternalException(error, reqContext);

  // Default fallback payload (Safe for clients)
  const clientResponse = {
    success: false,
    status: 500, // Internal Server Error
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again later."
  };

  // 1. Client-Side Input Validation Failures (Strictly 400 Bad Request)
  if (error.name === "ValidationError" || error.code === "VALIDATION_FAILED") {
    clientResponse.status = 400;
    clientResponse.code = "BAD_REQUEST";
    clientResponse.message = error.message || "Invalid request parameters. Please verify input fields.";
  }

  // 2. Client Authentication Credentials Failures (Strictly 401 Unauthorized)
  else if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "UNAUTHORIZED") {
    clientResponse.status = 401;
    clientResponse.code = "UNAUTHORIZED";
    clientResponse.message = "Incorrect username or password. Access Denied.";
  }

  // 3. Client Resource Permission Denied (Strictly 403 Forbidden)
  else if (error.code === "permission-denied" || error.code === "FORBIDDEN") {
    clientResponse.status = 403;
    clientResponse.code = "FORBIDDEN";
    clientResponse.message = "Access Denied: You do not possess clearance for this database resource.";
  }

  // 4. Client Request Rate Limit Exceeded (Strictly 429 Too Many Requests)
  else if (error.code === "rate-limit-exceeded" || error.status === 429 || error.code === "TOO_MANY_REQUESTS") {
    clientResponse.status = 429;
    clientResponse.code = "TOO_MANY_REQUESTS";
    clientResponse.message = error.message || "Rate limit exceeded. Please wait before trying again.";
  }

  // 5. Database Service Interruption (Strictly 503 Service Unavailable)
  else if (error.code === "unavailable" || error.code === "deadline-exceeded" || error.code === "SERVICE_UNAVAILABLE") {
    clientResponse.status = 503;
    clientResponse.code = "SERVICE_UNAVAILABLE";
    clientResponse.message = "The service is temporarily unavailable. Checking POS connectivity.";
  }

  return clientResponse;
};
