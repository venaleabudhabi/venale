# 📸 Cloudinary Image Upload Guide

## Image Specifications for Menu Items

### ✅ Recommended Upload Dimensions

**Optimal Quality:**
- **Square Format**: 1200 x 1200 px (best for menu grids)
- **Landscape Format**: 1600 x 1067 px (3:2 ratio)
- **Minimum**: 800 x 800 px

### Display Dimensions
- **Menu Cards**: 128 x 128 px (`w-32 h-32`) - industry standard for food menus
- **Cloudinary Auto-Resize**: Max 1200 x 1200 px
- **Crop Mode**: `limit` (maintains aspect ratio, no upscaling)

### File Requirements
- **Formats**: JPG, PNG, WebP
- **Max File Size**: 5 MB per image
- **Auto Optimization**: Cloudinary converts to WebP when browser supports it
- **Quality**: Auto-optimized for web delivery

### Why Upload Larger Images?
Even though display size is 96x96px, upload larger images because:
1. **Retina Displays**: High-DPI screens need 2x resolution
2. **Future-Proofing**: Can zoom or use larger displays later
3. **Quality**: Downscaling produces better quality than upscaling
4. **Flexibility**: Original high-res version stored for other uses

## 🎨 Image Guidelines

### Composition
- **Square Crop**: Center the main subject
- **Background**: Clean, simple backgrounds work best
- **Lighting**: Well-lit, vibrant colors
- **Focus**: Clear, sharp product image

### Food Photography Tips
- Natural lighting or soft diffused light
- 45-degree angle for bowls and plates
- Straight-on for drinks and tall items
- Show texture and freshness
- Garnish and presentation matter

### Examples
```
Good: Clean white plate, colorful smoothie, clear focus
Bad: Cluttered background, dark shadows, blurry
```

## 📂 Folder Structure in Cloudinary

```
menu-items/
  ├── protein-shakes/
  ├── healthy-bowls/
  ├── smoothies/
  ├── fresh-juices/
  └── ...
```

## 🔧 Technical Implementation

### Backend Upload Configuration
```typescript
transformation: [
  { width: 1200, height: 1200, crop: 'limit' },
  { quality: 'auto' },
  { fetch_format: 'auto' },
]
```

### Frontend Display
```tsx
<img 
  src={item.imageUrl} 
  alt={item.name}
  className="w-24 h-24 object-cover rounded-lg"
/>
```

### Image Model Field
```typescript
imageUrl?: string;  // Cloudinary secure URL
```

## 🚀 How to Upload Images

### Option 1: Admin Panel (Coming Soon)
Use the Cloudinary upload widget in the admin menu management page.

### Option 2: API Upload
```typescript
import { uploadImage } from '@/utils/cloudinary';

const result = await uploadImage('/path/to/image.jpg', 'menu-items/smoothies');
// Returns: { secure_url, public_id }
```

### Option 3: Direct Cloudinary Dashboard
1. Login to [cloudinary.com](https://cloudinary.com)
2. Go to Media Library
3. Create folder: `menu-items`
4. Upload images
5. Copy secure URL
6. Add to menu item in database

## 📊 Current Setup

**Cloud Name**: dm1ji0mqd  
**Upload Preset**: ml_default (unsigned)  
**Max File Size**: 5 MB  
**Allowed Formats**: jpg, jpeg, png, webp  

## 🔒 Security

- API credentials are in `.env` (NOT committed to GitHub)
- Frontend uses unsigned upload preset (safe for client-side)
- Only `CLOUDINARY_CLOUD_NAME` is public (safe to expose)

## 📝 Checklist Before Upload

- [ ] Image is at least 800x800px
- [ ] File size under 5 MB
- [ ] Good lighting and clear focus
- [ ] Clean background
- [ ] Proper crop/composition
- [ ] File named descriptively (e.g., `berry-blast-smoothie.jpg`)

## 🎯 Quick Reference

| Aspect | Value |
|--------|-------|
| Upload Size | 1200 x 1200 px |
| Display Size | 128 x 128 px |
| Format | JPG, PNG, WebP |
| Max File | 5 MB |
| Crop Mode | Limit (no upscale) |
| Quality | Auto |
| Folder | menu-items |

---

Need help? Check the Cloudinary documentation or contact support.
