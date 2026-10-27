import { v2 as cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";
import { Readable } from "stream";

configDotenv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an in-memory buffer directly to Cloudinary using streams.
 *
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {Object} options - Cloudinary upload options (folder, resourceType, etc.)
 * @returns {Promise<Object>} Cloudinary upload response object
 */
export const uploadStreamToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || "uptechz",
      resource_type: options.resourceType || options.resource_type || "auto",
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error("Cloudinary stream upload error:", error);
        return reject(error);
      }
      resolve(result);
    });

    Readable.from(buffer).pipe(stream);
  });
};

/**
 * Deletes an asset from Cloudinary by its public ID.
 *
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} [resourceType="image"] - 'image', 'video', or 'raw'
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

/**
 * Uploads a local file path (backward compatibility).
 *
 * @param {string} filePath - Path to local file
 * @param {Object} options - Additional Cloudinary options
 * @returns {Promise<string>} Secure URL of uploaded asset
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || "uptechz",
      ...options,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export default cloudinary;
