import apiClient from "@/api/apiClient";

export type AssistantRole = "user" | "assistant";
export interface AssistantMessage {
  role: AssistantRole;
  content: string;
}

export type AssistantActionType = "none" | "add_to_cart" | "go_to_checkout" | "sign_in" | "add_address";

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
}

export interface AssistantChatResponse {
  reply: string;
  productIds: string[];
  action: AssistantAction;
}

// LLM calls take longer than the shared apiClient's 10s default → override to 30s.
export async function sendAssistantChat(messages: AssistantMessage[]): Promise<AssistantChatResponse> {
  const res = await apiClient.post<AssistantChatResponse>("/assistant/chat", { messages }, { timeout: 30000 });
  return res.data; // apiClient unwraps { success, data }
}
