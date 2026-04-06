import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { Product, Collection } from "@/types";

interface ProductsState {
  items: Product[];
  collections: Collection[];
  loading: boolean;
  error: string | null;
  filter: string;
}

const initialState: ProductsState = {
  items: [],
  collections: [],
  loading: false,
  error: null,
  filter: "all",
};

export const fetchProducts = createAsyncThunk("products/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<Product[]>("/products");
    return response.data;
  } catch {
    return rejectWithValue("Failed to fetch products");
  }
});

export const fetchCollections = createAsyncThunk("products/fetchCollections", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<Collection[]>("/collections");
    return response.data;
  } catch {
    return rejectWithValue("Failed to fetch collections");
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
      });
  },
});

export const { setFilter } = productsSlice.actions;
export default productsSlice.reducer;
