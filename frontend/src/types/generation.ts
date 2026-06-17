export type ProviderType = "openai" | "azure-openai" | "compatible";

export type JobStatus =
  | "Created"
  | "ValidatingSkill"
  | "BuildingPrompt"
  | "GeneratingOutline"
  | "GeneratingSlides"
  | "Rendering"
  | "Ready"
  | "Failed";

export type OutputFormat = "pptx" | "html" | "pdf";

export interface ApiSettings {
  provider: ProviderType;
  apiKey: string;
  endpoint: string;
  model: string;
  deployment: string;
  apiVersion: string;
}

export interface SkillUpload {
  file: File | null;
  packageName: string;
}

export interface GenerationBrief {
  companyName: string;
  topic: string;
  audience: string;
  pageCount: number;
  language: string;
  style: string;
  tone: string;
  materials: string;
  outputFormat: OutputFormat;
}

export interface GenerationRequest {
  skill: SkillUpload;
  apiSettings: ApiSettings;
  brief: GenerationBrief;
}

export interface DownloadUrls {
  pptx?: string;
  html?: string;
  pdf?: string;
}

export interface GenerationJob {
  id: string;
  status: JobStatus;
  progress: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  previewUrl?: string;
  previewHtml?: string;
  downloadUrls?: DownloadUrls;
  error?: string;
}

export interface JobStep {
  status: JobStatus;
  title: string;
  description: string;
}
