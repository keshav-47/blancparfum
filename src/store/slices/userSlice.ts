import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { UserProfile, Order } from "@/types";
import { fallbackOrders } from "@/data/fallbackData";

interface UserState {
  profile: UserProfile | null;
  orders: Order[];
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: UserState = {
  profile: {
    id: "demo-user",
    name: "Guest User",
    email: "guest@blanc.com",
    addresses: [
      {
        id: "a1",
        label: "Home",
        street: "123 Rue de Rivoli",
        city: "Paris",
        state: "Île-de-France",
        zip: "75001",
        country: "France",
        isDefault: true,
      },
    ],
  },
  orders: fallbackOrders,
  isAuthenticated: false,
  loading: false,
};

export const fetchUserProfile = createAsyncThunk("user/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<UserProfile>("/user/profile");
    return response.data;
  } catch {
    return rejectWithValue("Using fallback profile");
  }
});

export const fetchOrders = createAsyncThunk("user/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<Order[]>("/user/orders");
    return response.data;
  } catch {
    return rejectWithValue("Using fallback orders");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.profile = null;
      localStorage.removeItem("auth_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.orders = fallbackOrders;
      });
  },
});

export const { setAuthenticated, logout } = userSlice.actions;
export default userSlice.reducer;
