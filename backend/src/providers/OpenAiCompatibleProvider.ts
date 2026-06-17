import type { ApiSettings, DeckPlan } from "../types/generation.js";
import type { ChatMessage, ModelProvider } from "./ModelProvider.js";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

function assertHttpUrl(value: string, message: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(message);
    }

    return url;
  } catch {
    throw new Error(message);
  }
}

function trimJsonEnvelope(content: string) {
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch?.[1] ?? content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("模型响应不是有效 JSON");
  }

  return candidate.slice(start, end + 1);
}

function openAiEndpoint(settings: ApiSettings) {
  if (settings.provider === "azure-openai") {
    if (!settings.endpoint.trim()) {
      throw new Error("Azure OpenAI 必须填写接口地址");
    }

    const endpoint = settings.endpoint.replace(/\/$/, "");
    assertHttpUrl(endpoint, "Azure OpenAI 接口地址必须是完整的 http(s) URL");
    const deployment = encodeURIComponent(settings.deployment || settings.model);
    const apiVersion = settings.apiVersion || "2024-10-21";
    return `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  }

  if (settings.provider === "compatible" && !settings.endpoint.trim()) {
    throw new Error("OpenAI 兼容接口必须填写 base URL");
  }

  const baseUrl =
    settings.provider === "openai"
      ? settings.endpoint || "https://api.openai.com/v1"
      : settings.endpoint.replace(/\/$/, "");
  assertHttpUrl(baseUrl, "模型接口地址必须是完整的 http(s) URL");

  return `${baseUrl.replace(/\/$/, "")}/chat/completions`;
}

function authHeaders(settings: ApiSettings): Record<string, string> {
  if (settings.provider === "azure-openai") {
    return { "api-key": settings.apiKey };
  }

  return { Authorization: `Bearer ${settings.apiKey}` };
}

function describeFetchFailure(endpoint: string, error: unknown) {
  if (!(error instanceof Error)) {
    return `模型接口网络请求失败：${String(error)}`;
  }

  const cause = error.cause as { code?: string; message?: string } | undefined;
  const causeText = cause?.code || cause?.message;

  try {
    const url = new URL(endpoint);
    const suffix = causeText ? `（${causeText}）` : "";

    return `模型接口网络请求失败，无法连接 ${url.host}${suffix}。请检查本机网络、代理/VPN，或在“接口地址”中填写可访问的 OpenAI 兼容 base URL。`;
  } catch {
    return causeText ? `模型接口网络请求失败：${causeText}` : `模型接口网络请求失败：${error.message}`;
  }
}

async function readJsonResponse(response: Response): Promise<ChatCompletionResponse> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as ChatCompletionResponse;
  } catch {
    throw new Error(`模型接口返回了非 JSON 响应：${text.slice(0, 160)}`);
  }
}

export class OpenAiCompatibleProvider implements ModelProvider {
  async generateJson(settings: ApiSettings, messages: ChatMessage[]): Promise<DeckPlan> {
    const endpoint = openAiEndpoint(settings);
    console.info(`[model-provider] POST ${endpoint}`);

    let response: Response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(settings)
        },
        body: JSON.stringify({
          model: settings.provider === "azure-openai" ? undefined : settings.model,
          messages,
          temperature: 0.4,
          response_format: { type: "json_object" }
        })
      });
    } catch (error) {
      throw new Error(describeFetchFailure(endpoint, error));
    }

    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.error?.message || `模型接口调用失败：${response.status}`);
    }

    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("模型响应为空");
    }

    return JSON.parse(trimJsonEnvelope(content)) as DeckPlan;
  }
}
