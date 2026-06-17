import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { config } from "../config.js";
import { ensureDir, safeJoin } from "../utils/fs.js";
async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
async function walkFiles(rootDir, currentDir = rootDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
        const entryPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
            return walkFiles(rootDir, entryPath);
        }
        return [path.relative(rootDir, entryPath)];
    }));
    return files.flat();
}
function summarizeSkill(markdown) {
    const compact = markdown
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\s+/g, " ")
        .trim();
    return compact.slice(0, 2200);
}
async function findSkillMarkdown(rootDir) {
    const files = await walkFiles(rootDir);
    const skillFile = files.find((file) => path.basename(file).toLowerCase() === "skill.md");
    if (!skillFile) {
        throw new Error("Skill 包中未找到 SKILL.md");
    }
    return {
        skillPath: path.join(rootDir, skillFile),
        files
    };
}
export class SkillLoader {
    async load(packageName, uploadedFile) {
        const normalizedName = packageName.trim();
        if (uploadedFile) {
            return this.loadUploadedSkill(normalizedName, uploadedFile);
        }
        return this.loadInstalledSkill(normalizedName);
    }
    async loadUploadedSkill(packageName, uploadedFile) {
        const jobSkillDir = safeJoin(config.tempDir, `skills/${Date.now()}-${crypto.randomUUID()}`);
        await ensureDir(jobSkillDir);
        if (uploadedFile.originalname.toLowerCase().endsWith(".zip")) {
            const zip = new AdmZip(uploadedFile.buffer);
            zip.getEntries().forEach((entry) => {
                const targetPath = safeJoin(jobSkillDir, entry.entryName);
                if (entry.isDirectory) {
                    return;
                }
                zip.extractEntryTo(entry, path.dirname(targetPath), false, true);
            });
        }
        else if (/\.(md|markdown)$/i.test(uploadedFile.originalname)) {
            await fs.writeFile(path.join(jobSkillDir, "SKILL.md"), uploadedFile.buffer);
        }
        else {
            throw new Error("仅支持上传 .zip、.md 或 .markdown Skill 文件");
        }
        return this.readSkillPackage(packageName, jobSkillDir);
    }
    async loadInstalledSkill(packageName) {
        const rootDir = safeJoin(config.skillsDir, packageName);
        if (!(await pathExists(rootDir))) {
            throw new Error(`未找到本地 Skill：${packageName}`);
        }
        return this.readSkillPackage(packageName, rootDir);
    }
    async readSkillPackage(packageName, rootDir) {
        const { skillPath, files } = await findSkillMarkdown(rootDir);
        const skillMarkdown = await fs.readFile(skillPath, "utf8");
        const templateFiles = files.filter((file) => /templates?\//i.test(file) || /\.(pptx|potx|html|css)$/i.test(file));
        const assetFiles = files.filter((file) => /assets?\//i.test(file) || /\.(png|jpe?g|webp|svg|gif|ttf|otf)$/i.test(file));
        return {
            name: packageName,
            rootDir,
            skillMarkdown,
            summary: summarizeSkill(skillMarkdown),
            templateFiles,
            assetFiles
        };
    }
}
