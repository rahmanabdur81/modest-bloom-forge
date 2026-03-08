

## Plan: Make Add-to-Cart Experience More User-Friendly

### Current Issues
- Adding to cart from ProductCard only shows a small toast — no visual feedback on the cart icon
- No cart drawer/sidebar — user must navigate to `/cart` to see items
- No "Added!" confirmation state on buttons
- Cart page lacks animations and polish

### Changes

**1. Add a Cart Drawer (Slide-out Sidebar)**
- Create `src/components/CartDrawer.tsx` — a sheet/drawer that slides in from the right showing cart items, quantities, totals, and checkout button
- Opens automatically when an item is added to cart
- Replace the navbar cart icon click behavior: tap opens drawer instead of navigating to `/cart`
- Use the existing `isOpen` state in `CartContext` to control visibility
- Add `OPEN_CART` / `CLOSE_CART` actions to the cart reducer

**2. Add-to-Cart Button Feedback**
- In `ProductCard.tsx`: show a brief "Added!" checkmark animation on the cart button after clicking
- In `ProductDetail.tsx`: show button text change from "Add to Cart" to "✓ Added!" for 1.5 seconds after adding
- Add a subtle scale/bounce animation on the navbar cart badge when items change

**3. Cart Page Polish**
- Add swipe-to-delete hint on mobile (visual indicator)
- Add item-level "Save for later" option linking to wishlist
- Show free shipping progress bar ("₹X more for free shipping!")
- Add animated empty cart illustration

**4. Sticky Cart Summary on Mobile**
- On the Cart page, make the order summary sticky at the bottom on mobile so "Proceed to Checkout" is always visible

### Files to Create/Edit
- **Create** `src/components/CartDrawer.tsx` — slide-out cart sidebar
- **Edit** `src/context/CartContext.tsx` — add OPEN_CART/CLOSE_CART actions
- **Edit** `src/components/Navbar.tsx` — open drawer on cart click, add badge animation
- **Edit** `src/components/ProductCard.tsx` — add "Added!" feedback state
- **Edit** `src/pages/ProductDetail.tsx` — add button feedback state
- **Edit** `src/pages/Cart.tsx` — free shipping progress bar, mobile sticky checkout, polish
- **Edit** `src/App.tsx` — render CartDrawer globally

