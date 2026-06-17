const deckJsonSchema = JSON.stringify({
    title: "string",
    subtitle: "string",
    narrative: "string",
    visualTheme: {
        name: "string",
        palette: {
            background: "6位HEX，不带#",
            surface: "6位HEX，不带#",
            primary: "6位HEX，不带#",
            secondary: "6位HEX，不带#",
            accent: "6位HEX，不带#",
            ink: "6位HEX，不带#",
            muted: "6位HEX，不带#"
        },
        fonts: {
            heading: "Office安全标题字体",
            body: "Office安全正文字体",
            mono: "Office安全数字/代码字体"
        },
        styleNotes: "string"
    },
    slides: [
        {
            title: "string",
            purpose: "string",
            keyMessage: "一句可作为页面主判断的短句",
            bullets: ["3-5条短句，每条不超过36个中文字符"],
            visualHint: "页面视觉说明，不要只写配色，要说明构图、图示或图片",
            layout: "hero-statement | two-column | insight-cards | process-flow | timeline | comparison | metric-dashboard | image-focus | closing",
            metrics: [{ label: "string", value: "string", detail: "string" }],
            diagram: {
                type: "process | timeline | cycle | matrix | architecture | comparison",
                nodes: ["3-5个短节点"]
            },
            image: {
                kind: "illustration | photo | icon | chart | none",
                placement: "right | left | background | banner | inline",
                prompt: "可供图片/素材智能体使用的中文图片提示词",
                alt: "图片替代文本"
            }
        }
    ]
});
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
            systemPrompt: "你是资深企业演示稿策划、视觉设计总监和PPT制作顾问。严格遵守用户上传的 Skill 规则，输出可被程序解析的 JSON，不要输出 Markdown 代码块。不要编造事实、客户名称、Logo 或未提供的数据。",
            outlinePrompt: [
                "请基于以下信息生成演示稿大纲和完整视觉系统。",
                sharedContext,
                "JSON Schema：",
                deckJsonSchema,
                `slides 数量必须是 ${brief.pageCount}。每页 bullets 3-5 条。`,
                "visualTheme 必须包含 7 个明确 HEX 色值：background/surface/primary/secondary/accent/ink/muted，避免单一色相堆叠。",
                "每页必须选择一个 layout，并给出可执行的 diagram、metrics 或 image。image.prompt 面向后端图片/素材智能体，不要写成给用户看的说明。"
            ].join("\n\n"),
            slidePrompt: [
                "请将以下大纲扩展为最终逐页内容，保持同一 JSON Schema，不要改变 slides 数量。",
                "重点补充可直接放入 PPT 的短句、页面主判断、指标卡、流程/时间线/对比图节点，以及可供图片智能体生成素材的 image.prompt。",
                "metrics 只能使用用户材料中提供的真实数值；如果没有真实数值，可使用“阶段/模块/维度”等非数据型表达。",
                "diagram.nodes 要短，便于放入图形。bullets 保持精炼，不要长段落。",
                sharedContext
            ].join("\n\n")
        };
    }
    buildSlidePrompt(prompt, outline) {
        return `${prompt.slidePrompt}\n\n大纲 JSON：\n${JSON.stringify(outline, null, 2)}`;
    }
}
