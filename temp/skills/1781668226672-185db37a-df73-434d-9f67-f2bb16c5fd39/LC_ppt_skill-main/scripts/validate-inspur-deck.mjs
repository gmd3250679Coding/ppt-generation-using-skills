#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate-inspur-deck.mjs path/to/index.html");
  process.exit(2);
}

const html = fs.readFileSync(file, "utf8");
const errors = [];
const warnings = [];

if (html.includes("[必填]")) errors.push("存在未替换的 [必填] 占位符。");
if (!html.includes("<!-- SLIDES_HERE -->") && !/<section\s+class=["'][^"']*slide/.test(html)) {
  errors.push("没有检测到 slide section。");
}

const sectionRegex = /<section\b([^>]*)>/g;
const sections = [...html.matchAll(sectionRegex)];
if (sections.length === 0) errors.push("没有 <section> 页面。");

const allowedThemes = new Set(["light", "soft", "blue"]);
const layouts = new Set(["cover", "agenda", "section", "cards", "metric", "split", "flow", "compare", "closing"]);
let blueCount = 0;
let softCount = 0;

for (const [i, match] of sections.entries()) {
  const attrs = match[1];
  const classMatch = attrs.match(/class=["']([^"']+)["']/);
  const layoutMatch = attrs.match(/data-layout=["']([^"']+)["']/);
  if (!classMatch || !classMatch[1].split(/\s+/).includes("slide")) {
    errors.push(`第 ${i + 1} 页缺少 class="slide ..."。`);
  }
  const classes = classMatch ? classMatch[1].split(/\s+/) : [];
  const themes = classes.filter((c) => allowedThemes.has(c));
  if (themes.length !== 1) errors.push(`第 ${i + 1} 页必须且只能使用 light/soft/blue 之一。`);
  if (themes[0] === "blue") blueCount += 1;
  if (themes[0] === "soft") softCount += 1;
  if (!layoutMatch) errors.push(`第 ${i + 1} 页缺少 data-layout。`);
  else if (!layouts.has(layoutMatch[1])) errors.push(`第 ${i + 1} 页 data-layout="${layoutMatch[1]}" 不在允许列表。`);
}

if (sections.length >= 8 && blueCount === 0) warnings.push("8 页以上建议至少包含 1 页 blue 深色页。");
if (sections.length >= 8 && softCount === 0) warnings.push("8 页以上建议至少包含 1 页 soft 浅蓝页。");

const imageRefs = [...html.matchAll(/<img\b[^>]*src=["']([^"']+)["']/g)].map((m) => m[1]);
for (const src of imageRefs) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) continue;
  const imagePath = path.resolve(path.dirname(file), src);
  if (!fs.existsSync(imagePath)) warnings.push(`图片不存在: ${src}`);
}

if (errors.length) {
  console.error("FAILED");
  for (const item of errors) console.error(`- ${item}`);
  for (const item of warnings) console.error(`- Warning: ${item}`);
  process.exit(1);
}

console.log("OK");
console.log(`Slides: ${sections.length}`);
for (const item of warnings) console.log(`Warning: ${item}`);
