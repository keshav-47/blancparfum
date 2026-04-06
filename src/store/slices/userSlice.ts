import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { UserProfile, Order, Address } from "@/types";

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
    const res = await apiClient.get<UserProfile>("/user/profile");
    return res.data;
  } catch {
    return rejectWithValue("Failed to fetch profile");
  }
});

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data: { name: string; email: string | null }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put<UserProfile>("/user/profile", data);
      return res.data;
    } catch {
      return rejectWithValue("Failed to update profile");
    }
  }
);

export const fetchOrders = createAsyncThunk("user/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Order[]>("/orders");
    return res.data;
  } catch {
    return rejectWithValue("Failed to fetch orders");
  }
});

export const addAddress = createAsyncThunk(
  "user/addAddress",
  async (data: Omit<Address, "id">, { rejectWithValue }) => {
    try {
      const res = await apiClient.post<Address>("/user/addresses", data);
      return res.data;
    } catch {
      return rejectWithValue("Failed to add address");
    }
  }
);

export const updateAddress = createAsyncThunk(
  "user/updateAddress",
  async ({ id, ...data }: Address, { rejectWithValue }) => {
    try {
      const res = await apiClient.put<Address>(`/user/addresses/${id}`, data);
      return res.data;
    } catch {
      return rejectWithValue("Failed to update address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "user/deleteAddress",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/user/addresses/${id}`);
      return id;
    } catch {
      return rejectWithValue("Failed to delete address");
    }
  }
);

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
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.addresses.push(action.payload);
          // If new address is default, unset others
          if (action.payload.isDefault) {
            state.profile.addresses = state.profile.addresses.map((a) =>
              a.id === action.payload.id ? a : { ...a, isDefault: false }
            );
          }
        }
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.addresses = state.profile.addresses.map((a) =>
            a.id === action.payload.id ? action.payload : action.payload.isDefault ? { ...a, isDefault: false } : a
          );
        }
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.addresses = state.profile.addresses.filter((a) => a.id !== action.payload);
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export default userSlice.reducer;
