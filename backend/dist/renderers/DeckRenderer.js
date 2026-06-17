import path from "node:path";
import { OutputStorage } from "../storage/OutputStorage.js";
import { renderDeckHtml } from "./HtmlRenderer.js";
import { writePptx } from "./PptxRenderer.js";
import { createSimplePdf } from "./PdfRenderer.js";
export class DeckRenderer {
    storage;
    constructor(storage = new OutputStorage()) {
        this.storage = storage;
    }
    async render(jobId, deck, brief, skill) {
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
