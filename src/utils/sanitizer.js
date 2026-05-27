/**
 * Database Write Sanitization & Safe Error Boundary Utility
 * Enforces strict compliance metrics:
 * 1. Sanitizes inputs of potential HTML/script XSS vectors before writing.
 * 2. Validates types and numerical invariants (e.g. non-negative pricing).
 * 3. Catches and translates raw database errors into generic user-safe payloads.
 */

// 1. Core Input Sanitizer (XSS Mitigation)
export const sanitizeText = (input) => {
  if (typeof input !== "string") return input;
  
  return input
    .trim()
    // Strip malicious tags to prevent Stored XSS inside invoices/customer files
    .replace(/<[^>]*>?/gm, "")
    // Escape specific HTML characters for safety
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// 2. Strict Billing & Inventory Invariant Validator
export const validateInvoiceWrite = (billData) => {
  const errors = [];

  // Validate numeric fields (tampering prevention)
  const totalAmount = Number(billData.totalAmount || 0);
  const paidAmount = Number(billData.paidAmount || 0);
  const dueAmount = Number(billData.dueAmount || 0);

  if (Number.isNaN(totalAmount) || totalAmount < 0) {
    errors.push("Invalid invoice Total Amount: must be a positive number.");
  }
  if (Number.isNaN(paidAmount) || paidAmount < 0) {
    errors.push("Invalid Paid Amount: must be a positive number.");
  }
  if (Number.isNaN(dueAmount) || dueAmount < 0) {
    errors.push("Invalid Outstanding Due Amount: must be a positive number.");
  }

  // Check mathematical consistency
  if (Math.abs(totalAmount - (paidAmount + dueAmount)) > 0.01) {
    errors.push("Invoice balance mismatch: Total must equal Paid + Due outstanding.");
  }

  // Validate items catalog
  if (!Array.isArray(billData.items) || billData.items.length === 0) {
    errors.push("An active invoice must contain at least one item.");
  } else {
    billData.items.forEach((item, index) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 0);
      if (Number.isNaN(price) || price <= 0) {
        errors.push(`Item at line ${index + 1} carries an invalid price.`);
      }
      if (Number.isNaN(qty) || qty <= 0) {
        errors.push(`Item at line ${index + 1} carries an invalid quantity.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 3. User Sanitized Output Mapper
export const sanitizeCustomerProfile = (profile) => {
  return {
    customerName: sanitizeText(profile.customerName || profile.name || ""),
    customerPhone: sanitizeText(profile.customerPhone || profile.phoneNumber || "").replace(/[^0-9+]/g, ""), // Numeric digits only
    customerAddress: sanitizeText(profile.customerAddress || profile.address || ""),
  };
};

// 4. Secure Database Error Boundary (Hides stack traces and collection metadata)
export const handleDatabaseError = (error, operationName = "database transaction") => {
  console.error(`[SECURE AUDIT PATH] Raw error during ${operationName}:`, error);

  // Return a completely sanitized generic feedback structure
  const response = {
    success: false,
    message: "A database error occurred while processing your request. Please try again.",
    code: "DB_TRANSACTION_FAILED"
  };

  // Inspect standard permission/connectivity issues without leaking collection schemes
  if (error.code === "permission-denied" || error.message?.includes("PERMISSION_DENIED")) {
    response.message = "Access Denied: You do not possess clearance for this database resource.";
    response.code = "PERMISSION_DENIED";
  } else if (error.code === "deadline-exceeded" || error.message?.includes("DEADLINE_EXCEEDED")) {
    response.message = "The request timed out. Please check your POS internet connection.";
    response.code = "TIMEOUT_EXCEEDED";
  }

  return response;
};
