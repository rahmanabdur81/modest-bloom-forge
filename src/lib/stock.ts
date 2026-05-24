// Reusable stock helpers — single source of truth for stock logic
// Used by ProductCard, ProductDetail, Cart, CartDrawer, Checkout

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function getAvailableStock(stock?: number | null): number {
  if (stock == null || Number.isNaN(stock)) return 0;
  return Math.max(0, Math.floor(stock));
}

export function isOutOfStock(stock?: number | null): boolean {
  return getAvailableStock(stock) <= 0;
}

export function getStockStatus(stock?: number | null, lowThreshold = 5): StockStatus {
  const s = getAvailableStock(stock);
  if (s <= 0) return "out_of_stock";
  if (s <= lowThreshold) return "low_stock";
  return "in_stock";
}

export function getStockLabel(stock?: number | null, lowThreshold = 5): string {
  const s = getAvailableStock(stock);
  const status = getStockStatus(s, lowThreshold);
  if (status === "out_of_stock") return "Out of Stock";
  if (status === "low_stock") return `Only ${s} left`;
  return `In Stock (${s} left)`;
}

export function validateCartQuantity(
  requested: number,
  available?: number | null
): { ok: boolean; clamped: number; message?: string } {
  const max = getAvailableStock(available);
  if (max <= 0) return { ok: false, clamped: 0, message: "Out of stock" };
  if (requested > max) return { ok: false, clamped: max, message: `Only ${max} items available` };
  if (requested < 1) return { ok: false, clamped: 1 };
  return { ok: true, clamped: requested };
}
