import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { sendAssistantChat } from "@/api/assistantApi";
import type { AssistantMessage, AssistantAction } from "@/api/assistantApi";
import type { RootState } from "@/store";
import { logout } from "./authSlice";

interface AssistantState {
  messages: AssistantMessage[];
  lastProductIds: string[];
  pendingAction: AssistantAction | null;
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: AssistantState = {
  messages: [],
  lastProductIds: [],
  pendingAction: null,
  status: "idle",
  error: null,
};

export const submitMessage = createAsyncThunk(
  "assistant/submit",
  async (_content: string, { getState, rejectWithValue }) => {
    // The pending reducer has already pushed the user turn, so send the current transcript.
    const messages = (getState() as RootState).assistant.messages;
    try {
      return await sendAssistantChat(messages);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) return rejectWithValue("You're chatting a bit fast — give the concierge a moment.");
      return rejectWithValue("The concierge is unavailable right now — you can browse normally.");
    }
  }
);

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    clearPendingAction: (state) => { state.pendingAction = null; },
    pushAssistantNote: (state, action: PayloadAction<string>) => {
      state.messages.push({ role: "assistant", content: action.payload });
    },
    dismissError: (state) => { state.error = null; state.status = "idle"; },
    resetChat: (state) => {
      state.messages = [];
      state.lastProductIds = [];
      state.pendingAction = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitMessage.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.pendingAction = null;
        state.messages.push({ role: "user", content: action.meta.arg });
      })
      .addCase(submitMessage.fulfilled, (state, action) => {
        state.status = "idle";
        state.messages.push({ role: "assistant", content: action.payload.reply });
        state.lastProductIds = action.payload.productIds || [];
        const a = action.payload.action;
        state.pendingAction = a && a.type !== "none" ? a : null;
      })
      .addCase(submitMessage.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) || "Something went wrong.";
      })
      // Clear the conversation on logout (don't leak chat across sessions).
      .addCase(logout, (state) => {
        state.messages = [];
        state.lastProductIds = [];
        state.pendingAction = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { clearPendingAction, pushAssistantNote, dismissError, resetChat } = assistantSlice.actions;
export default assistantSlice.reducer;
