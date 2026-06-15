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
  open: boolean; // is the full-screen concierge chat open (global, any page)
}

const initialState: AssistantState = {
  messages: [],
  lastProductIds: [],
  pendingAction: null,
  status: "idle",
  error: null,
  open: false,
};

const askConcierge = async (
  getState: () => unknown,
  rejectWithValue: (v: string) => unknown,
) => {
  const messages = (getState() as RootState).assistant.messages;
  try {
    return await sendAssistantChat(messages);
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 429) return rejectWithValue("You're chatting a bit fast — give the concierge a moment.");
    return rejectWithValue("The concierge is unavailable right now — you can browse normally.");
  }
};

export const submitMessage = createAsyncThunk(
  "assistant/submit",
  // The pending reducer has already pushed the user turn, so send the current transcript.
  async (_content: string, { getState, rejectWithValue }) => askConcierge(getState, rejectWithValue),
);

// Re-ask the concierge WITHOUT adding a user turn — used to let it drive the next
// step on its own (e.g. continue from "added to cart" to "place your order").
export const continueChat = createAsyncThunk(
  "assistant/continue",
  async (_: void, { getState, rejectWithValue }) => askConcierge(getState, rejectWithValue),
);

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    openChat: (state) => { state.open = true; },
    closeChat: (state) => { state.open = false; },
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
    const applyReply = (state: AssistantState, payload: { reply: string; productIds?: string[]; action?: AssistantAction }) => {
      state.status = "idle";
      state.messages.push({ role: "assistant", content: payload.reply });
      state.lastProductIds = payload.productIds || [];
      const a = payload.action;
      state.pendingAction = a && a.type !== "none" ? a : null;
    };
    const onError = (state: AssistantState, payload: unknown) => {
      state.status = "error";
      state.error = (payload as string) || "Something went wrong.";
    };
    builder
      .addCase(submitMessage.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.pendingAction = null;
        state.open = true; // sending (e.g. from the hero) opens the full-screen chat
        state.messages.push({ role: "user", content: action.meta.arg });
      })
      .addCase(submitMessage.fulfilled, (state, action) => applyReply(state, action.payload))
      .addCase(submitMessage.rejected, (state, action) => onError(state, action.payload))
      // Continue (no user turn) — let the concierge propose the next step.
      .addCase(continueChat.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.pendingAction = null;
      })
      .addCase(continueChat.fulfilled, (state, action) => applyReply(state, action.payload))
      .addCase(continueChat.rejected, (state, action) => onError(state, action.payload))
      // Clear the conversation on logout (don't leak chat across sessions).
      .addCase(logout, (state) => {
        state.messages = [];
        state.lastProductIds = [];
        state.pendingAction = null;
        state.status = "idle";
        state.error = null;
        state.open = false;
      });
  },
});

export const { openChat, closeChat, clearPendingAction, pushAssistantNote, dismissError, resetChat } =
  assistantSlice.actions;
export default assistantSlice.reducer;
