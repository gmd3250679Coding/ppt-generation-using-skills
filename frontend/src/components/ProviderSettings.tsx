import { KeyRound, Server } from "lucide-react";
import type { ChangeEvent } from "react";
import type { ApiSettings, ProviderType } from "../types/generation";

interface ProviderSettingsProps {
  value: ApiSettings;
  onChange: (value: ApiSettings) => void;
}

const providerOptions: Array<{ value: ProviderType; label: string }> = [
  { value: "compatible", label: "国内/通用 OpenAI 兼容接口" },
  { value: "openai", label: "OpenAI 官方接口" },
  { value: "azure-openai", label: "Azure OpenAI" }
];

const compatibleExamples = [
  {
    name: "阿里百炼",
    endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus"
  },
  {
    name: "腾讯混元",
    endpoint: "https://api.hunyuan.cloud.tencent.com/v1",
    model: "控制台可用模型名"
  },
  {
    name: "DeepSeek",
    endpoint: "https://api.deepseek.com",
    model: "deepseek-chat"
  }
];

export function ProviderSettings({ value, onChange }: ProviderSettingsProps) {
  const update = (patch: Partial<ApiSettings>) => onChange({ ...value, ...patch });

  const handleProviderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    update({ provider: event.target.value as ProviderType });
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Step 02</span>
          <h2>模型与密钥</h2>
        </div>
        <KeyRound aria-hidden="true" />
      </div>

      <div className="form-grid two">
        <label className="field">
          <span>服务商</span>
          <select value={value.provider} onChange={handleProviderChange}>
            {providerOptions.map((provider) => (
              <option key={provider.value} value={provider.value}>
                {provider.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>模型</span>
          <input
            value={value.model}
            onChange={(event) => update({ model: event.target.value })}
            placeholder="例如：qwen-plus、deepseek-chat、hunyuan-turbos-latest"
          />
        </label>
      </div>

      <label className="field">
        <span>API Key</span>
        <input
          type="password"
          value={value.apiKey}
          onChange={(event) => update({ apiKey: event.target.value })}
          placeholder="填写百炼、混元、DeepSeek 等平台的 API Key"
          autoComplete="off"
        />
      </label>

      <label className="field">
        <span>接口地址</span>
        <div className="input-with-icon">
          <Server aria-hidden="true" />
          <input
            value={value.endpoint}
            onChange={(event) => update({ endpoint: event.target.value })}
            required={value.provider !== "openai"}
            placeholder={
              value.provider === "openai"
                ? "可留空，默认由后端使用 OpenAI 官方地址"
                : value.provider === "azure-openai"
                  ? "https://your-resource.openai.azure.com"
                  : "例如：https://dashscope.aliyuncs.com/compatible-mode/v1"
            }
          />
        </div>
        {value.provider !== "openai" && !value.endpoint.trim() ? (
          <small className="field-hint">当前服务商需要填写完整接口地址。</small>
        ) : null}
      </label>

      {value.provider === "compatible" ? (
        <div className="provider-examples" aria-label="国内兼容接口示例">
          {compatibleExamples.map((example) => (
            <div className="provider-example" key={example.name}>
              <strong>{example.name}</strong>
              <span>{example.endpoint}</span>
              <small>模型示例：{example.model}</small>
            </div>
          ))}
        </div>
      ) : null}

      {value.provider === "azure-openai" ? (
        <div className="form-grid two">
          <label className="field">
            <span>部署名称</span>
            <input
              value={value.deployment}
              onChange={(event) => update({ deployment: event.target.value })}
              placeholder="Azure deployment name"
            />
          </label>
          <label className="field">
            <span>API Version</span>
            <input
              value={value.apiVersion}
              onChange={(event) => update({ apiVersion: event.target.value })}
              placeholder="2024-10-21"
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
