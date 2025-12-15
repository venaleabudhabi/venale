import cloudinary from '../config/cloudinary';

/**
 * Upload an image to Cloudinary
 * @param filePath - The path to the file or base64 encoded string
 * @param folder - The folder in Cloudinary to upload to (default: 'menu-items')
 * @returns The Cloudinary upload result with secure_url
 */
export const uploadImage = async (
  filePath: string,
  folder: string = 'menu-items'
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param filePaths - Array of file paths or base64 strings
 * @param folder - The folder in Cloudinary to upload to
 */
export const uploadMultipleImages = async (
  filePaths: string[],
  folder: string = 'menu-items'
): Promise<Array<{ secure_url: string; public_id: string }>> => {
  try {
    const uploadPromises = filePaths.map((filePath) =>
      uploadImage(filePath, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};
