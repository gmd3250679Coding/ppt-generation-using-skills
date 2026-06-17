import { createRequire } from "node:module";
import { normalizeVisualTheme } from "../design/VisualDefaults.js";
const require = createRequire(import.meta.url);
const PptxGenJS = require("pptxgenjs");
const slideWidth = 13.333;
const slideHeight = 7.5;
const contentLeft = 0.65;
const contentTop = 1.72;
const contentWidth = 12.03;
const contentHeight = 4.95;
function xmlEscape(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}
function toSvgDataUri(svg) {
    return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}
function text(value, fallback = "") {
    return (value || fallback).replace(/\s+/g, " ").trim();
}
function truncate(value, maxLength) {
    const normalized = text(value);
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}...` : normalized;
}
function addRect(slide, pptx, options) {
    slide.addShape(pptx.ShapeType.rect, {
        line: { color: "FFFFFF", transparency: 100 },
        ...options
    });
}
function addSoftPanel(slide, pptx, theme, x, y, w, h, fill) {
    addRect(slide, pptx, {
        x,
        y,
        w,
        h,
        rectRadius: 0.08,
        fill: { color: fill || theme.palette.surface },
        line: { color: theme.palette.primary, transparency: 86 },
        shadow: { type: "outer", color: "D7DEE8", opacity: 0.16, blur: 1.2, angle: 45, distance: 1.5 }
    });
}
function addSlideChrome(slide, pptx, theme, brief, skill, index) {
    slide.background = { color: theme.palette.background };
    addRect(slide, pptx, { x: 0, y: 0, w: slideWidth, h: 0.16, fill: { color: theme.palette.primary }, line: { color: theme.palette.primary } });
    addRect(slide, pptx, { x: 0, y: 0.16, w: 2.2, h: 0.05, fill: { color: theme.palette.accent }, line: { color: theme.palette.accent } });
    slide.addText(`${brief.companyName || skill.name} · ${String(index).padStart(2, "0")}`, {
        x: contentLeft,
        y: 0.34,
        w: 6.9,
        h: 0.22,
        fontFace: theme.fonts.body,
        fontSize: 8.5,
        bold: true,
        color: theme.palette.primary,
        margin: 0
    });
}
function addTitleBlock(slide, theme, slidePlan) {
    slide.addText(slidePlan.title, {
        x: contentLeft,
        y: 0.78,
        w: 9.65,
        h: 0.48,
        fontFace: theme.fonts.heading,
        fontSize: 27,
        bold: true,
        color: theme.palette.ink,
        fit: "shrink",
        margin: 0
    });
    slide.addText(slidePlan.purpose, {
        x: contentLeft,
        y: 1.32,
        w: 10.4,
        h: 0.28,
        fontFace: theme.fonts.body,
        fontSize: 9.5,
        color: theme.palette.muted,
        fit: "shrink",
        margin: 0
    });
}
function addKeyMessage(slide, pptx, theme, message, x, y, w, h, size = 18) {
    addRect(slide, pptx, {
        x,
        y,
        w: 0.08,
        h,
        fill: { color: theme.palette.accent },
        line: { color: theme.palette.accent }
    });
    slide.addText(truncate(message, 95), {
        x: x + 0.18,
        y: y + 0.02,
        w: w - 0.18,
        h,
        fontFace: theme.fonts.heading,
        fontSize: size,
        bold: true,
        color: theme.palette.ink,
        breakLine: false,
        fit: "shrink",
        margin: 0
    });
}
function addBullets(slide, theme, bullets, x, y, w, h, fontSize = 13.2) {
    slide.addText(bullets.slice(0, 5).map((bullet) => ({
        text: truncate(bullet, 74),
        options: { bullet: { type: "bullet" } }
    })), {
        x,
        y,
        w,
        h,
        fontFace: theme.fonts.body,
        fontSize,
        color: theme.palette.ink,
        breakLine: false,
        fit: "shrink",
        paraSpaceAfter: 7,
        margin: 0.02,
        valign: "top"
    });
}
function addMetricCards(slide, pptx, theme, metrics, x, y, w, h) {
    const visible = metrics.slice(0, 3);
    const gap = 0.14;
    const cardW = (w - gap * (visible.length - 1)) / Math.max(1, visible.length);
    visible.forEach((metric, index) => {
        const cardX = x + index * (cardW + gap);
        addSoftPanel(slide, pptx, theme, cardX, y, cardW, h, index === 0 ? "FFF8EC" : theme.palette.surface);
        slide.addText(metric.value, {
            x: cardX + 0.18,
            y: y + 0.2,
            w: cardW - 0.36,
            h: h * 0.42,
            fontFace: theme.fonts.heading,
            fontSize: 24,
            bold: true,
            color: index === 0 ? theme.palette.accent : theme.palette.primary,
            fit: "shrink",
            margin: 0
        });
        slide.addText(metric.label, {
            x: cardX + 0.2,
            y: y + h * 0.62,
            w: cardW - 0.4,
            h: 0.22,
            fontFace: theme.fonts.body,
            fontSize: 8.8,
            bold: true,
            color: theme.palette.ink,
            fit: "shrink",
            margin: 0
        });
        slide.addText(metric.detail || "", {
            x: cardX + 0.2,
            y: y + h * 0.79,
            w: cardW - 0.4,
            h: 0.2,
            fontFace: theme.fonts.body,
            fontSize: 7.2,
            color: theme.palette.muted,
            fit: "shrink",
            margin: 0
        });
    });
}
function illustrationSvg(slidePlan, theme, index) {
    const palette = theme.palette;
    const nodes = slidePlan.diagram?.nodes?.slice(0, 4) ?? slidePlan.bullets.slice(0, 4);
    const title = truncate(slidePlan.image?.alt || slidePlan.title, 34);
    const offset = (index % 4) * 38;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#${palette.surface}"/>
      <stop offset="1" stop-color="#${palette.background}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#${palette.primary}"/>
      <stop offset="1" stop-color="#${palette.secondary}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#14213D" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="1200" height="820" rx="44" fill="url(#bg)"/>
  <path d="M${112 + offset} 634 C265 480 257 306 430 232 C603 158 735 222 878 108 C977 29 1076 62 1156 136 L1156 820 L66 820 C80 746 58 688 ${112 + offset} 634Z" fill="#${palette.primary}" opacity="0.12"/>
  <circle cx="${910 - offset}" cy="208" r="132" fill="#${palette.accent}" opacity="0.18"/>
  <circle cx="284" cy="210" r="78" fill="#${palette.secondary}" opacity="0.17"/>
  <rect x="136" y="142" width="460" height="154" rx="26" fill="#${palette.surface}" filter="url(#shadow)"/>
  <rect x="164" y="174" width="90" height="90" rx="24" fill="url(#accent)"/>
  <path d="M187 222 L207 242 L235 202" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="282" y="212" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#${palette.ink}">${xmlEscape(title)}</text>
  <text x="282" y="252" font-family="Arial, sans-serif" font-size="23" fill="#${palette.muted}">${xmlEscape(truncate(slidePlan.keyMessage, 46))}</text>
  ${nodes
        .map((node, nodeIndex) => {
        const x = 162 + nodeIndex * 230;
        const y = 418 + (nodeIndex % 2) * 118;
        return `<g>
        <rect x="${x}" y="${y}" width="196" height="78" rx="18" fill="#${palette.surface}" stroke="#${palette.primary}" stroke-opacity="0.18"/>
        <circle cx="${x + 38}" cy="${y + 39}" r="20" fill="#${nodeIndex % 2 ? palette.secondary : palette.accent}" opacity="0.9"/>
        <text x="${x + 70}" y="${y + 46}" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#${palette.ink}">${xmlEscape(truncate(node, 13))}</text>
      </g>`;
    })
        .join("")}
  <path d="M708 274 L994 274 L1056 384 L994 494 L708 494 L646 384Z" fill="#${palette.primary}" opacity="0.92"/>
  <path d="M730 306 L974 306 L1018 384 L974 462 L730 462 L686 384Z" fill="#${palette.surface}" opacity="0.96"/>
  <text x="852" y="378" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#${palette.primary}">Visual</text>
  <text x="852" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" fill="#${palette.muted}">Agent Ready</text>
</svg>`;
}
function addIllustration(slide, theme, slidePlan, index, x, y, w, h) {
    if (slidePlan.image?.kind === "none") {
        return;
    }
    slide.addImage({
        data: toSvgDataUri(illustrationSvg(slidePlan, theme, index)),
        x,
        y,
        w,
        h,
        altText: slidePlan.image?.alt || slidePlan.title
    });
}
function addProcessDiagram(slide, pptx, theme, diagram, x, y, w, h) {
    const nodes = diagram.nodes.slice(0, 5);
    const gap = 0.12;
    const nodeW = (w - gap * (nodes.length - 1)) / nodes.length;
    const midY = y + h / 2;
    nodes.forEach((node, index) => {
        const nodeX = x + index * (nodeW + gap);
        const color = index === 0 ? theme.palette.accent : index % 2 ? theme.palette.secondary : theme.palette.primary;
        addSoftPanel(slide, pptx, theme, nodeX, y + 0.18, nodeW, h - 0.36, index === 0 ? "FFF8EC" : theme.palette.surface);
        slide.addText(String(index + 1).padStart(2, "0"), {
            x: nodeX + 0.14,
            y: y + 0.34,
            w: 0.42,
            h: 0.24,
            fontFace: theme.fonts.mono,
            fontSize: 9.5,
            bold: true,
            color,
            margin: 0
        });
        slide.addText(truncate(node, 28), {
            x: nodeX + 0.14,
            y: y + 0.72,
            w: nodeW - 0.28,
            h: 0.7,
            fontFace: theme.fonts.heading,
            fontSize: 12.2,
            bold: true,
            color: theme.palette.ink,
            fit: "shrink",
            margin: 0
        });
        if (index < nodes.length - 1) {
            slide.addShape(pptx.ShapeType.line, {
                x: nodeX + nodeW - 0.02,
                y: midY,
                w: gap + 0.04,
                h: 0,
                line: { color: theme.palette.primary, width: 1.4, beginArrowType: "none", endArrowType: "triangle" }
            });
        }
    });
}
function addTimelineDiagram(slide, pptx, theme, diagram, x, y, w, h) {
    const nodes = diagram.nodes.slice(0, 5);
    const step = w / Math.max(1, nodes.length - 1);
    const lineY = y + h * 0.45;
    slide.addShape(pptx.ShapeType.line, {
        x,
        y: lineY,
        w,
        h: 0,
        line: { color: theme.palette.primary, width: 2.2 }
    });
    nodes.forEach((node, index) => {
        const nodeX = x + (nodes.length === 1 ? w / 2 : step * index);
        const labelX = Math.max(x, Math.min(nodeX - 0.78, x + w - 1.56));
        slide.addShape(pptx.ShapeType.ellipse, {
            x: nodeX - 0.13,
            y: lineY - 0.13,
            w: 0.26,
            h: 0.26,
            fill: { color: index === nodes.length - 1 ? theme.palette.accent : theme.palette.primary },
            line: { color: theme.palette.surface, width: 1 }
        });
        slide.addText(truncate(node, 18), {
            x: labelX,
            y: index % 2 ? lineY + 0.34 : lineY - 0.72,
            w: 1.56,
            h: 0.36,
            fontFace: theme.fonts.body,
            fontSize: 8.5,
            bold: true,
            align: "center",
            color: theme.palette.ink,
            fit: "shrink",
            margin: 0
        });
    });
}
function addComparisonDiagram(slide, pptx, theme, diagram, x, y, w, h) {
    const nodes = diagram.nodes.slice(0, 4);
    const halfW = (w - 0.22) / 2;
    const groups = [nodes.slice(0, Math.ceil(nodes.length / 2)), nodes.slice(Math.ceil(nodes.length / 2))];
    const titles = ["现状/挑战", "目标/方案"];
    groups.forEach((group, index) => {
        const panelX = x + index * (halfW + 0.22);
        addSoftPanel(slide, pptx, theme, panelX, y, halfW, h, index ? "F4FAF8" : "FFF8EC");
        slide.addText(titles[index], {
            x: panelX + 0.24,
            y: y + 0.24,
            w: halfW - 0.48,
            h: 0.28,
            fontFace: theme.fonts.heading,
            fontSize: 13,
            bold: true,
            color: index ? theme.palette.secondary : theme.palette.accent,
            margin: 0
        });
        group.forEach((node, nodeIndex) => {
            slide.addText(truncate(node, 30), {
                x: panelX + 0.28,
                y: y + 0.8 + nodeIndex * 0.54,
                w: halfW - 0.56,
                h: 0.28,
                fontFace: theme.fonts.body,
                fontSize: 9.4,
                color: theme.palette.ink,
                fit: "shrink",
                margin: 0
            });
        });
    });
}
function addMatrixDiagram(slide, pptx, theme, diagram, x, y, w, h) {
    const nodes = [...diagram.nodes, "能力", "价值", "风险", "路径"].slice(0, 4);
    const cellW = (w - 0.14) / 2;
    const cellH = (h - 0.14) / 2;
    nodes.forEach((node, index) => {
        const cellX = x + (index % 2) * (cellW + 0.14);
        const cellY = y + Math.floor(index / 2) * (cellH + 0.14);
        addSoftPanel(slide, pptx, theme, cellX, cellY, cellW, cellH, index === 0 ? "FFF8EC" : theme.palette.surface);
        slide.addText(truncate(node, 26), {
            x: cellX + 0.24,
            y: cellY + 0.28,
            w: cellW - 0.48,
            h: cellH - 0.44,
            fontFace: theme.fonts.heading,
            fontSize: 13,
            bold: true,
            color: index === 0 ? theme.palette.accent : theme.palette.ink,
            fit: "shrink",
            margin: 0
        });
    });
}
function addDiagram(slide, pptx, theme, diagram, x, y, w, h) {
    if (diagram.type === "timeline") {
        addTimelineDiagram(slide, pptx, theme, diagram, x, y, w, h);
        return;
    }
    if (diagram.type === "comparison") {
        addComparisonDiagram(slide, pptx, theme, diagram, x, y, w, h);
        return;
    }
    if (diagram.type === "matrix" || diagram.type === "architecture" || diagram.type === "cycle") {
        addMatrixDiagram(slide, pptx, theme, diagram, x, y, w, h);
        return;
    }
    addProcessDiagram(slide, pptx, theme, diagram, x, y, w, h);
}
function renderHeroStatement(slide, pptx, theme, slidePlan, index) {
    addKeyMessage(slide, pptx, theme, slidePlan.keyMessage, contentLeft, contentTop + 0.1, 5.65, 1.42, 22);
    addBullets(slide, theme, slidePlan.bullets, contentLeft + 0.18, contentTop + 1.78, 5.35, 1.65, 12.5);
    addMetricCards(slide, pptx, theme, slidePlan.metrics, contentLeft, contentTop + 3.62, 5.65, 1.18);
    addIllustration(slide, theme, slidePlan, index, 6.65, contentTop + 0.05, 5.95, 4.72);
}
function renderTwoColumn(slide, pptx, theme, slidePlan, index) {
    addSoftPanel(slide, pptx, theme, contentLeft, contentTop, 5.68, contentHeight);
    addKeyMessage(slide, pptx, theme, slidePlan.keyMessage, contentLeft + 0.32, contentTop + 0.34, 5.05, 0.82, 15.5);
    addBullets(slide, theme, slidePlan.bullets, contentLeft + 0.48, contentTop + 1.42, 4.78, 2.38);
    addMetricCards(slide, pptx, theme, slidePlan.metrics.slice(0, 2), contentLeft + 0.38, contentTop + 3.92, 4.9, 0.8);
    addIllustration(slide, theme, slidePlan, index, 6.62, contentTop, 6.06, 2.62);
    addDiagram(slide, pptx, theme, slidePlan.diagram, 6.62, contentTop + 2.92, 6.06, 1.98);
}
function renderInsightCards(slide, pptx, theme, slidePlan, index) {
    const cards = slidePlan.bullets.slice(0, 4);
    const cardW = (contentWidth - 0.36) / 2;
    const cardH = 1.42;
    addKeyMessage(slide, pptx, theme, slidePlan.keyMessage, contentLeft, contentTop, 6.1, 0.72, 15);
    cards.forEach((bullet, cardIndex) => {
        const x = contentLeft + (cardIndex % 2) * (cardW + 0.36);
        const y = contentTop + 1.0 + Math.floor(cardIndex / 2) * (cardH + 0.24);
        addSoftPanel(slide, pptx, theme, x, y, cardW, cardH, cardIndex === 0 ? "FFF8EC" : theme.palette.surface);
        slide.addText(String(cardIndex + 1).padStart(2, "0"), {
            x: x + 0.22,
            y: y + 0.2,
            w: 0.5,
            h: 0.25,
            fontFace: theme.fonts.mono,
            fontSize: 9,
            bold: true,
            color: cardIndex === 0 ? theme.palette.accent : theme.palette.primary,
            margin: 0
        });
        slide.addText(truncate(bullet, 58), {
            x: x + 0.82,
            y: y + 0.22,
            w: cardW - 1.08,
            h: 0.76,
            fontFace: theme.fonts.heading,
            fontSize: 12.4,
            bold: true,
            color: theme.palette.ink,
            fit: "shrink",
            margin: 0
        });
        slide.addShape(pptx.ShapeType.line, {
            x: x + 0.82,
            y: y + 1.05,
            w: cardW - 1.12,
            h: 0,
            line: { color: cardIndex === 0 ? theme.palette.accent : theme.palette.secondary, width: 1.1, transparency: 20 }
        });
    });
    addIllustration(slide, theme, slidePlan, index, 9.05, contentTop - 0.02, 3.62, 2.1);
    addMetricCards(slide, pptx, theme, slidePlan.metrics, 9.05, contentTop + 2.32, 3.62, 2.0);
}
function renderProcessFlow(slide, pptx, theme, slidePlan, index) {
    addKeyMessage(slide, pptx, theme, slidePlan.keyMessage, contentLeft, contentTop, 8.2, 0.72, 15);
    addIllustration(slide, theme, slidePlan, index, 9.5, contentTop - 0.08, 3.18, 1.78);
    addDiagram(slide, pptx, theme, slidePlan.diagram, contentLeft, contentTop + 1.24, contentWidth, 1.82);
    addBullets(slide, theme, slidePlan.bullets, contentLeft + 0.1, contentTop + 3.46, 7.45, 1.18, 11.5);
    addMetricCards(slide, pptx, theme, slidePlan.metrics, 8.1, contentTop + 3.36, 4.58, 1.32);
}
function renderTimeline(slide, pptx, theme, slidePlan, index) {
    addKeyMessage(slide, pptx, theme, slidePlan.keyMessage, contentLeft, contentTop, 7.2, 0.78, 15.5);
    addTimelineDiagram(slide, pptx, theme, slidePlan.diagram, contentLeft + 0.32, contentTop + 1.42, 11.25, 2.1);
    addBullets(slide, theme, slidePlan.bullets, contentLeft + 0.1, contentTop + 3.76, 6.2, 0.95, 10.8);
    addIllustration(slide, theme, slidePlan, index, 7.15, contentTop + 3.48, 5.48, 1.38);
}
function renderComparison(slide, pptx, theme, slidePlan, index) {
    addComparisonDiagram(slide, pptx, theme, slidePlan.diagram, contentLeft, contentTop + 0.15, 7.58, 3.15);
    addIllustration(slide, theme, slidePlan, index, 8.55, contentTop + 0.05, 4.12, 2.12);
    addKeyMessage(slide, pptx, theme, slidePlan.keyMessage, 8.55, contentTop + 2.5, 4.1, 0.85, 13.8);
    addBullets(slide, theme, slidePlan.bullets, contentLeft + 0.12, contentTop + 3.72, 7.36, 1.0, 10.8);
    addMetricCards(slide, pptx, theme, slidePlan.metrics, 8.55, contentTop + 3.72, 4.1, 0.96);
}
function renderMetricDashboard(slide, pptx, theme, slidePlan, index) {
    addMetricCards(slide, pptx, theme, slidePlan.metrics, contentLeft, contentTop + 0.05, contentWidth, 1.32);
    addKeyMessage(slide, pptx, theme, slidePlan.keyMessage, contentLeft, contentTop + 1.72, 5.55, 0.88, 15.5);
    addBullets(slide, theme, slidePlan.bullets, contentLeft + 0.15, contentTop + 2.9, 5.32, 1.72, 11.8);
    addMatrixDiagram(slide, pptx, theme, slidePlan.diagram, 6.55, contentTop + 1.72, 3.1, 2.96);
    addIllustration(slide, theme, slidePlan, index, 9.95, contentTop + 1.72, 2.72, 2.96);
}
function renderImageFocus(slide, pptx, theme, slidePlan, index) {
    addIllustration(slide, theme, slidePlan, index, 6.1, contentTop - 0.02, 6.56, 4.12);
    addKeyMessage(slide, pptx, theme, slidePlan.keyMessage, contentLeft, contentTop + 0.1, 4.92, 1.02, 17);
    addBullets(slide, theme, slidePlan.bullets, contentLeft + 0.15, contentTop + 1.56, 4.72, 1.98, 12);
    addMetricCards(slide, pptx, theme, slidePlan.metrics.slice(0, 2), contentLeft, contentTop + 3.82, 4.98, 0.92);
}
function renderClosing(slide, pptx, theme, slidePlan, index) {
    addIllustration(slide, theme, slidePlan, index, 8.35, contentTop - 0.02, 4.28, 3.58);
    slide.addText(truncate(slidePlan.keyMessage, 88), {
        x: contentLeft,
        y: contentTop + 0.2,
        w: 7.05,
        h: 1.3,
        fontFace: theme.fonts.heading,
        fontSize: 25,
        bold: true,
        color: theme.palette.ink,
        fit: "shrink",
        margin: 0
    });
    addProcessDiagram(slide, pptx, theme, slidePlan.diagram, contentLeft, contentTop + 2.05, 7.1, 1.48);
    addBullets(slide, theme, slidePlan.bullets, contentLeft + 0.12, contentTop + 3.86, 11.8, 0.82, 10.5);
}
function renderContentSlide(slide, pptx, theme, brief, skill, slidePlan, index) {
    addSlideChrome(slide, pptx, theme, brief, skill, index + 1);
    addTitleBlock(slide, theme, slidePlan);
    switch (slidePlan.layout) {
        case "hero-statement":
            renderHeroStatement(slide, pptx, theme, slidePlan, index);
            break;
        case "two-column":
            renderTwoColumn(slide, pptx, theme, slidePlan, index);
            break;
        case "insight-cards":
            renderInsightCards(slide, pptx, theme, slidePlan, index);
            break;
        case "process-flow":
            renderProcessFlow(slide, pptx, theme, slidePlan, index);
            break;
        case "timeline":
            renderTimeline(slide, pptx, theme, slidePlan, index);
            break;
        case "comparison":
            renderComparison(slide, pptx, theme, slidePlan, index);
            break;
        case "metric-dashboard":
            renderMetricDashboard(slide, pptx, theme, slidePlan, index);
            break;
        case "image-focus":
            renderImageFocus(slide, pptx, theme, slidePlan, index);
            break;
        case "closing":
            renderClosing(slide, pptx, theme, slidePlan, index);
            break;
        default:
            renderTwoColumn(slide, pptx, theme, slidePlan, index);
    }
    slide.addText(slidePlan.visualHint, {
        x: contentLeft,
        y: 6.92,
        w: contentWidth,
        h: 0.22,
        fontFace: theme.fonts.body,
        fontSize: 6.8,
        color: theme.palette.muted,
        fit: "shrink",
        margin: 0
    });
}
function renderCover(pptx, deck, brief, skill, theme) {
    const cover = pptx.addSlide();
    cover.background = { color: theme.palette.background };
    addRect(cover, pptx, { x: 0, y: 0, w: 3.08, h: slideHeight, fill: { color: theme.palette.primary }, line: { color: theme.palette.primary } });
    addRect(cover, pptx, { x: 3.08, y: 0, w: 0.16, h: slideHeight, fill: { color: theme.palette.accent }, line: { color: theme.palette.accent } });
    cover.addText(brief.companyName || skill.name, {
        x: 0.6,
        y: 0.68,
        w: 2.0,
        h: 0.28,
        fontFace: theme.fonts.body,
        fontSize: 10,
        bold: true,
        color: "FFFFFF",
        margin: 0,
        fit: "shrink"
    });
    cover.addText(deck.title, {
        x: 3.8,
        y: 1.05,
        w: 6.95,
        h: 1.5,
        fontFace: theme.fonts.heading,
        fontSize: 34,
        bold: true,
        color: theme.palette.ink,
        breakLine: false,
        fit: "shrink",
        margin: 0
    });
    cover.addText(deck.subtitle || deck.narrative, {
        x: 3.84,
        y: 2.78,
        w: 6.72,
        h: 0.55,
        fontFace: theme.fonts.body,
        fontSize: 13.5,
        color: theme.palette.muted,
        fit: "shrink",
        margin: 0
    });
    cover.addText(deck.narrative, {
        x: 3.84,
        y: 3.55,
        w: 5.8,
        h: 0.66,
        fontFace: theme.fonts.body,
        fontSize: 10.5,
        color: theme.palette.ink,
        fit: "shrink",
        margin: 0
    });
    cover.addImage({
        data: toSvgDataUri(illustrationSvg(deck.slides[0], theme, 0)),
        x: 8.15,
        y: 0.82,
        w: 4.42,
        h: 4.92,
        altText: `${deck.title} 封面视觉`
    });
    addMetricCards(cover, pptx, theme, [
        { label: "页面数量", value: String(deck.slides.length), detail: "slides" },
        { label: "视觉系统", value: "1", detail: theme.name },
        { label: "布局类型", value: String(new Set(deck.slides.map((slide) => slide.layout)).size), detail: "种" }
    ], 3.84, 5.72, 6.8, 0.92);
    cover.addText([brief.audience || "目标受众", brief.style, brief.tone].filter(Boolean).join("  |  "), {
        x: 0.6,
        y: 6.66,
        w: 2.12,
        h: 0.42,
        fontFace: theme.fonts.body,
        fontSize: 8,
        color: "FFFFFF",
        transparency: 12,
        fit: "shrink",
        margin: 0
    });
}
export async function writePptx(filePath, deck, brief, skill) {
    const theme = normalizeVisualTheme(deck.visualTheme, brief);
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "PPT Skill Workspace";
    pptx.company = brief.companyName || skill.name;
    pptx.subject = brief.topic;
    pptx.title = deck.title;
    pptx.theme = {
        headFontFace: theme.fonts.heading,
        bodyFontFace: theme.fonts.body
    };
    renderCover(pptx, deck, brief, skill, theme);
    deck.slides.forEach((slidePlan, index) => {
        const slide = pptx.addSlide();
        renderContentSlide(slide, pptx, theme, brief, skill, slidePlan, index);
    });
    await pptx.writeFile({ fileName: filePath });
}
