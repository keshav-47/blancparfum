import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { sendAssistantChat } from "@/api/assistantApi";
import type { AssistantMessage, AssistantAction, AssistantChatResponse } from "@/api/assistantApi";
import type { RootState } from "@/store";
import type { CartItem } from "@/types";
import { logout } from "./authSlice";

interface AssistantState {
  messages: AssistantMessage[];
  lastProductIds: string[];
  pendingAction: AssistantAction | null;
  serverAuthenticated: boolean | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  open: boolean; // is the full-screen concierge chat open (global, any page)
}

const initialState: AssistantState = {
  messages: [],
  lastProductIds: [],
  pendingAction: null,
  serverAuthenticated: null,
  status: "idle",
  error: null,
  open: false,
};

const latestUserContent = (messages: AssistantMessage[]) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") return messages[i].content.toLowerCase();
  }
  return "";
};

const asksForCartReview = (content: string) =>
  /\bcart\b/.test(content) &&
  /\b(show|view|review|see|check|open|what|whats)\b/.test(content) &&
  !/\b(place|order|checkout|pay|payment)\b/.test(content);

const asksToRemoveFromCart = (content: string) =>
  /\b(remove|delete|drop)\b/.test(content) || /\btake\s+(.+?\s+)?out\b/.test(content);

const asksToCheckout = (content: string) =>
  /\bcheckout\b/.test(content) ||
  /\bpay\b/.test(content) ||
  /\bbuy\b/.test(content) ||
  (/\border\b/.test(content) && /\b(place|confirm|complete|finish)\b/.test(content));

const findRemovalItem = (content: string, cartItems: CartItem[]) => {
  if (cartItems.length === 1) return cartItems[0];
  return cartItems.find((item) => content.includes(item.name.toLowerCase()));
};

const missedLocalCart = (response: AssistantChatResponse) => {
  const reply = response.reply.toLowerCase();
  return (
    response.action?.type === "sign_in" ||
    response.action?.type === "none" ||
    /cart is empty|sign in to view|need to sign in|you need to sign in/.test(reply)
  );
};

const impliesServerAuthentication = (response: AssistantChatResponse) => {
  const reply = response.reply.toLowerCase();
  return (
    reply.includes("you're signed in") ||
    reply.includes("you are signed in") ||
    response.action?.type === "place_order" ||
    response.action?.type === "select_address" ||
    response.action?.type === "add_address"
  );
};

const repeatedLocalAdd = (response: AssistantChatResponse, cartItems: CartItem[]) => {
  const action = response.action;
  if (action?.type !== "add_to_cart" || !action.productId) return undefined;
  const size = action.sizeMl ?? 30;
  return cartItems.find((item) => item.productId === action.productId && item.size === size);
};

const pendingLocalRemoval = (response: AssistantChatResponse, cartItems: CartItem[]) => {
  const action = response.action;
  if (action?.type !== "remove_from_cart" || !action.productId) return undefined;
  const size = action.sizeMl;
  return cartItems.find((item) => item.productId === action.productId && (size == null || item.size === size));
};

const applyLocalCartFallback = (
  response: AssistantChatResponse,
  messages: AssistantMessage[],
  cartItems: CartItem[],
  isAuthenticated: boolean,
): AssistantChatResponse => {
  if (!cartItems.length) return response;

  const content = latestUserContent(messages);
  if (
    isAuthenticated &&
    asksToCheckout(content) &&
    response.action?.type !== "place_order"
  ) {
    return {
      ...response,
      reply: "Review your cart and add a shipping address below to place your order securely.",
      productIds: [],
      action: { type: "place_order" },
    };
  }

  const itemToRemove = pendingLocalRemoval(response, cartItems);
  if (itemToRemove) {
    return {
      ...response,
      reply: `Ready to remove ${itemToRemove.name} (${itemToRemove.size}ml) from your cart?`,
      productIds: [],
      action: { type: "remove_from_cart", productId: itemToRemove.productId, sizeMl: itemToRemove.size },
    };
  }

  const alreadyAdded = repeatedLocalAdd(response, cartItems);
  if (alreadyAdded) {
    return {
      ...response,
      reply: `${alreadyAdded.name} (${alreadyAdded.size}ml) is in your cart. Here's your cart when you're ready to checkout.`,
      productIds: [],
      action: { type: "view_cart" },
    };
  }

  if (!missedLocalCart(response)) return response;

  if (asksForCartReview(content)) {
    return {
      ...response,
      reply: "Here's what is in your cart.",
      productIds: [],
      action: { type: "view_cart" },
    };
  }

  if (asksToRemoveFromCart(content)) {
    const item = findRemovalItem(content, cartItems);
    if (item) {
      return {
        ...response,
        reply: `Ready to remove ${item.name} (${item.size}ml) from your cart?`,
        productIds: [],
        action: { type: "remove_from_cart", productId: item.productId, sizeMl: item.size },
      };
    }
  }

  return response;
};

const askConcierge = async (
  getState: () => unknown,
  rejectWithValue: (v: string) => unknown,
) => {
  const state = getState() as RootState;
  const messages = state.assistant.messages;
  const cartItems = state.cart.items.map((item) => ({
    productId: item.productId,
    sizeMl: item.size,
    quantity: item.quantity,
  }));
  try {
    const response = await sendAssistantChat(messages, cartItems);
    return applyLocalCartFallback(response, messages, state.cart.items, state.auth.isAuthenticated);
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
    // Resolving an action also clears the floating product card for that turn —
    // otherwise the recommended-product image lingers at the bottom after the
    // action card is gone (looks like the card "stayed there").
    clearPendingAction: (state) => { state.pendingAction = null; state.lastProductIds = []; },
    clearProductResults: (state) => { state.lastProductIds = []; },
    pushAssistantNote: (state, action: PayloadAction<string>) => {
      state.messages.push({ role: "assistant", content: action.payload });
    },
    dismissError: (state) => { state.error = null; state.status = "idle"; },
    resetChat: (state) => {
      state.messages = [];
      state.lastProductIds = [];
      state.pendingAction = null;
      state.serverAuthenticated = null;
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
      if (impliesServerAuthentication({ reply: payload.reply, productIds: payload.productIds || [], action: a || { type: "none" } })) {
        state.serverAuthenticated = true;
      }
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
        state.serverAuthenticated = null;
        state.status = "idle";
        state.error = null;
        state.open = false;
      });
  },
});

export const { openChat, closeChat, clearPendingAction, clearProductResults, pushAssistantNote, dismissError, resetChat } =
  assistantSlice.actions;
export default assistantSlice.reducer;
