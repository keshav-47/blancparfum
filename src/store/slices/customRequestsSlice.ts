import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { CustomRequest } from "@/types";

interface CustomRequestsState {
  requests: CustomRequest[];
  loading: boolean;
  submitted: boolean;
  error: string | null;
}

const initialState: CustomRequestsState = {
  requests: [],
  loading: false,
  submitted: false,
  error: null,
};

export const submitCustomRequest = createAsyncThunk(
  "customRequests/submit",
  async (request: Omit<CustomRequest, "id" | "date" | "status">, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<CustomRequest>("/custom-requests", request);
      return response.data;
    } catch {
      return rejectWithValue("Failed to submit custom request");
    }
  }
);

export const fetchCustomRequests = createAsyncThunk("customRequests/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<CustomRequest[]>("/custom-requests");
    return response.data;
  } catch {
    return rejectWithValue("Failed to fetch custom requests");
  }
});

const customRequestsSlice = createSlice({
  name: "customRequests",
  initialState,
  reducers: {
    resetSubmitted: (state) => {
      state.submitted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCustomRequest.pending, (state) => { state.loading = true; state.submitted = false; state.error = null; })
      .addCase(submitCustomRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.submitted = true;
        state.requests.push(action.payload);
      })
      .addCase(submitCustomRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchCustomRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchCustomRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSubmitted } = customRequestsSlice.actions;
export default customRequestsSlice.reducer;
