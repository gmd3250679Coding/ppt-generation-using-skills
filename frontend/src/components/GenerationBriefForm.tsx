import { WandSparkles } from "lucide-react";
import type { FormEvent } from "react";
import type { GenerationBrief, OutputFormat } from "../types/generation";

interface GenerationBriefFormProps {
  value: GenerationBrief;
  canSubmit: boolean;
  isSubmitting: boolean;
  onChange: (value: GenerationBrief) => void;
  onSubmit: () => void;
}

const outputFormats: OutputFormat[] = ["pptx", "html", "pdf"];

export function GenerationBriefForm({
  value,
  canSubmit,
  isSubmitting,
  onChange,
  onSubmit
}: GenerationBriefFormProps) {
  const update = (patch: Partial<GenerationBrief>) => onChange({ ...value, ...patch });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="panel brief-panel" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Step 03</span>
          <h2>生成需求</h2>
        </div>
        <span className="page-count">{value.pageCount} 页</span>
      </div>

      <div className="form-grid two">
        <label className="field">
          <span>公司 / 项目</span>
          <input
            value={value.companyName}
            onChange={(event) => update({ companyName: event.target.value })}
            placeholder="例如：海岳智能"
          />
        </label>

        <label className="field">
          <span>目标受众</span>
          <input
            value={value.audience}
            onChange={(event) => update({ audience: event.target.value })}
            placeholder="例如：客户高层、内部评审、销售团队"
          />
        </label>
      </div>

      <label className="field">
        <span>演示主题</span>
        <input
          value={value.topic}
          onChange={(event) => update({ topic: event.target.value })}
          placeholder="写清楚这份 PPT 要解决的问题"
          required
        />
      </label>

      <div className="form-grid three">
        <label className="field">
          <span>语言</span>
          <select value={value.language} onChange={(event) => update({ language: event.target.value })}>
            <option value="中文">中文</option>
            <option value="英文">英文</option>
            <option value="中英双语">中英双语</option>
          </select>
        </label>

        <label className="field">
          <span>风格</span>
          <input
            value={value.style}
            onChange={(event) => update({ style: event.target.value })}
            placeholder="例如：咨询汇报、产品发布"
          />
        </label>

        <label className="field">
          <span>输出</span>
          <select
            value={value.outputFormat}
            onChange={(event) => update({ outputFormat: event.target.value as OutputFormat })}
          >
            {outputFormats.map((format) => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>页数</span>
        <input
          type="range"
          min="4"
          max="40"
          value={value.pageCount}
          onChange={(event) => update({ pageCount: Number(event.target.value) })}
        />
      </label>

      <label className="field">
        <span>表达语气</span>
        <input
          value={value.tone}
          onChange={(event) => update({ tone: event.target.value })}
          placeholder="例如：专业、清晰、有说服力"
        />
      </label>

      <label className="field">
        <span>补充材料</span>
        <textarea
          value={value.materials}
          onChange={(event) => update({ materials: event.target.value })}
          placeholder="粘贴业务背景、数据、目录草稿或必须覆盖的要点"
          rows={7}
        />
      </label>

      <button className="primary-button" type="submit" disabled={!canSubmit || isSubmitting}>
        <WandSparkles aria-hidden="true" />
        {isSubmitting ? "提交中" : "生成 PPT"}
      </button>
    </form>
  );
}
