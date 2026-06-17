export class PromptBuilder {
    build(brief, skill) {
        const sharedContext = [
            `Skill 名称：${skill.name}`,
            `Skill 摘要：${skill.summary || "未提供明确规则"}`,
            `模板文件：${skill.templateFiles.join(", ") || "无"}`,
            `素材文件：${skill.assetFiles.join(", ") || "无"}`,
            `公司/项目：${brief.companyName || "未指定"}`,
            `演示主题：${brief.topic}`,
            `目标受众：${brief.audience || "未指定"}`,
            `页数：${brief.pageCount}`,
            `语言：${brief.language}`,
            `风格：${brief.style}`,
            `语气：${brief.tone}`,
            `补充材料：${brief.materials || "无"}`
        ].join("\n");
        return {
            systemPrompt: "你是资深企业演示稿策划与PPT制作顾问。严格遵守用户上传的 Skill 规则，输出可被程序解析的 JSON，不要输出 Markdown 代码块。",
            outlinePrompt: [
                "请基于以下信息生成演示稿大纲。",
                sharedContext,
                "JSON Schema：",
                '{"title":"string","subtitle":"string","narrative":"string","slides":[{"title":"string","purpose":"string","bullets":["string"],"visualHint":"string"}]}',
                `slides 数量必须是 ${brief.pageCount}。每页 bullets 3-5 条。`
            ].join("\n\n"),
            slidePrompt: [
                "请将以下大纲扩展为最终逐页内容，保持同一 JSON Schema，不要改变 slides 数量。",
                "重点补充可直接放入 PPT 的短句、数据表达、视觉建议和汇报逻辑。",
                sharedContext
            ].join("\n\n")
        };
    }
    buildSlidePrompt(prompt, outline) {
        return `${prompt.slidePrompt}\n\n大纲 JSON：\n${JSON.stringify(outline, null, 2)}`;
    }
}
