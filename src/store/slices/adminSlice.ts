import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { Product, Order, CustomRequest, DashboardStats } from "@/types";

interface AdminState {
  dashboard: DashboardStats | null;
  products: Product[];
  orders: Order[];
  customRequests: CustomRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboard: null,
  products: [],
  orders: [],
  customRequests: [],
  loading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk("admin/fetchDashboard", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<DashboardStats>("/admin/dashboard");
    return res.data;
  } catch {
    return rejectWithValue("Failed to fetch dashboard");
  }
});

export const fetchAdminProducts = createAsyncThunk("admin/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Product[]>("/admin/products");
    return res.data;
  } catch {
    return rejectWithValue("Failed to fetch products");
  }
});

export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async (product: Omit<Product, "id">, { rejectWithValue }) => {
    try {
      const res = await apiClient.post<Product>("/admin/products", product);
      return res.data;
    } catch {
      return rejectWithValue("Failed to create product");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "admin/updateProduct",
  async ({ id, ...data }: Product, { rejectWithValue }) => {
    try {
      const res = await apiClient.put<Product>(`/admin/products/${id}`, data);
      return res.data;
    } catch {
      return rejectWithValue("Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/products/${id}`);
      return id;
    } catch {
      return rejectWithValue("Failed to delete product");
    }
  }
);

export const fetchAdminOrders = createAsyncThunk("admin/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Order[]>("/admin/orders");
    return res.data;
  } catch {
    return rejectWithValue("Failed to fetch orders");
  }
});

export const updateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async ({ id, status }: { id: string; status: Order["status"] }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put<Order>(`/admin/orders/${id}`, { status });
      return res.data;
    } catch {
      return rejectWithValue("Failed to update order");
    }
  }
);

export const fetchAdminCustomRequests = createAsyncThunk("admin/fetchCustomRequests", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<CustomRequest[]>("/admin/custom-requests");
    return res.data;
  } catch {
    return rejectWithValue("Failed to fetch custom requests");
  }
});

export const updateCustomRequestStatus = createAsyncThunk(
  "admin/updateCustomRequestStatus",
  async ({ id, status, notes }: { id: string; status: CustomRequest["status"]; notes?: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put<CustomRequest>(`/admin/custom-requests/${id}`, { status, notes });
      return res.data;
    } catch {
      return rejectWithValue("Failed to update custom request");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload; })
      .addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Products
      .addCase(fetchAdminProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => { state.loading = false; state.products = action.payload; })
      .addCase(fetchAdminProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createProduct.fulfilled, (state, action) => { state.products.push(action.payload); })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.products[idx] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      // Orders
      .addCase(fetchAdminOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchAdminOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      // Custom Requests
      .addCase(fetchAdminCustomRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminCustomRequests.fulfilled, (state, action) => { state.loading = false; state.customRequests = action.payload; })
      .addCase(fetchAdminCustomRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateCustomRequestStatus.fulfilled, (state, action) => {
        const idx = state.customRequests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.customRequests[idx] = action.payload;
      });
  },
});

export default adminSlice.reducer;
