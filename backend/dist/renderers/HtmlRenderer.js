import { normalizeVisualTheme } from "../design/VisualDefaults.js";
import { escapeHtml } from "../utils/html.js";
function cssHex(value) {
    return `#${value.replace("#", "")}`;
}
function renderBullets(bullets) {
    return bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
}
function renderMetrics(metrics) {
    return `<div class="metrics">${metrics
        .slice(0, 3)
        .map((metric) => `
        <div class="metric">
          <strong>${escapeHtml(metric.value)}</strong>
          <span>${escapeHtml(metric.label)}</span>
          ${metric.detail ? `<small>${escapeHtml(metric.detail)}</small>` : ""}
        </div>`)
        .join("")}</div>`;
}
function renderDiagram(diagram) {
    if (!diagram) {
        return "";
    }
    return `<div class="diagram diagram-${escapeHtml(diagram.type)}">${diagram.nodes
        .slice(0, 5)
        .map((node, index) => `<div class="node"><b>${String(index + 1).padStart(2, "0")}</b><span>${escapeHtml(node)}</span></div>`)
        .join("")}</div>`;
}
function renderVisual(slide, theme) {
    if (slide.image?.kind === "none") {
        return "";
    }
    const nodes = slide.diagram?.nodes?.slice(0, 4) ?? slide.bullets.slice(0, 4);
    return `<figure class="visual" aria-label="${escapeHtml(slide.image?.alt || slide.title)}">
    <div class="visual-orbit">
      <span></span><span></span><span></span>
    </div>
    <figcaption>
      <strong>${escapeHtml(slide.image?.alt || slide.title)}</strong>
      <small>${escapeHtml(theme.name)}</small>
    </figcaption>
    <div class="visual-tags">${nodes.map((node) => `<em>${escapeHtml(node)}</em>`).join("")}</div>
  </figure>`;
}
function renderSlide(slide, index, brief, skill, theme) {
    return `
    <section class="slide layout-${escapeHtml(slide.layout)}">
      <header>
        <div class="slide-kicker">${escapeHtml(brief.companyName || skill.name)} · ${String(index + 1).padStart(2, "0")}</div>
        <h2>${escapeHtml(slide.title)}</h2>
        <p class="purpose">${escapeHtml(slide.purpose)}</p>
      </header>
      <div class="key-message">${escapeHtml(slide.keyMessage)}</div>
      <div class="content-block">
        <ul>${renderBullets(slide.bullets)}</ul>
        ${renderDiagram(slide.diagram)}
        ${renderMetrics(slide.metrics)}
        ${renderVisual(slide, theme)}
      </div>
      <p class="visual-hint">${escapeHtml(slide.visualHint)}</p>
    </section>`;
}
export function renderDeckHtml(deck, brief, skill) {
    const theme = normalizeVisualTheme(deck.visualTheme, brief);
    const palette = theme.palette;
    const slides = deck.slides.map((slide, index) => renderSlide(slide, index, brief, skill, theme)).join("");
    return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(deck.title)}</title>
    <style>
      :root {
        --bg: ${cssHex(palette.background)};
        --surface: ${cssHex(palette.surface)};
        --primary: ${cssHex(palette.primary)};
        --secondary: ${cssHex(palette.secondary)};
        --accent: ${cssHex(palette.accent)};
        --ink: ${cssHex(palette.ink)};
        --muted: ${cssHex(palette.muted)};
        color: var(--ink);
        background: #eef2f5;
        font-family: ${theme.fonts.body}, Inter, "Microsoft YaHei", Arial, sans-serif;
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: #eef2f5; }
      .deck { display: grid; gap: 20px; padding: 24px; }
      .slide {
        position: relative;
        min-height: min(720px, calc(100vh - 48px));
        overflow: hidden;
        border: 1px solid rgba(20, 33, 61, 0.12);
        border-radius: 8px;
        padding: 44px 52px 38px;
        background: linear-gradient(135deg, var(--surface), var(--bg));
        box-shadow: 0 20px 50px rgba(20, 33, 61, 0.09);
      }
      .slide::before {
        content: "";
        position: absolute;
        inset: 0 auto auto 0;
        width: 100%;
        height: 8px;
        background: linear-gradient(90deg, var(--primary), var(--accent));
      }
      .cover {
        display: grid;
        grid-template-columns: 0.9fr 2fr;
        gap: 44px;
        align-items: center;
        background: linear-gradient(90deg, var(--primary) 0 24%, var(--accent) 24% calc(24% + 10px), var(--bg) calc(24% + 10px));
      }
      .cover-brand { color: #fff; align-self: stretch; display: flex; flex-direction: column; justify-content: space-between; padding: 8px 0; }
      .cover-main { max-width: 920px; }
      .slide-kicker {
        color: var(--primary);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0;
        margin-bottom: 14px;
      }
      .cover .slide-kicker { color: #fff; }
      h1, h2 {
        letter-spacing: 0;
        margin: 0;
        color: var(--ink);
        font-family: ${theme.fonts.heading}, ${theme.fonts.body}, Arial, sans-serif;
      }
      h1 { max-width: 900px; font-size: 54px; line-height: 1.05; }
      h2 { max-width: 940px; font-size: 34px; line-height: 1.12; }
      .subtitle, .purpose {
        max-width: 880px;
        margin: 14px 0 0;
        color: var(--muted);
        font-size: 18px;
        line-height: 1.5;
      }
      .content-block {
        display: grid;
        grid-template-columns: minmax(300px, 0.9fr) minmax(320px, 1.1fr);
        grid-template-areas:
          "bullets visual"
          "diagram visual"
          "metrics metrics";
        gap: 18px;
        margin-top: 24px;
      }
      ul {
        grid-area: bullets;
        display: grid;
        gap: 10px;
        margin: 0;
        padding-left: 21px;
        font-size: 18px;
        line-height: 1.45;
      }
      li::marker { color: var(--accent); }
      .key-message {
        margin-top: 22px;
        max-width: 760px;
        border-left: 6px solid var(--accent);
        padding-left: 16px;
        color: var(--ink);
        font-family: ${theme.fonts.heading}, ${theme.fonts.body}, Arial, sans-serif;
        font-size: 23px;
        line-height: 1.28;
        font-weight: 800;
      }
      .diagram {
        grid-area: diagram;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
      }
      .node, .metric {
        border: 1px solid rgba(20, 33, 61, 0.1);
        border-radius: 8px;
        background: rgba(255,255,255,0.8);
      }
      .node { padding: 14px; }
      .node b { display: block; color: var(--accent); font-size: 12px; margin-bottom: 8px; }
      .node span { font-weight: 700; }
      .metrics {
        grid-area: metrics;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .metric { padding: 14px 16px; }
      .metric strong { display: block; color: var(--primary); font-size: 30px; line-height: 1; }
      .metric span { display: block; margin-top: 8px; font-weight: 700; }
      .metric small { display: block; margin-top: 5px; color: var(--muted); }
      .visual {
        grid-area: visual;
        min-height: 280px;
        margin: 0;
        padding: 24px;
        position: relative;
        display: grid;
        align-content: end;
        overflow: hidden;
        border-radius: 8px;
        background:
          radial-gradient(circle at 78% 18%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 32%),
          linear-gradient(135deg, rgba(255,255,255,0.92), color-mix(in srgb, var(--primary) 12%, var(--surface)));
        border: 1px solid rgba(20, 33, 61, 0.1);
      }
      .visual-orbit { position: absolute; inset: 20px; }
      .visual-orbit span {
        position: absolute;
        border-radius: 999px;
        background: var(--primary);
        opacity: 0.14;
      }
      .visual-orbit span:nth-child(1) { width: 180px; height: 180px; right: 14%; top: 8%; }
      .visual-orbit span:nth-child(2) { width: 96px; height: 96px; left: 12%; top: 28%; background: var(--accent); opacity: 0.22; }
      .visual-orbit span:nth-child(3) { width: 280px; height: 120px; right: -10%; bottom: 12%; border-radius: 60px; background: var(--secondary); opacity: 0.14; }
      figcaption { position: relative; z-index: 1; max-width: 82%; }
      figcaption strong { display: block; font-size: 22px; line-height: 1.25; }
      figcaption small { display: block; margin-top: 8px; color: var(--muted); }
      .visual-tags {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 18px;
      }
      .visual-tags em {
        font-style: normal;
        padding: 7px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.76);
        color: var(--ink);
        font-size: 12px;
        font-weight: 700;
      }
      .visual-hint {
        position: absolute;
        left: 52px;
        right: 52px;
        bottom: 18px;
        margin: 0;
        color: var(--muted);
        font-size: 11px;
        line-height: 1.35;
      }
      .layout-insight-cards .content-block,
      .layout-metric-dashboard .content-block {
        grid-template-columns: 1fr 0.72fr;
      }
      .layout-process-flow .content-block,
      .layout-timeline .content-block,
      .layout-closing .content-block {
        grid-template-columns: 1fr;
        grid-template-areas:
          "diagram"
          "bullets"
          "metrics"
          "visual";
      }
      .layout-image-focus .content-block {
        grid-template-columns: 0.78fr 1.22fr;
      }
      .meta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
      .pill {
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 8px;
        padding: 10px 14px;
        color: #fff;
      }
      @media (max-width: 760px) {
        .deck { padding: 12px; }
        .slide { min-height: auto; padding: 28px; }
        .cover, .content-block { display: block; }
        .cover { background: linear-gradient(135deg, var(--primary), var(--secondary)); }
        .cover-main { margin-top: 34px; }
        .cover h1, .cover .subtitle { color: #fff; }
        h1 { font-size: 36px; }
        h2 { font-size: 27px; }
        .subtitle, .purpose, ul { font-size: 16px; }
        .key-message { font-size: 20px; }
        .visual, .diagram, .metrics { margin-top: 18px; }
        .metrics { grid-template-columns: 1fr; }
        .visual-hint { position: static; margin-top: 18px; }
      }
    </style>
  </head>
  <body>
    <main class="deck">
      <section class="slide cover">
        <div class="cover-brand">
          <div class="slide-kicker">${escapeHtml(brief.companyName || skill.name)} · ${escapeHtml(brief.language)}</div>
          <div class="meta-row">
            <span class="pill">${escapeHtml(brief.audience || "目标受众")}</span>
            <span class="pill">${escapeHtml(brief.style)}</span>
          </div>
        </div>
        <div class="cover-main">
          <h1>${escapeHtml(deck.title)}</h1>
          <p class="subtitle">${escapeHtml(deck.subtitle || deck.narrative)}</p>
          ${renderMetrics([
        { label: "页面数量", value: String(deck.slides.length), detail: "slides" },
        { label: "视觉系统", value: "1", detail: theme.name },
        { label: "布局类型", value: String(new Set(deck.slides.map((slide) => slide.layout)).size), detail: "种" }
    ])}
        </div>
      </section>
      ${slides}
    </main>
  </body>
</html>`;
}
