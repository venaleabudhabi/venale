'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

interface CloudinaryUploadButtonProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  buttonText?: string;
  maxFiles?: number;
}

export default function CloudinaryUploadButton({
  onUploadSuccess,
  onUploadError,
  folder = 'menu-items',
  buttonText = 'Upload Image',
  maxFiles = 1,
}: CloudinaryUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <CldUploadWidget
      uploadPreset="ml_default" // You'll need to create an unsigned upload preset in Cloudinary
      options={{
        maxFiles,
        folder,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: 5000000, // 5MB
      }}
      onUpload={(result: any) => {
        setIsUploading(false);
        if (result.event === 'success') {
          onUploadSuccess(result.info.secure_url, result.info.public_id);
        }
      }}
      onError={(error: any) => {
        setIsUploading(false);
        if (onUploadError) {
          onUploadError(error.message || 'Upload failed');
        }
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => {
            setIsUploading(true);
            open();
          }}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? 'Uploading...' : buttonText}
        </button>
      )}
    </CldUploadWidget>
  );
}
