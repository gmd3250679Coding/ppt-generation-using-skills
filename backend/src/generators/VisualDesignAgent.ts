import { chooseSlideLayout, normalizeVisualTheme } from "../design/VisualDefaults.js";
import type {
  DeckPlan,
  GenerationBrief,
  SkillPackage,
  SlideDiagram,
  SlideMetric,
  SlidePlan,
  SlideVisualAsset
} from "../types/generation.js";

function asCleanText(value: unknown, fallback: string, maxLength = 180) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return (text || fallback).slice(0, maxLength);
}

function normalizeBullets(value: unknown, fallback: string[]) {
  const candidates = Array.isArray(value) ? value : [];
  const bullets = candidates
    .map((item) => asCleanText(item, "", 150))
    .filter(Boolean)
    .slice(0, 5);

  return bullets.length > 0 ? bullets : fallback.slice(0, 5);
}

function compactNode(value: string) {
  return value
    .replace(/^[\d.\-、\s]+/, "")
    .replace(/[。；;，,].*$/, "")
    .slice(0, 24);
}

function normalizeMetrics(value: unknown, bullets: string[], index: number): SlideMetric[] {
  const metrics: SlideMetric[] = Array.isArray(value)
    ? value
        .flatMap((item) => {
          const source = item as Partial<SlideMetric>;
          const label = asCleanText(source.label, "", 24);
          const metricValue = asCleanText(source.value, "", 18);

          if (!label || !metricValue) {
            return [];
          }

          const metric: SlideMetric = {
            label,
            value: metricValue,
            detail: source.detail ? asCleanText(source.detail, "", 52) : undefined
          };

          return [metric];
        })
        .slice(0, 3)
    : [];

  if (metrics.length > 0) {
    return metrics;
  }

  return [
    {
      label: "核心要点",
      value: String(Math.max(3, Math.min(5, bullets.length || 3))),
      detail: "项"
    },
    {
      label: "页面定位",
      value: `P${index + 1}`,
      detail: "结构页"
    }
  ];
}

function normalizeDiagram(value: unknown, bullets: string[], layout: SlidePlan["layout"]): SlideDiagram {
  const source = value as Partial<SlideDiagram> | undefined;
  const sourceNodes = Array.isArray(source?.nodes) ? source?.nodes : [];
  const nodes = [...sourceNodes, ...bullets]
    .map((node) => compactNode(asCleanText(node, "", 80)))
    .filter(Boolean)
    .slice(0, layout === "timeline" || layout === "process-flow" ? 5 : 4);

  const fallbackType: SlideDiagram["type"] =
    layout === "timeline" ? "timeline" : layout === "comparison" ? "comparison" : layout === "metric-dashboard" ? "matrix" : "process";
  const requestedType = source?.type;
  const diagramType: SlideDiagram["type"] =
    requestedType && ["process", "timeline", "cycle", "matrix", "architecture", "comparison"].includes(requestedType)
      ? requestedType
      : fallbackType;

  return {
    type: diagramType,
    nodes: nodes.length > 0 ? nodes : ["背景判断", "关键举措", "价值产出"]
  };
}

function normalizeImage(value: unknown, slide: Pick<SlidePlan, "title" | "visualHint" | "keyMessage" | "layout">, brief: GenerationBrief): SlideVisualAsset {
  const source = value as Partial<SlideVisualAsset> | undefined;
  const kind = source?.kind && ["illustration", "photo", "icon", "chart", "none"].includes(source.kind) ? source.kind : "illustration";
  const placement =
    source?.placement && ["right", "left", "background", "banner", "inline"].includes(source.placement)
      ? source.placement
      : slide.layout === "image-focus"
        ? "right"
        : "inline";

  return {
    kind,
    placement,
    prompt: asCleanText(
      source?.prompt,
      `${brief.topic}，${slide.title}，${slide.visualHint}，现代商务演示插画，清晰构图，高对比配色`,
      320
    ),
    alt: asCleanText(source?.alt, `${slide.title} 的视觉插画`, 120)
  };
}

export class VisualDesignAgent {
  enrich(deck: DeckPlan, expectedCount: number, fallback: DeckPlan, brief: GenerationBrief, skill: SkillPackage): DeckPlan {
    const sourceSlides = Array.isArray(deck.slides) ? deck.slides : [];
    const theme = normalizeVisualTheme(deck.visualTheme, brief);
    const fallbackTheme = normalizeVisualTheme(fallback.visualTheme, brief);

    const slides: SlidePlan[] = Array.from({ length: expectedCount }, (_, index) => {
      const fallbackSlide = fallback.slides[index] ?? fallback.slides[fallback.slides.length - 1];
      const source = sourceSlides[index] ?? fallbackSlide;
      const bullets = normalizeBullets(source?.bullets, fallbackSlide?.bullets ?? []);
      const layout = chooseSlideLayout(index, expectedCount, source?.layout);
      const title = asCleanText(source?.title, fallbackSlide?.title || `第 ${index + 1} 页`, 86);
      const purpose = asCleanText(source?.purpose, fallbackSlide?.purpose || "承接整体汇报逻辑", 180);
      const visualHint = asCleanText(source?.visualHint, fallbackSlide?.visualHint || `${brief.style}风格结构化页面`, 220);
      const keyMessage = asCleanText(
        source?.keyMessage,
        bullets[0] || fallbackSlide?.keyMessage || `围绕“${brief.topic}”形成明确判断`,
        130
      );
      const normalizedSlide = {
        title,
        purpose,
        bullets,
        visualHint,
        layout,
        keyMessage,
        metrics: normalizeMetrics(source?.metrics, bullets, index),
        diagram: normalizeDiagram(source?.diagram, bullets, layout),
        image: normalizeImage(source?.image, { title, visualHint, keyMessage, layout }, brief)
      };

      if (layout === "closing") {
        normalizedSlide.diagram = {
          type: "process",
          nodes: ["形成共识", "确认路径", "启动行动"]
        };
      }

      return normalizedSlide;
    });

    return {
      title: asCleanText(deck.title, fallback.title || brief.topic, 120),
      subtitle: asCleanText(deck.subtitle, fallback.subtitle || `${brief.companyName || skill.name} · ${brief.audience || "目标受众"}`, 160),
      narrative: asCleanText(deck.narrative, fallback.narrative || `面向${brief.audience || "目标受众"}的${brief.topic}汇报`, 280),
      visualTheme: deck.visualTheme ? theme : fallbackTheme,
      slides
    };
  }
}
