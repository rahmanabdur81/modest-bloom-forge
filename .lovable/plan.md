

## Plan: Full Responsive & Dynamic UX Improvements for Mobile, Tablet, and Desktop Users

### Current State Analysis

The codebase already has decent mobile responsiveness with `sm:` / `md:` / `lg:` breakpoints. However, several areas need improvement for a truly polished experience across all device types.

### Issues Found

**Mobile Users (< 768px):**
- Admin Dashboard tabs overflow and are hard to tap — no dropdown fallback
- Checkout page has no responsive padding, order summary not sticky on mobile
- Wishlist empty/login states have fixed large sizes (`h-16`, `text-2xl`) that feel oversized
- Auth page lacks responsive text sizing and touch-friendly inputs
- Footer grid collapses to 1 column but could use 2-column on small screens
- No touch-friendly swipe gestures or tap feedback

**Tablet Users (768px–1024px):**
- Product detail page image and info are side-by-side at `md:` but cramped on smaller tablets
- Admin order detail view is 2-column at `lg:` but squished single-column at `md:`
- Cart page order summary disappears between `md` and `lg` breakpoints

**Desktop Users (> 1024px):**
- Admin tables lack hover states for row selection
- No keyboard navigation hints on interactive elements
- Checkout order summary could have more breathing room

**Cross-cutting:**
- No loading skeleton consistency — some pages use skeletons, others show text
- Touch targets on quantity +/- buttons are too small (< 44px) on mobile
- No haptic/visual feedback on button taps for mobile
- Cart drawer quantity buttons extremely small on mobile

---

### Changes

**1. Admin Dashboard — Mobile-Responsive Tabs**
- **Edit** `src/pages/AdminDashboard.tsx`
  - Replace horizontal tab buttons with a `<select>` dropdown on mobile (`md:hidden`)
  - Keep button tabs on desktop (`hidden md:flex`)
  - Add horizontal scroll wrapper for admin tables with visual scroll hint
  - Responsive padding and text sizes throughout

**2. Checkout Page — Mobile Polish**
- **Edit** `src/pages/Checkout.tsx`
  - Add responsive text sizes (`text-lg sm:text-2xl` for heading)
  - Make order summary a sticky bottom bar on mobile (like Cart page)
  - Increase input padding and touch target sizes on mobile
  - Add responsive padding (`py-4 sm:py-8`)

**3. Auth Page — Responsive & Touch-Friendly**
- **Edit** `src/pages/Auth.tsx`
  - Add responsive heading sizes
  - Increase input height on mobile for better touch targets (`py-3.5` → `h-12`)
  - Add responsive padding to container

**4. Wishlist Page — Responsive Empty States**
- **Edit** `src/pages/Wishlist.tsx`
  - Scale icon sizes, heading text, and spacing for mobile
  - Use responsive grid columns

**5. Cart Drawer — Larger Touch Targets**
- **Edit** `src/components/CartDrawer.tsx`
  - Increase quantity +/- button tap areas
  - Add responsive item image sizes

**6. Improve Touch Feedback & Interaction**
- **Edit** `src/index.css`
  - Add `active:scale-95` utility class for tap feedback
  - Add `-webkit-tap-highlight-color: transparent` globally
  - Add smooth scroll behavior

**7. Admin Tables — Mobile Card View**
- **Edit** `src/pages/AdminDashboard.tsx`
  - On mobile, render orders as stacked cards instead of table rows
  - Show key info (tracking ID, status, total) in a compact card format

### Files to Edit
- `src/pages/AdminDashboard.tsx` — mobile tabs dropdown, card layout for orders
- `src/pages/Checkout.tsx` — mobile sticky summary, responsive sizing
- `src/pages/Auth.tsx` — responsive text, larger touch targets
- `src/pages/Wishlist.tsx` — responsive empty states
- `src/components/CartDrawer.tsx` — larger touch targets
- `src/index.css` — global touch feedback, smooth scroll

