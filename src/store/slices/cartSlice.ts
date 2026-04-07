import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import type { CartItem } from "@/types";
import type { RootState } from "@/store";
import { logout } from "./authSlice";

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

// Map server response item → local CartItem
interface ServerCartItem {
  productId: string;
  name: string;
  image: string | null;
  size: number;
  price: number;
  quantity: number;
}

const mapServerItem = (s: ServerCartItem): CartItem => ({
  productId: s.productId,
  name: s.name,
  image: s.image ?? "",
  size: s.size,
  price: s.price,
  quantity: s.quantity,
});

// ──── Async thunks ────

export const fetchServerCart = createAsyncThunk(
  "cart/fetchServer",
  async (_, { getState }) => {
    const { auth } = getState() as RootState;
    if (!auth.isAuthenticated) return null;
    const res = await apiClient.get<{ items: ServerCartItem[] }>("/cart");
    return res.data.items.map(mapServerItem);
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async (item: CartItem, { getState, rejectWithValue }) => {
    const { auth } = getState() as RootState;
    if (auth.isAuthenticated) {
      try {
        const res = await apiClient.post<{ items: ServerCartItem[] }>("/cart/items", {
          productId: item.productId,
          sizeMl: item.size,
          quantity: item.quantity,
        });
        return { serverItems: res.data.items.map(mapServerItem), local: null };
      } catch {
        // API failed — fall back to local add so cart still updates
        return { serverItems: null, local: item };
      }
    }
    return { serverItems: null, local: item };
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async (payload: { productId: string; size: number }, { getState }) => {
    const { auth } = getState() as RootState;
    if (auth.isAuthenticated) {
      try {
        const res = await apiClient.delete<{ items: ServerCartItem[] }>(
          `/cart/items/${payload.productId}/${payload.size}`
        );
        return { serverItems: res.data.items.map(mapServerItem), local: null };
      } catch {
        return { serverItems: null, local: payload };
      }
    }
    return { serverItems: null, local: payload };
  }
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (
    payload: { productId: string; size: number; quantity: number },
    { getState }
  ) => {
    const { auth } = getState() as RootState;
    const qty = Math.max(1, payload.quantity);
    if (auth.isAuthenticated) {
      try {
        const res = await apiClient.post<{ items: ServerCartItem[] }>("/cart/items", {
          productId: payload.productId,
          sizeMl: payload.size,
          quantity: qty,
        });
        return { serverItems: res.data.items.map(mapServerItem), local: null };
      } catch {
        return { serverItems: null, local: { ...payload, quantity: qty } };
      }
    }
    return { serverItems: null, local: { ...payload, quantity: qty } };
  }
);

// ──── Slice ────

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
    replaceCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch server cart
      .addCase(fetchServerCart.fulfilled, (state, action) => {
        if (action.payload) state.items = action.payload;
      })
      // Add item
      .addCase(addItemToCart.fulfilled, (state, action) => {
        if (action.payload.serverItems) {
          state.items = action.payload.serverItems;
        } else if (action.payload.local) {
          const item = action.payload.local;
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            state.items.push(item);
          }
        }
      })
      // Remove item
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        if (action.payload.serverItems) {
          state.items = action.payload.serverItems;
        } else if (action.payload.local) {
          const { productId, size } = action.payload.local;
          state.items = state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          );
        }
      })
      // Update quantity
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        if (action.payload.serverItems) {
          state.items = action.payload.serverItems;
        } else if (action.payload.local) {
          const { productId, size, quantity } = action.payload.local;
          const item = state.items.find(
            (i) => i.productId === productId && i.size === size
          );
          if (item) item.quantity = quantity;
        }
      })
      // Clear cart on logout
      .addCase(logout, (state) => {
        state.items = [];
      });
  },
});

export const { clearCart, replaceCart } = cartSlice.actions;
export default cartSlice.reducer;
