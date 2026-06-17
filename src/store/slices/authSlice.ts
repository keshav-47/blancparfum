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
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registration: RegistrationData | null;
}

type ExistingUserLogin = {
  newUser: false;
  user: UserProfile;
};

type NewUserLogin = {
  newUser: true;
  registration: RegistrationData;
};

type LoginResult = ExistingUserLogin | NewUserLogin;

localStorage.removeItem("auth_token");

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem("auth_user") || "null"); }
  catch { return null; }
})();

const initialState: AuthState = {
  user: storedUser,
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
  registration: null,
};

const syncLocalCart = async (
  dispatch: (action: { type: string; payload?: unknown }) => void,
  state: RootState
) => {
  const localItems = state.cart.items.map((i) => ({
    productId: i.productId,
    sizeMl: i.size,
    quantity: i.quantity,
  }));

  if (localItems.length > 0) {
    const cartRes = await apiClient.post("/cart/sync", { items: localItems });
    dispatch({ type: "cart/replaceCart", payload: cartRes.data.items });
  }
};

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<UserProfile>("/user/profile");
      localStorage.setItem("auth_user", JSON.stringify(res.data));
      localStorage.removeItem("refresh_token");
      return res.data;
    } catch {
      localStorage.removeItem("auth_user");
      return rejectWithValue("Session expired");
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (idToken: string, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/google", { idToken });
      const data = res.data;

      if (data.newUser) {
        return { newUser: true, registration: data } satisfies LoginResult;
      }

      await syncLocalCart(dispatch, getState() as RootState);
      return { newUser: false, user: data.user } satisfies LoginResult;
    } catch {
      return rejectWithValue("Google login failed");
    }
  }
);

export const loginWithFirebase = createAsyncThunk(
  "auth/loginWithFirebase",
  async (firebaseIdToken: string, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/firebase", { idToken: firebaseIdToken });
      const data = res.data;

      if (data.newUser) {
        return { newUser: true, registration: data } satisfies LoginResult;
      }

      await syncLocalCart(dispatch, getState() as RootState);
      return { newUser: false, user: data.user } satisfies LoginResult;
    } catch {
      return rejectWithValue("Phone login failed");
    }
  }
);

export const completeRegistration = createAsyncThunk(
  "auth/completeRegistration",
  async (data: { registrationToken: string; name: string; email: string; phone: string }, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/register", data);
      const user = res.data.user as UserProfile;

      await syncLocalCart(dispatch, getState() as RootState);
      return user;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || "Registration failed";
      return rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
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
    const handleLoginFulfilled = (state: AuthState, action: { payload: LoginResult }) => {
      state.loading = false;
      if (action.payload.newUser) {
        state.registration = {
          registrationToken: action.payload.registration.registrationToken,
          providerName: action.payload.registration.providerName,
          providerEmail: action.payload.registration.providerEmail,
          providerPhone: action.payload.registration.providerPhone,
        };
      } else {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.registration = null;
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      }
    };

    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.registration = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogle.fulfilled, handleLoginFulfilled)
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginWithFirebase.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithFirebase.fulfilled, handleLoginFulfilled)
      .addCase(loginWithFirebase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(completeRegistration.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(completeRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.registration = null;
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError, updateAuthUser, clearRegistration } = authSlice.actions;

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Client state still needs to be cleared if the server session is already gone.
    } finally {
      dispatch(logout());
    }
  }
);

export default authSlice.reducer;
