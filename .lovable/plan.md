

## Diagnosis: Why Product Images Appear Blank

**Root Cause**: The image asset files in `src/assets/` (e.g., `product-silk-satin.jpg`) likely contain no actual image data — they are empty placeholder files created during project setup. The mapping logic in `useProducts.ts` is correct (DB stores `/product-silk-satin` → maps to imported asset), but the imported files resolve to blank/broken images.

Additionally, the `product-images` storage bucket exists but is empty — no images have been uploaded there.

**Secondary Issue**: Console shows a `forwardRef` warning from `CartDrawer` component that should also be fixed.

---

## Plan

### 1. Fix Product Images — Use Storage Bucket URLs

Since local assets are placeholder files, switch to serving images from the public `product-images` storage bucket:

- **Upload placeholder/sample product images** to the `product-images` storage bucket (16 images matching the product slugs)
- **Update the `products` table** `image_url` column to use full public storage URLs like `https://xyctcmixpkihqfupcorw.supabase.co/storage/v1/object/public/product-images/product-silk-satin.jpg`
- **Simplify `getProductImage`** in `src/hooks/useProducts.ts` — remove the local `imageMap` and all static imports since images will come from remote URLs. The function just needs to pass through URLs or return a placeholder fallback.

### 2. Alternative: Generate Placeholder Images

If real product photos aren't available yet, update the `image_url` values in the database to use a placeholder service like `https://placehold.co/400x400?text=Product+Name` so products display visually while you source real images.

### 3. Fix CartDrawer Ref Warning

- In `src/components/CartDrawer.tsx`, wrap the component with `React.forwardRef` or restructure to avoid passing refs to function components.

---

### Files to Edit
- `src/hooks/useProducts.ts` — simplify `getProductImage`, remove static imports
- `src/components/CartDrawer.tsx` — fix forwardRef warning
- Database migration to update `image_url` values (if using placeholder service)

