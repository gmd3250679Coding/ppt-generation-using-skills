import { CheckCircle2, Circle, LoaderCircle, XCircle } from "lucide-react";
import type { GenerationJob, JobStatus, JobStep } from "../types/generation";

const steps: JobStep[] = [
  { status: "Created", title: "创建作业", description: "接收表单与上传文件" },
  { status: "ValidatingSkill", title: "校验 Skill", description: "解析规则、模板和 assets" },
  { status: "BuildingPrompt", title: "构建提示词", description: "合并 brief 与品牌约束" },
  { status: "GeneratingOutline", title: "生成大纲", description: "规划章节和页面结构" },
  { status: "GeneratingSlides", title: "生成页面", description: "产出逐页内容和视觉建议" },
  { status: "Rendering", title: "渲染结果", description: "生成预览和导出文件" },
  { status: "Ready", title: "完成", description: "文件可预览和下载" }
];

interface JobProgressProps {
  job: GenerationJob | null;
  error: string | null;
  onReset: () => void;
}

function getStepClass(job: GenerationJob | null, status: JobStatus) {
  if (!job) return "upcoming";
  if (job.status === "Failed" && status === "Ready") return "failed";

  const currentIndex = steps.findIndex((step) => step.status === job.status);
  const stepIndex = steps.findIndex((step) => step.status === status);

  if (stepIndex < currentIndex || job.status === "Ready") return "complete";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

function StepIcon({ state }: { state: string }) {
  if (state === "complete") return <CheckCircle2 aria-hidden="true" />;
  if (state === "active") return <LoaderCircle className="spin" aria-hidden="true" />;
  if (state === "failed") return <XCircle aria-hidden="true" />;
  return <Circle aria-hidden="true" />;
}

export function JobProgress({ job, error, onReset }: JobProgressProps) {
  return (
    <section className="panel progress-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Step 04</span>
          <h2>生成进度</h2>
        </div>
        {job ? <span className="progress-value">{job.progress}%</span> : null}
      </div>

      {job ? (
        <>
          <div className="progress-bar" aria-label="生成进度">
            <span style={{ width: `${job.progress}%` }} />
          </div>
          <p className="status-message">{job.message}</p>
        </>
      ) : (
        <p className="muted">提交需求后会显示作业状态。</p>
      )}

      <div className="timeline">
        {steps.map((step) => {
          const state = getStepClass(job, step.status);

          return (
            <div className={`timeline-item ${state}`} key={step.status}>
              <StepIcon state={state} />
              <div>
                <strong>{step.title}</strong>
                <span>{step.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      {job ? (
        <button className="ghost-button" type="button" onClick={onReset}>
          新建作业
        </button>
      ) : null}
    </section>
  );
}
