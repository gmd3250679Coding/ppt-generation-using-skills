import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { ensureDir, safeJoin } from "../utils/fs.js";

export class OutputStorage {
  async prepareJobDir(jobId: string) {
    const jobDir = safeJoin(config.outputsDir, jobId);
    await ensureDir(jobDir);
    return jobDir;
  }

  async writeText(jobId: string, fileName: string, content: string) {
    const jobDir = await this.prepareJobDir(jobId);
    const filePath = safeJoin(jobDir, fileName);
    await fs.writeFile(filePath, content, "utf8");
    return filePath;
  }

  async writeBuffer(jobId: string, fileName: string, content: Buffer) {
    const jobDir = await this.prepareJobDir(jobId);
    const filePath = safeJoin(jobDir, fileName);
    await fs.writeFile(filePath, content);
    return filePath;
  }

  publicUrl(jobId: string, fileName: string) {
    return `${config.publicBaseUrl.replace(/\/$/, "")}/outputs/${encodeURIComponent(jobId)}/${encodeURIComponent(fileName)}`;
  }

  absolutePath(jobId: string, fileName: string) {
    return path.join(config.outputsDir, jobId, fileName);
  }
}
