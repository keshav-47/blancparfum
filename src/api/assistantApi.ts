import apiClient from "@/api/apiClient";

export type AssistantRole = "user" | "assistant";
export interface AssistantMessage {
  role: AssistantRole;
  content: string;
}

export type AssistantActionType =
  | "none"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "sign_in"
  | "add_address"
  | "select_address"
  | "place_order"
  | "go_to_checkout";

export interface AssistantAddressDraft {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface AssistantAction {
  type: AssistantActionType;
  productId?: string;
  sizeMl?: number;
  unitPrice?: number;
  quantity?: number;
  address?: AssistantAddressDraft;
  addressId?: string;
}

export interface AssistantChatResponse {
  reply: string;
  productIds: string[];
  action: AssistantAction;
}

export interface AssistantCartContextItem {
  productId: string;
  sizeMl: number;
  quantity: number;
}

// LLM calls take longer than the shared apiClient's 10s default, so override to 30s.
export async function sendAssistantChat(
  messages: AssistantMessage[],
  cartItems: AssistantCartContextItem[] = []
): Promise<AssistantChatResponse> {
  const res = await apiClient.post<AssistantChatResponse>("/assistant/chat", { messages, cartItems }, { timeout: 30000 });
  return res.data; // apiClient unwraps { success, data }
}
