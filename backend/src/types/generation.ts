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
  apiSettings: ApiSettings;
  brief: GenerationBrief;
  skillPackageName: string;
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

export interface SkillPackage {
  name: string;
  rootDir: string;
  skillMarkdown: string;
  summary: string;
  templateFiles: string[];
  assetFiles: string[];
}

export type SlideLayout =
  | "hero-statement"
  | "two-column"
  | "insight-cards"
  | "process-flow"
  | "timeline"
  | "comparison"
  | "metric-dashboard"
  | "image-focus"
  | "closing";

export interface VisualPalette {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  ink: string;
  muted: string;
}

export interface VisualFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface VisualTheme {
  name: string;
  palette: VisualPalette;
  fonts: VisualFonts;
  styleNotes: string;
}

export interface SlideMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface SlideDiagram {
  type: "process" | "timeline" | "cycle" | "matrix" | "architecture" | "comparison";
  nodes: string[];
}

export interface SlideVisualAsset {
  kind: "illustration" | "photo" | "icon" | "chart" | "none";
  prompt: string;
  alt: string;
  placement: "right" | "left" | "background" | "banner" | "inline";
}

export interface SlidePlan {
  title: string;
  purpose: string;
  bullets: string[];
  visualHint: string;
  layout: SlideLayout;
  keyMessage: string;
  metrics: SlideMetric[];
  diagram?: SlideDiagram;
  image?: SlideVisualAsset;
}

export interface DeckPlan {
  title: string;
  subtitle: string;
  narrative: string;
  visualTheme: VisualTheme;
  slides: SlidePlan[];
}

export interface RenderedDeck {
  previewHtml: string;
  previewUrl: string;
  downloadUrls: DownloadUrls;
}
