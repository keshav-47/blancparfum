import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { UserProfile, Order } from "@/types";

interface UserState {
  profile: UserProfile | null;
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  orders: [],
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk("user/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<UserProfile>("/user/profile");
    return response.data;
  } catch {
    return rejectWithValue("Failed to fetch profile");
  }
});

export const fetchOrders = createAsyncThunk("user/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<Order[]>("/orders");
    return response.data;
  } catch {
    return rejectWithValue("Failed to fetch orders");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
