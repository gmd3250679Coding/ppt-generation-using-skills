import type { GenerationBrief, SlideLayout, VisualFonts, VisualPalette, VisualTheme } from "../types/generation.js";

const hexPattern = /^[0-9A-F]{6}$/i;

const enterprisePalette: VisualPalette = {
  background: "F6F8FB",
  surface: "FFFFFF",
  primary: "0B5CAD",
  secondary: "0F766E",
  accent: "F59E0B",
  ink: "14213D",
  muted: "5B677A"
};

const techPalette: VisualPalette = {
  background: "F4F7FB",
  surface: "FFFFFF",
  primary: "155E75",
  secondary: "4F46E5",
  accent: "F97316",
  ink: "111827",
  muted: "556171"
};

const executivePalette: VisualPalette = {
  background: "F7F7F4",
  surface: "FFFFFF",
  primary: "1F4E5F",
  secondary: "6D5A3D",
  accent: "C2410C",
  ink: "1F2933",
  muted: "646B75"
};

const magazinePalette: VisualPalette = {
  background: "F8F7F3",
  surface: "FFFFFF",
  primary: "7F1D1D",
  secondary: "1D4ED8",
  accent: "16A34A",
  ink: "1C1917",
  muted: "66615B"
};

export const layoutCycle: SlideLayout[] = [
  "hero-statement",
  "two-column",
  "insight-cards",
  "process-flow",
  "metric-dashboard",
  "timeline",
  "comparison",
  "image-focus"
];

export function normalizeHex(value: unknown, fallback: string) {
  const raw = String(value ?? "")
    .replace("#", "")
    .trim();

  return hexPattern.test(raw) ? raw.toUpperCase() : fallback;
}

function selectPalette(style: string) {
  const normalized = style.toLowerCase();

  if (/ai|科技|智能|数字|数据|未来|tech/.test(normalized)) {
    return techPalette;
  }

  if (/高管|董事|战略|汇报|咨询|executive|consult/.test(normalized)) {
    return executivePalette;
  }

  if (/杂志|创意|发布|品牌|magazine|creative/.test(normalized)) {
    return magazinePalette;
  }

  return enterprisePalette;
}

export function createDefaultVisualTheme(brief: GenerationBrief): VisualTheme {
  const palette = selectPalette(`${brief.style} ${brief.topic}`);

  return {
    name: brief.style || "企业咨询视觉系统",
    palette,
    fonts: {
      heading: /中文|汉语|zh/i.test(brief.language) ? "Microsoft YaHei" : "Aptos Display",
      body: /中文|汉语|zh/i.test(brief.language) ? "Microsoft YaHei" : "Aptos",
      mono: "Aptos Mono"
    },
    styleNotes: "高对比文字、清晰留白、少量强调色、每页至少一个结构化视觉对象"
  };
}

export function normalizeVisualTheme(theme: Partial<VisualTheme> | undefined, brief: GenerationBrief): VisualTheme {
  const fallback = createDefaultVisualTheme(brief);
  const palette = (theme?.palette ?? {}) as Partial<VisualPalette>;
  const fonts = (theme?.fonts ?? {}) as Partial<VisualFonts>;

  return {
    name: String(theme?.name || fallback.name).slice(0, 80),
    palette: {
      background: normalizeHex(palette.background, fallback.palette.background),
      surface: normalizeHex(palette.surface, fallback.palette.surface),
      primary: normalizeHex(palette.primary, fallback.palette.primary),
      secondary: normalizeHex(palette.secondary, fallback.palette.secondary),
      accent: normalizeHex(palette.accent, fallback.palette.accent),
      ink: normalizeHex(palette.ink, fallback.palette.ink),
      muted: normalizeHex(palette.muted, fallback.palette.muted)
    },
    fonts: {
      heading: String(fonts.heading || fallback.fonts.heading).slice(0, 80),
      body: String(fonts.body || fallback.fonts.body).slice(0, 80),
      mono: String(fonts.mono || fallback.fonts.mono).slice(0, 80)
    },
    styleNotes: String(theme?.styleNotes || fallback.styleNotes).slice(0, 220)
  };
}

export function chooseSlideLayout(index: number, total: number, requested?: string): SlideLayout {
  if (requested && layoutCycle.includes(requested as SlideLayout)) {
    return requested as SlideLayout;
  }

  if (index === total - 1) {
    return "closing";
  }

  return layoutCycle[index % layoutCycle.length];
}
