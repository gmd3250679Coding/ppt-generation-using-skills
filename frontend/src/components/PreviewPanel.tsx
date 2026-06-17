import { Download, ExternalLink, MonitorPlay } from "lucide-react";
import type { GenerationJob, OutputFormat } from "../types/generation";

interface PreviewPanelProps {
  job: GenerationJob | null;
}

const downloadLabels: Record<OutputFormat, string> = {
  pptx: "PPTX",
  html: "HTML",
  pdf: "PDF"
};

export function PreviewPanel({ job }: PreviewPanelProps) {
  const isReady = job?.status === "Ready";
  const htmlDataUrl =
    job?.previewHtml && isReady
      ? `data:text/html;charset=utf-8,${encodeURIComponent(job.previewHtml)}`
      : undefined;
  const previewUrl = job?.previewUrl ?? htmlDataUrl;

  return (
    <section className="panel preview-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Preview</span>
          <h2>PPT 预览与导出</h2>
        </div>
        <MonitorPlay aria-hidden="true" />
      </div>

      <div className="preview-frame">
        {previewUrl && isReady ? (
          job.previewHtml ? (
            <iframe title="PPT 预览" srcDoc={job.previewHtml} />
          ) : (
            <iframe title="PPT 预览" src={previewUrl} />
          )
        ) : (
          <div className="empty-preview">
            <MonitorPlay aria-hidden="true" />
            <span>生成完成后展示预览页面</span>
          </div>
        )}
      </div>

      <div className="download-row">
        {previewUrl && isReady ? (
          <a className="secondary-button" href={previewUrl} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            打开预览
          </a>
        ) : null}

        {(["pptx", "html", "pdf"] as OutputFormat[]).map((format) => {
          const url = format === "html" ? job?.downloadUrls?.html ?? htmlDataUrl : job?.downloadUrls?.[format];
          const disabled = !isReady || !url || url.startsWith("#");

          return disabled ? (
            <button className="secondary-button disabled" type="button" disabled key={format}>
              <Download aria-hidden="true" />
              {downloadLabels[format]}
            </button>
          ) : (
            <a className="secondary-button" href={url} download key={format}>
              <Download aria-hidden="true" />
              {downloadLabels[format]}
            </a>
          );
        })}
      </div>
    </section>
  );
}
