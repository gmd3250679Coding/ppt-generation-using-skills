import path from "node:path";
import type { DeckPlan, GenerationBrief, RenderedDeck, SkillPackage } from "../types/generation.js";
import { OutputStorage } from "../storage/OutputStorage.js";
import { renderDeckHtml } from "./HtmlRenderer.js";
import { writePptx } from "./PptxRenderer.js";
import { createSimplePdf } from "./PdfRenderer.js";

export class DeckRenderer {
  constructor(private readonly storage = new OutputStorage()) {}

  async render(jobId: string, deck: DeckPlan, brief: GenerationBrief, skill: SkillPackage): Promise<RenderedDeck> {
    const previewHtml = renderDeckHtml(deck, brief, skill);
    await this.storage.writeText(jobId, "preview.html", previewHtml);

    const pptxPath = this.storage.absolutePath(jobId, "deck.pptx");
    await this.storage.prepareJobDir(jobId);
    await writePptx(pptxPath, deck, brief, skill);

    await this.storage.writeBuffer(jobId, "deck.pdf", createSimplePdf(deck, brief));

    return {
      previewHtml,
      previewUrl: this.storage.publicUrl(jobId, "preview.html"),
      downloadUrls: {
        html: this.storage.publicUrl(jobId, "preview.html"),
        pptx: this.storage.publicUrl(jobId, path.basename(pptxPath)),
        pdf: this.storage.publicUrl(jobId, "deck.pdf")
      }
    };
  }
}
