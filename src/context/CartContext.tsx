import React, { createContext, useContext, useReducer, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
  // Stock tracking metadata — used for backend validation & quantity limits
  productId?: string;
  variationId?: string;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SYNC_STOCK"; payload: Record<string, number> } // id -> available stock
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalItems: number;
  totalPrice: number;
} | null>(null);

function clamp(qty: number, max?: number) {
  if (max == null) return Math.max(0, qty);
  return Math.max(0, Math.min(qty, max));
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        const merged = existing.quantity + action.payload.quantity;
        const max = action.payload.maxStock ?? existing.maxStock;
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, ...action.payload, quantity: clamp(merged, max) || existing.quantity }
              : i
          ),
        };
      }
      const qty = clamp(action.payload.quantity, action.payload.maxStock) || action.payload.quantity;
      return { ...state, items: [...state.items, { ...action.payload, quantity: qty }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: clamp(action.payload.quantity, i.maxStock) }
              : i
          )
          .filter((i) => i.quantity > 0),
      };
    case "SYNC_STOCK": {
      const stocks = action.payload;
      return {
        ...state,
        items: state.items
          .map((i) => {
            const key = i.variationId || i.productId || i.id;
            const available = stocks[key];
            if (available == null) return i;
            return {
              ...i,
              maxStock: available,
              quantity: Math.min(i.quantity, available),
            };
          })
          .filter((i) => i.quantity > 0),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
