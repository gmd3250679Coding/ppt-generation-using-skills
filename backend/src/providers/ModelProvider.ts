import type { ApiSettings, DeckPlan } from "../types/generation.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelProvider {
  generateJson(settings: ApiSettings, messages: ChatMessage[]): Promise<DeckPlan>;
}
