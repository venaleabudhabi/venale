# 🔐 Cloudinary Upload Preset Setup Guide

## Required: Create Unsigned Upload Preset

For the admin image uploads to work, you need to create an **unsigned upload preset** in your Cloudinary dashboard.

## Step-by-Step Instructions

### 1. Login to Cloudinary
Go to [cloudinary.com](https://cloudinary.com) and login with your account.

### 2. Navigate to Upload Settings
- Click on **Settings** (gear icon in top right)
- Go to the **Upload** tab
- Scroll down to **Upload presets** section

### 3. Add Upload Preset
- Click **Add upload preset**
- Configure as follows:

**Preset Settings:**
```
Upload preset name: ml_default
Signing Mode: Unsigned
Folder: (leave empty - will be set by the app)
```

**Upload Manipulations:**
```
Transformation Mode: Incoming
Width: 1200
Height: 1200
Crop: Limit
Quality: Auto
Format: Auto
```

**Upload Control:**
```
Allowed formats: jpg, jpeg, png, webp
Max file size: 5 MB (5000000 bytes)
Max image width: 2000
Max image height: 2000
```

**Access Mode:**
```
Access control: Public read
```

### 4. Save the Preset
- Click **Save** at the bottom
- The preset name `ml_default` will now be available for uploads

## Alternative: Use a Different Preset Name

If you want to use a different name:

1. Create the preset with your custom name
2. Update the preset name in the code:

**File:** `frontend/src/components/CloudinaryUploadButton.tsx`

```tsx
<CldUploadWidget
  uploadPreset="YOUR_CUSTOM_PRESET_NAME" // Change this
  ...
/>
```

## Verify Setup

After creating the preset:

1. Go to Admin Menu page
2. Try adding/editing an item
3. Click "Upload Image"
4. Upload a test image
5. It should upload successfully and show the preview

## Security Note

**Unsigned presets** are safe for client-side uploads because:
- ✅ No API secrets exposed in frontend
- ✅ Limited to specific folders (menu-items, menu-categories)
- ✅ File size and format restrictions enforced
- ✅ Upload transformations applied automatically

## Troubleshooting

**Upload widget doesn't open:**
- Check browser console for errors
- Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set in `.env.local`
- Make sure preset is set to "Unsigned"

**Upload fails:**
- Check file size (must be < 5 MB)
- Check file format (jpg, jpeg, png, webp only)
- Verify preset name matches exactly

**Image doesn't show after upload:**
- Check if `imageUrl` is being saved in the form
- Verify the image URL is valid (should start with `https://res.cloudinary.com/`)

## Current Configuration

**Cloud Name:** dm1ji0mqd  
**Preset Name:** ml_default  
**Folders:**
- `menu-items/` - For item images
- `menu-categories/` - For category images

---

✅ Once you've created the preset, the image upload feature will work in the admin panel!
