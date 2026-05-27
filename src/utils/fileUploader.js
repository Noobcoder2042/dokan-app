/**
 * Secure File Upload Utility
 * Enforces compliance metrics:
 * 1. Validates MIME type and extension before upload.
 * 2. Enforces strict 5MB image size limit.
 * 3. Renames uploaded assets to unique UUIDs to prevent directory traversals.
 */

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../Firebase/firebase";

// Allowed Whitelist Maps
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Cryptographically secure UUID generator
const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback high-entropy random string if crypto.randomUUID is unavailable
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Securely uploads an image to Firebase Cloud Storage.
 * 
 * @param {File} file Raw browser file object
 * @param {string} shopId Active shop tenant ID
 * @param {function} onProgress Callback for upload percentage tracking
 * @returns {Promise<string>} Download URL of the uploaded, renamed asset
 */
export const secureUploadInventoryImage = async (file, shopId, onProgress = () => {}) => {
  if (!file) throw new Error("No file selected for upload.");
  if (!shopId) throw new Error("Clear tenant shop context required for storage allocation.");

  // 1. Enforce strict size check (5MB image cap)
  const maxSizeInBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    throw new Error("File size limit exceeded. Maximum allowed size is 5MB.");
  }

  // 2. Validate MIME type explicitly
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.");
  }

  // 3. Validate file extension explicitly
  const fileExt = file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    throw new Error("Invalid file extension. Only .jpg, .jpeg, .png, .webp, and .gif are whitelisted.");
  }

  // 4. Generate unique UUID filename (Never trust client filename inputs)
  const secureFilename = `${generateUUID()}.${fileExt}`;
  const storagePath = `shops/${shopId}/inventory/${secureFilename}`;
  const storageRef = ref(storage, storagePath);

  // 5. Build strict metadata headers
  const metadata = {
    contentType: file.type,
    customMetadata: {
      originalName: file.name.replace(/[^a-zA-Z0-9.-]/g, "_"), // Sanitize original name metadata
      uploadedBy: shopId,
      uploadedAt: new Date().toISOString()
    }
  };

  // 6. Execute Upload Task
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress));
      },
      (error) => {
        console.error("[STORAGE EXCEPTION] Secure upload failed:", error);
        reject(new Error("An error occurred during file transfer. Please try again."));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (urlError) {
          reject(new Error("Failed to retrieve secure asset url."));
        }
      }
    );
  });
};
