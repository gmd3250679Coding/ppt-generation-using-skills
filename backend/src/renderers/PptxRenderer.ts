import { createRequire } from "node:module";
import type { DeckPlan, GenerationBrief, SkillPackage } from "../types/generation.js";

const require = createRequire(import.meta.url);
const PptxGenJS = require("pptxgenjs") as typeof import("pptxgenjs").default;

const blue = "2A6F97";
const ink = "172033";
const muted = "4D5B6C";

function addSlideNumber(slide: any, index: number, brief: GenerationBrief) {
  slide.addText(`${brief.companyName || "PPT"} · ${String(index).padStart(2, "0")}`, {
    x: 0.55,
    y: 0.35,
    w: 8,
    h: 0.25,
    fontSize: 8,
    bold: true,
    color: blue,
    margin: 0
  });
}

export async function writePptx(filePath: string, deck: DeckPlan, brief: GenerationBrief, skill: SkillPackage) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "PPT Skill Workspace";
  pptx.company = brief.companyName || skill.name;
  pptx.subject = brief.topic;
  pptx.title = deck.title;
  pptx.theme = {
    headFontFace: "Arial",
    bodyFontFace: "Arial"
  };

  const cover = pptx.addSlide();
  cover.background = { color: "F4F8FA" };
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: blue }, line: { color: blue } });
  cover.addText(`${brief.companyName || skill.name} · ${brief.language}`, {
    x: 0.75,
    y: 1.05,
    w: 9,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: blue,
    margin: 0
  });
  cover.addText(deck.title, {
    x: 0.75,
    y: 1.65,
    w: 10.8,
    h: 1.35,
    fontSize: 34,
    bold: true,
    color: ink,
    breakLine: false,
    fit: "shrink",
    margin: 0
  });
  cover.addText(deck.subtitle || deck.narrative, {
    x: 0.78,
    y: 3.18,
    w: 9.6,
    h: 0.8,
    fontSize: 15,
    color: muted,
    fit: "shrink",
    margin: 0
  });
  cover.addText([brief.audience || "目标受众", brief.style, skill.name].join("  |  "), {
    x: 0.78,
    y: 6.35,
    w: 10.6,
    h: 0.3,
    fontSize: 10,
    color: muted,
    margin: 0
  });

  deck.slides.forEach((deckSlide, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    addSlideNumber(slide, index + 1, brief);
    slide.addText(deckSlide.title, {
      x: 0.72,
      y: 0.82,
      w: 10.8,
      h: 0.7,
      fontSize: 24,
      bold: true,
      color: ink,
      fit: "shrink",
      margin: 0
    });
    slide.addText(deckSlide.purpose, {
      x: 0.75,
      y: 1.62,
      w: 10.4,
      h: 0.45,
      fontSize: 12,
      color: muted,
      fit: "shrink",
      margin: 0
    });
    slide.addText(
      deckSlide.bullets.map((bullet) => ({ text: bullet, options: { bullet: { type: "bullet" as const } } })),
      {
        x: 0.95,
        y: 2.32,
        w: 9.7,
        h: 2.7,
        fontSize: 16,
        color: ink,
        breakLine: false,
        fit: "shrink",
        paraSpaceAfter: 10,
        margin: 0.02
      }
    );
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.75,
      y: 5.7,
      w: 10.7,
      h: 0.65,
      rectRadius: 0.08,
      fill: { color: "F1F6F8" },
      line: { color: "D5E2E8" }
    });
    slide.addText(deckSlide.visualHint, {
      x: 0.95,
      y: 5.9,
      w: 10.2,
      h: 0.25,
      fontSize: 9,
      color: muted,
      fit: "shrink",
      margin: 0
    });
  });

  await pptx.writeFile({ fileName: filePath });
}
