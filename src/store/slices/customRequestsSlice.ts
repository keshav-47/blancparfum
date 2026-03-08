import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";
import { CustomRequest } from "@/types";
import { fallbackCustomRequests } from "@/data/fallbackData";

interface CustomRequestsState {
  requests: CustomRequest[];
  loading: boolean;
  submitted: boolean;
}

const initialState: CustomRequestsState = {
  requests: fallbackCustomRequests,
  loading: false,
  submitted: false,
};

export const submitCustomRequest = createAsyncThunk(
  "customRequests/submit",
  async (request: Omit<CustomRequest, "id" | "date" | "status">, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<CustomRequest>("/custom-requests", request);
      return response.data;
    } catch {
      // Fallback: create a local request
      const localRequest: CustomRequest = {
        ...request,
        id: `cr-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        status: "pending",
      };
      return localRequest;
    }
  }
);

export const fetchCustomRequests = createAsyncThunk("customRequests/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<CustomRequest[]>("/custom-requests");
    return response.data;
  } catch {
    return rejectWithValue("Using fallback data");
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
      .addCase(submitCustomRequest.pending, (state) => { state.loading = true; state.submitted = false; })
      .addCase(submitCustomRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.submitted = true;
        state.requests.push(action.payload);
      })
      .addCase(submitCustomRequest.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchCustomRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(fetchCustomRequests.rejected, (state) => {
        state.requests = fallbackCustomRequests;
      });
  },
});

export const { resetSubmitted } = customRequestsSlice.actions;
export default customRequestsSlice.reducer;
