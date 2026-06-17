#!/usr/bin/env node
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const file = process.argv[2];

if (!file) {
  console.error("Usage: node scripts/inspect-inspur-pptx.mjs path/to/output.pptx");
  process.exit(2);
}

if (!fs.existsSync(file)) {
  console.error(`FAILED: file not found: ${file}`);
  process.exit(2);
}

function run(command, args) {
  return execFileSync(command, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function decodeXmlText(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

try {
  run("unzip", ["-t", file]);
} catch (error) {
  console.error("FAILED: PPTX zip integrity check failed.");
  if (error.stderr) console.error(String(error.stderr).trim());
  process.exit(1);
}

let entries;
try {
  entries = run("unzip", ["-Z1", file]).split(/\r?\n/).filter(Boolean);
} catch (error) {
  console.error("FAILED: unable to list PPTX entries. Is unzip installed?");
  if (error.stderr) console.error(String(error.stderr).trim());
  process.exit(1);
}

const slideFiles = entries
  .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
  .sort((a, b) => Number(a.match(/slide(\d+)\.xml/)[1]) - Number(b.match(/slide(\d+)\.xml/)[1]));

if (slideFiles.length === 0) {
  console.error("FAILED: no slide XML files found.");
  process.exit(1);
}

const warnings = [];
let totalTextChars = 0;

console.log("OK: PPTX zip integrity passed.");
console.log(`Slides: ${slideFiles.length}`);
console.log("");
console.log("Text layer:");

for (const name of slideFiles) {
  const xml = run("unzip", ["-p", file, name]);
  const text = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/g)]
    .map((match) => decodeXmlText(match[1]))
    .join("");
  totalTextChars += text.length;
  const slideNo = name.match(/slide(\d+)\.xml/)[1].padStart(2, "0");
  const preview = text.replace(/\s+/g, " ").slice(0, 80);
  console.log(`- slide ${slideNo}: ${text.length} chars${preview ? ` | ${preview}` : ""}`);
  if (text.length === 0) warnings.push(`slide ${slideNo} has no text layer`);
}

console.log("");
console.log(`Total text chars: ${totalTextChars}`);

if (warnings.length) {
  console.log("");
  console.log("Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
  console.log("Slides with no text may be image-only pages; verify editability before delivery.");
}
