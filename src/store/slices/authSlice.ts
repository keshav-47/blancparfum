import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { UserProfile } from "@/types";
import type { RootState } from "@/store";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem("auth_user") || "null"); }
  catch { return null; }
})();

const initialState: AuthState = {
  user: storedUser,
  token: localStorage.getItem("auth_token"),
  isAuthenticated: !!localStorage.getItem("auth_token"),
  loading: false,
  error: null,
};

// ──── Google OAuth ────

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (idToken: string, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/google", { idToken });
      const { token, user } = res.data.data;
      localStorage.setItem("auth_token", token);

      // Sync local cart to server
      const state = getState() as RootState;
      const localItems = state.cart.items.map((i) => ({
        productId: i.productId,
        sizeMl: i.size,
        quantity: i.quantity,
      }));
      if (localItems.length > 0) {
        const cartRes = await apiClient.post("/cart/sync", { items: localItems });
        dispatch({ type: "cart/replaceCart", payload: cartRes.data.items });
      }

      return { token, user };
    } catch {
      return rejectWithValue("Google login failed");
    }
  }
);

// ──── Firebase Phone Auth ────

export const loginWithFirebase = createAsyncThunk(
  "auth/loginWithFirebase",
  async (firebaseIdToken: string, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/firebase", { idToken: firebaseIdToken });
      const { token, user } = res.data.data;
      localStorage.setItem("auth_token", token);

      // Sync local cart to server
      const state = getState() as RootState;
      const localItems = state.cart.items.map((i) => ({
        productId: i.productId,
        sizeMl: i.size,
        quantity: i.quantity,
      }));
      if (localItems.length > 0) {
        const cartRes = await apiClient.post("/cart/sync", { items: localItems });
        dispatch({ type: "cart/replaceCart", payload: cartRes.data.items });
      }

      return { token, user };
    } catch {
      return rejectWithValue("Phone login failed");
    }
  }
);

// ──── Slice ────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("bp_cart");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateAuthUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("auth_user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Google
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Firebase Phone
      .addCase(loginWithFirebase.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithFirebase.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      })
      .addCase(loginWithFirebase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
