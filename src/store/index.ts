import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import customRequestsReducer from "./slices/customRequestsSlice";
import type { CartItem } from "@/types";

const CART_KEY = "bp_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    user: userReducer,
    auth: authReducer,
    admin: adminReducer,
    customRequests: customRequestsReducer,
  },
  preloadedState: {
    cart: { items: loadCart() },
  },
});

store.subscribe(() => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(store.getState().cart.items));
  } catch {
    // storage quota exceeded — ignore
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
