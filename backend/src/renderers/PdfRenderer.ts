import type { DeckPlan, GenerationBrief } from "../types/generation.js";

function pdfEscape(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

export function createSimplePdf(deck: DeckPlan, brief: GenerationBrief) {
  const lines = [
    deck.title,
    deck.subtitle,
    `Topic: ${brief.topic}`,
    `Audience: ${brief.audience || "N/A"}`,
    `Pages: ${brief.pageCount}`,
    "",
    ...deck.slides.flatMap((slide, index) => [
      `${index + 1}. ${slide.title}`,
      ...slide.bullets.map((bullet) => `- ${bullet}`)
    ])
  ]
    .filter(Boolean)
    .slice(0, 44);

  const text = lines
    .map((line, index) => `BT /F1 11 Tf 50 ${760 - index * 16} Td (${pdfEscape(line).slice(0, 110)}) Tj ET`)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body, "utf8");
}
