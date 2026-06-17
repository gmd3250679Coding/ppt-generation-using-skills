import type { DeckPlan, GenerationBrief, SkillPackage } from "../types/generation.js";
import { escapeHtml } from "../utils/html.js";

function renderBullets(bullets: string[]) {
  return bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
}

export function renderDeckHtml(deck: DeckPlan, brief: GenerationBrief, skill: SkillPackage) {
  const slides = deck.slides
    .map(
      (slide, index) => `
      <section class="slide">
        <div class="slide-kicker">${escapeHtml(brief.companyName || skill.name)} · ${String(index + 1).padStart(2, "0")}</div>
        <h2>${escapeHtml(slide.title)}</h2>
        <p class="purpose">${escapeHtml(slide.purpose)}</p>
        <ul>${renderBullets(slide.bullets)}</ul>
        <div class="visual-hint">${escapeHtml(slide.visualHint)}</div>
      </section>`
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(deck.title)}</title>
    <style>
      :root {
        color: #172033;
        background: #eef2f5;
        font-family: Inter, "Microsoft YaHei", Arial, sans-serif;
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: #eef2f5; }
      .deck { display: grid; gap: 20px; padding: 24px; }
      .slide {
        min-height: min(720px, calc(100vh - 48px));
        border: 1px solid rgba(23, 32, 51, 0.12);
        border-radius: 8px;
        padding: 52px;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.96), rgba(242,247,244,0.94)),
          radial-gradient(circle at 84% 18%, rgba(42, 111, 151, 0.16), transparent 30%);
        box-shadow: 0 20px 50px rgba(23, 32, 51, 0.08);
      }
      .cover {
        display: flex;
        flex-direction: column;
        justify-content: center;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.98), rgba(232,241,247,0.95)),
          linear-gradient(90deg, #2a6f97 0 8px, transparent 8px);
      }
      .slide-kicker {
        color: #2a6f97;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0;
        margin-bottom: 18px;
      }
      h1, h2 { letter-spacing: 0; margin: 0; color: #172033; }
      h1 { max-width: 900px; font-size: 52px; line-height: 1.08; }
      h2 { max-width: 900px; font-size: 38px; line-height: 1.14; }
      .subtitle, .purpose {
        max-width: 860px;
        margin: 18px 0 0;
        color: #4d5b6c;
        font-size: 20px;
        line-height: 1.6;
      }
      ul {
        display: grid;
        gap: 14px;
        max-width: 880px;
        margin: 34px 0;
        padding-left: 24px;
        font-size: 20px;
        line-height: 1.55;
      }
      li::marker { color: #2a6f97; }
      .meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 34px;
      }
      .pill, .visual-hint {
        border: 1px solid rgba(23, 32, 51, 0.14);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.76);
        color: #445266;
      }
      .pill { padding: 10px 14px; }
      .visual-hint {
        max-width: 880px;
        padding: 16px 18px;
        font-size: 15px;
      }
      @media (max-width: 760px) {
        .deck { padding: 12px; }
        .slide { min-height: auto; padding: 28px; }
        h1 { font-size: 36px; }
        h2 { font-size: 28px; }
        .subtitle, .purpose, ul { font-size: 17px; }
      }
    </style>
  </head>
  <body>
    <main class="deck">
      <section class="slide cover">
        <div class="slide-kicker">${escapeHtml(brief.companyName || skill.name)} · ${escapeHtml(brief.language)}</div>
        <h1>${escapeHtml(deck.title)}</h1>
        <p class="subtitle">${escapeHtml(deck.subtitle || deck.narrative)}</p>
        <div class="meta-row">
          <span class="pill">${escapeHtml(brief.audience || "目标受众")}</span>
          <span class="pill">${escapeHtml(brief.style)}</span>
          <span class="pill">${escapeHtml(skill.name)}</span>
        </div>
      </section>
      ${slides}
    </main>
  </body>
</html>`;
}
