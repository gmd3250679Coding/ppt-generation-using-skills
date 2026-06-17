import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { ensureDir, safeJoin } from "../utils/fs.js";
export class OutputStorage {
    async prepareJobDir(jobId) {
        const jobDir = safeJoin(config.outputsDir, jobId);
        await ensureDir(jobDir);
        return jobDir;
    }
    async writeText(jobId, fileName, content) {
        const jobDir = await this.prepareJobDir(jobId);
        const filePath = safeJoin(jobDir, fileName);
        await fs.writeFile(filePath, content, "utf8");
        return filePath;
    }
    async writeBuffer(jobId, fileName, content) {
        const jobDir = await this.prepareJobDir(jobId);
        const filePath = safeJoin(jobDir, fileName);
        await fs.writeFile(filePath, content);
        return filePath;
    }
    publicUrl(jobId, fileName) {
        return `${config.publicBaseUrl.replace(/\/$/, "")}/outputs/${encodeURIComponent(jobId)}/${encodeURIComponent(fileName)}`;
    }
    absolutePath(jobId, fileName) {
        return path.join(config.outputsDir, jobId, fileName);
    }
}
