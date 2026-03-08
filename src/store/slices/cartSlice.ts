import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; size: number }>) => {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && i.size === action.payload.size)
      );
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; size: number; quantity: number }>) => {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
