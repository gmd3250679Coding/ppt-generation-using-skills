import { randomUUID } from "node:crypto";
import { SkillLoader } from "../skill-loader/SkillLoader.js";
import { PromptBuilder } from "../generators/PromptBuilder.js";
import { OpenAiCompatibleProvider } from "../providers/OpenAiCompatibleProvider.js";
import { createFallbackDeck } from "../generators/FallbackDeckFactory.js";
import { DeckRenderer } from "../renderers/DeckRenderer.js";
import { config } from "../config.js";
import { VisualDesignAgent } from "../generators/VisualDesignAgent.js";
const progressByStatus = {
    Created: 4,
    ValidatingSkill: 16,
    BuildingPrompt: 30,
    GeneratingOutline: 48,
    GeneratingSlides: 70,
    Rendering: 88,
    Ready: 100,
    Failed: 100
};
const messageByStatus = {
    Created: "作业已创建",
    ValidatingSkill: "正在校验 Skill 结构与模板资源",
    BuildingPrompt: "正在组合生成提示词与品牌规则",
    GeneratingOutline: "正在生成演示稿大纲",
    GeneratingSlides: "正在生成逐页内容、版式和视觉资产规划",
    Rendering: "正在渲染配色、排版、图片和导出文件",
    Ready: "演示稿已生成，可预览和导出",
    Failed: "生成失败"
};
function nowIso() {
    return new Date().toISOString();
}
function asErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
export class JobService {
    skillLoader;
    promptBuilder;
    provider;
    renderer;
    visualAgent;
    jobs = new Map();
    constructor(skillLoader = new SkillLoader(), promptBuilder = new PromptBuilder(), provider = new OpenAiCompatibleProvider(), renderer = new DeckRenderer(), visualAgent = new VisualDesignAgent()) {
        this.skillLoader = skillLoader;
        this.promptBuilder = promptBuilder;
        this.provider = provider;
        this.renderer = renderer;
        this.visualAgent = visualAgent;
    }
    createJob(request, uploadedSkill) {
        const id = randomUUID();
        const timestamp = nowIso();
        const job = {
            id,
            status: "Created",
            progress: progressByStatus.Created,
            message: messageByStatus.Created,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        this.jobs.set(id, job);
        void this.runJob(id, request, uploadedSkill);
        return job;
    }
    getJob(id) {
        return this.jobs.get(id) ?? null;
    }
    updateJob(id, patch) {
        const current = this.jobs.get(id);
        if (!current) {
            return;
        }
        const next = {
            ...current,
            ...patch,
            updatedAt: nowIso()
        };
        this.jobs.set(id, next);
    }
    setStatus(id, status, message = messageByStatus[status]) {
        this.updateJob(id, {
            status,
            progress: progressByStatus[status],
            message
        });
    }
    async generateOutline(request, skill, fallback) {
        const prompt = this.promptBuilder.build(request.brief, skill);
        try {
            const outline = await this.provider.generateJson(request.apiSettings, [
                { role: "system", content: prompt.systemPrompt },
                { role: "user", content: prompt.outlinePrompt }
            ]);
            return {
                deck: this.visualAgent.enrich(outline, request.brief.pageCount, fallback, request.brief, skill),
                prompt,
                usedFallback: false
            };
        }
        catch (error) {
            if (!config.allowModelFallback) {
                throw new Error(`生成演示稿大纲失败：${asErrorMessage(error)}`);
            }
            return {
                deck: fallback,
                prompt,
                usedFallback: true
            };
        }
    }
    async generateSlides(request, skill, outline, prompt, fallback) {
        try {
            const deck = await this.provider.generateJson(request.apiSettings, [
                { role: "system", content: prompt.systemPrompt },
                { role: "user", content: this.promptBuilder.buildSlidePrompt(prompt, outline) }
            ]);
            return this.visualAgent.enrich(deck, request.brief.pageCount, fallback, request.brief, skill);
        }
        catch (error) {
            if (!config.allowModelFallback) {
                throw new Error(`生成逐页内容失败：${asErrorMessage(error)}`);
            }
            return this.visualAgent.enrich(outline, request.brief.pageCount, fallback, request.brief, skill);
        }
    }
    async runJob(id, request, uploadedSkill) {
        try {
            this.setStatus(id, "ValidatingSkill");
            const skill = await this.skillLoader.load(request.skillPackageName, uploadedSkill);
            const fallback = createFallbackDeck(request.brief, skill);
            this.setStatus(id, "BuildingPrompt");
            const prompt = this.promptBuilder.build(request.brief, skill);
            this.setStatus(id, "GeneratingOutline");
            const outlineResult = await this.generateOutline(request, skill, fallback);
            this.setStatus(id, "GeneratingSlides", outlineResult.usedFallback ? "模型接口暂不可用，正在使用本地结构化内容生成页面" : messageByStatus.GeneratingSlides);
            const deck = await this.generateSlides(request, skill, outlineResult.deck, prompt, fallback);
            this.setStatus(id, "Rendering");
            const rendered = await this.renderer.render(id, deck, request.brief, skill);
            this.updateJob(id, {
                status: "Ready",
                progress: progressByStatus.Ready,
                message: messageByStatus.Ready,
                previewHtml: rendered.previewHtml,
                previewUrl: rendered.previewUrl,
                downloadUrls: rendered.downloadUrls
            });
        }
        catch (error) {
            this.updateJob(id, {
                status: "Failed",
                progress: progressByStatus.Failed,
                message: error instanceof Error ? error.message : messageByStatus.Failed,
                error: error instanceof Error ? error.stack : String(error)
            });
        }
    }
}
