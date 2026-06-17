import { Boxes, ShieldCheck } from "lucide-react";
import { GenerationBriefForm } from "../components/GenerationBriefForm";
import { JobProgress } from "../components/JobProgress";
import { PreviewPanel } from "../components/PreviewPanel";
import { ProviderSettings } from "../components/ProviderSettings";
import { PptShowcaseCarousel } from "../components/PptShowcaseCarousel";
import { SkillUploader } from "../components/SkillUploader";
import { useGenerationJob } from "../hooks/useGenerationJob";
import type { ApiSettings, GenerationBrief, SkillUpload } from "../types/generation";
import { useState } from "react";

const defaultSkill: SkillUpload = {
  file: null,
  packageName: ""
};

const defaultApiSettings: ApiSettings = {
  provider: "compatible",
  apiKey: "",
  endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  model: "qwen-plus",
  deployment: "",
  apiVersion: ""
};

const defaultBrief: GenerationBrief = {
  companyName: "",
  topic: "",
  audience: "",
  pageCount: 12,
  language: "中文",
  style: "企业咨询汇报",
  tone: "专业、清晰、有说服力",
  materials: "",
  outputFormat: "pptx"
};

export function WorkspacePage() {
  const [skill, setSkill] = useState<SkillUpload>(defaultSkill);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(defaultApiSettings);
  const [brief, setBrief] = useState<GenerationBrief>(defaultBrief);
  const { job, isSubmitting, error, submit, reset } = useGenerationJob();

  const canSubmit =
    Boolean(brief.topic.trim()) &&
    Boolean(apiSettings.apiKey.trim()) &&
    Boolean(apiSettings.model.trim()) &&
    (apiSettings.provider === "openai" || Boolean(apiSettings.endpoint.trim())) &&
    Boolean(skill.file || skill.packageName.trim());

  const submitJob = () => {
    if (!canSubmit) return;
    void submit({ skill, apiSettings, brief });
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <Boxes aria-hidden="true" />
          <div>
            <span>PPT Skill Workspace</span>
            <strong>本地演示稿生成工作台</strong>
          </div>
        </div>

        <div className="security-note">
          <ShieldCheck aria-hidden="true" />
          <span>支持百炼、混元、DeepSeek 等兼容接口，密钥仅提交到本地服务</span>
        </div>
      </header>

      <section className="workspace-grid">
        <div className="left-column">
          <SkillUploader value={skill} onChange={setSkill} />
          <ProviderSettings value={apiSettings} onChange={setApiSettings} />
        </div>

        <div className="center-column">
          <PptShowcaseCarousel />
          <GenerationBriefForm
            value={brief}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            onChange={setBrief}
            onSubmit={submitJob}
          />
        </div>

        <div className="right-column">
          <JobProgress job={job} error={error} onReset={reset} />
          <PreviewPanel job={job} />
        </div>
      </section>
    </main>
  );
}
