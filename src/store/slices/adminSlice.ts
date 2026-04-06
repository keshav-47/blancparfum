import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { Product, Collection, Order, CustomRequest, DashboardStats } from "@/types";

interface AdminState {
  dashboard: DashboardStats | null;
  products: Product[];
  collections: Collection[];
  orders: Order[];
  customRequests: CustomRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboard: null,
  products: [],
  collections: [],
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

// ──── Products ────

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

export const uploadProductImage = createAsyncThunk(
  "admin/uploadProductImage",
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post<Product>(`/admin/products/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch {
      return rejectWithValue("Failed to upload image");
    }
  }
);

// ──── Collections ────

export const fetchAdminCollections = createAsyncThunk("admin/fetchCollections", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Collection[]>("/admin/collections");
    return res.data;
  } catch {
    return rejectWithValue("Failed to fetch collections");
  }
});

export const createCollection = createAsyncThunk(
  "admin/createCollection",
  async (data: { name: string; description: string; productIds: string[] }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post<Collection>("/admin/collections", data);
      return res.data;
    } catch {
      return rejectWithValue("Failed to create collection");
    }
  }
);

export const updateCollection = createAsyncThunk(
  "admin/updateCollection",
  async ({ id, ...data }: { id: string; name: string; description: string; productIds: string[] }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put<Collection>(`/admin/collections/${id}`, data);
      return res.data;
    } catch {
      return rejectWithValue("Failed to update collection");
    }
  }
);

export const deleteCollection = createAsyncThunk(
  "admin/deleteCollection",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/collections/${id}`);
      return id;
    } catch {
      return rejectWithValue("Failed to delete collection");
    }
  }
);

export const uploadCollectionImage = createAsyncThunk(
  "admin/uploadCollectionImage",
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post<Collection>(`/admin/collections/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch {
      return rejectWithValue("Failed to upload image");
    }
  }
);

// ──── Orders ────

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
      const res = await apiClient.put<Order>(`/admin/orders/${id}/status`, { status });
      return res.data;
    } catch {
      return rejectWithValue("Failed to update order");
    }
  }
);

// ──── Custom Requests ────

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
      // Backend field is `adminNotes`, not `notes`
      const res = await apiClient.put<CustomRequest>(`/admin/custom-requests/${id}`, { status, adminNotes: notes });
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
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload; })
      .addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

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
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.products[idx] = action.payload;
      })

      .addCase(fetchAdminCollections.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminCollections.fulfilled, (state, action) => { state.loading = false; state.collections = action.payload; })
      .addCase(fetchAdminCollections.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createCollection.fulfilled, (state, action) => { state.collections.push(action.payload); })
      .addCase(updateCollection.fulfilled, (state, action) => {
        const idx = state.collections.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.collections[idx] = action.payload;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.collections = state.collections.filter((c) => c.id !== action.payload);
      })
      .addCase(uploadCollectionImage.fulfilled, (state, action) => {
        const idx = state.collections.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.collections[idx] = action.payload;
      })

      .addCase(fetchAdminOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchAdminOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })

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
