import { KeyRound, Server } from "lucide-react";
import type { ChangeEvent } from "react";
import type { ApiSettings, ProviderType } from "../types/generation";

interface ProviderSettingsProps {
  value: ApiSettings;
  onChange: (value: ApiSettings) => void;
}

const providerLabels: Record<ProviderType, string> = {
  openai: "OpenAI",
  "azure-openai": "Azure OpenAI",
  compatible: "OpenAI 兼容接口"
};

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
            {Object.entries(providerLabels).map(([provider, label]) => (
              <option key={provider} value={provider}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>模型</span>
          <input
            value={value.model}
            onChange={(event) => update({ model: event.target.value })}
            placeholder="例如：gpt-4.1-mini"
          />
        </label>
      </div>

      <label className="field">
        <span>API Key</span>
        <input
          type="password"
          value={value.apiKey}
          onChange={(event) => update({ apiKey: event.target.value })}
          placeholder="仅发送到本地后端，不写入浏览器存储"
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
                : "https://your-resource.openai.azure.com 或兼容 API base URL"
            }
          />
        </div>
        {value.provider !== "openai" && !value.endpoint.trim() ? (
          <small className="field-hint">当前服务商需要填写完整接口地址。</small>
        ) : null}
      </label>

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
