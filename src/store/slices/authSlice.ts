import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { UserProfile } from "@/types";
import type { RootState } from "@/store";

interface RegistrationData {
  registrationToken: string;
  providerName?: string | null;
  providerEmail?: string | null;
  providerPhone?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Registration flow — set when a new user needs to complete signup
  registration: RegistrationData | null;
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
  registration: null,
};

// ──── Google OAuth ────

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (idToken: string, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/google", { idToken });
      const data = res.data;

      if (data.newUser) {
        // New user — don't persist token, return registration data
        return { newUser: true, registration: data };
      }

      // Existing user
      const { token, refreshToken, user } = data;
      localStorage.setItem("auth_token", token);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

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

      return { newUser: false, token, user };
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
      const data = res.data;

      if (data.newUser) {
        return { newUser: true, registration: data };
      }

      const { token, refreshToken, user } = data;
      localStorage.setItem("auth_token", token);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

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

      return { newUser: false, token, user };
    } catch {
      return rejectWithValue("Phone login failed");
    }
  }
);

// ──── Complete Registration (creates the user) ────

export const completeRegistration = createAsyncThunk(
  "auth/completeRegistration",
  async (data: { registrationToken: string; name: string; email: string; phone: string }, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/register", data);
      const { token, refreshToken, user } = res.data;
      localStorage.setItem("auth_token", token);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

      // Sync local cart
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || "Registration failed";
      return rejectWithValue(msg);
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
      state.registration = null;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
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
    clearRegistration: (state) => {
      state.registration = null;
    },
  },
  extraReducers: (builder) => {
    const handleLoginFulfilled = (state: AuthState, action: { payload: { newUser: boolean; token?: string; user?: UserProfile; registration?: RegistrationData } }) => {
      state.loading = false;
      if (action.payload.newUser && action.payload.registration) {
        // New user — store registration data, don't authenticate yet
        state.registration = {
          registrationToken: action.payload.registration.registrationToken,
          providerName: action.payload.registration.providerName,
          providerEmail: action.payload.registration.providerEmail,
          providerPhone: action.payload.registration.providerPhone,
        };
      } else {
        // Existing user — fully authenticated
        state.user = action.payload.user!;
        state.token = action.payload.token!;
        state.isAuthenticated = true;
        state.registration = null;
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      }
    };

    builder
      // Google
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogle.fulfilled, handleLoginFulfilled)
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Firebase Phone
      .addCase(loginWithFirebase.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithFirebase.fulfilled, handleLoginFulfilled)
      .addCase(loginWithFirebase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Complete Registration
      .addCase(completeRegistration.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(completeRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registration = null;
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError, updateAuthUser, clearRegistration } = authSlice.actions;
export default authSlice.reducer;
