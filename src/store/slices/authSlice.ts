import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { UserProfile } from "@/types";
import type { RootState } from "@/store";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  otpSent: boolean;
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
  otpSent: false,
  error: null,
};

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

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (phone: string, { rejectWithValue }) => {
    try {
      await apiClient.post("/auth/otp/send", { phone });
      return true;
    } catch {
      return rejectWithValue("Failed to send OTP");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ phone, otp }: { phone: string; otp: string }, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/otp/verify", { phone, otp });
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
      return rejectWithValue("OTP verification failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },
    clearAuthError: (state) => {
      state.error = null;
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
      // Send OTP
      .addCase(sendOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendOtp.fulfilled, (state) => { state.loading = false; state.otpSent = true; })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpSent = false;
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
