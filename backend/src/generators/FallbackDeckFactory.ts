import type { DeckPlan, GenerationBrief, SkillPackage, SlidePlan } from "../types/generation.js";
import { chooseSlideLayout, createDefaultVisualTheme } from "../design/VisualDefaults.js";

const defaultSections = [
  ["背景与目标", "说明业务背景、项目目标和本次汇报希望达成的共识"],
  ["现状洞察", "提炼当前挑战、关键数据和机会窗口"],
  ["核心方案", "展开解决方案架构、关键举措与能力支撑"],
  ["价值收益", "说明对客户、业务、组织和效率的可量化价值"],
  ["落地路径", "规划实施阶段、里程碑、责任分工和风险控制"],
  ["总结与行动", "收束核心观点，明确下一步动作"]
];

function buildSlide(index: number, total: number, brief: GenerationBrief, skill: SkillPackage): SlidePlan {
  const [sectionTitle, sectionPurpose] = defaultSections[index % defaultSections.length];
  const pageNumber = index + 1;
  const layout = chooseSlideLayout(index, total);
  const bullets = [
    `围绕“${brief.topic}”建立清晰的汇报主线`,
    `结合${brief.companyName || "项目"}场景，突出与受众相关的关键判断`,
    `遵循 ${skill.name} 的版式、语气和品牌约束`,
    brief.materials ? `吸收补充材料中的重点信息：${brief.materials.slice(0, 80)}` : "预留数据、案例和客户证据的位置"
  ];
  const nodes = bullets.map((bullet) => bullet.replace(/[“”"]/g, "").slice(0, 18)).slice(0, 4);

  return {
    title: `${pageNumber}. ${sectionTitle}`,
    purpose: sectionPurpose,
    bullets,
    visualHint: `${brief.style || "企业咨询汇报"}风格，使用清晰标题、重点数字、卡片和结构化图示`,
    layout,
    keyMessage: `${sectionTitle}需要服务于“${brief.topic}”的核心判断，并转化为可行动建议。`,
    metrics: [
      { label: "内容模块", value: String(Math.min(5, bullets.length)), detail: "项" },
      { label: "页面角色", value: String(pageNumber).padStart(2, "0"), detail: "序号" }
    ],
    diagram: {
      type: layout === "timeline" ? "timeline" : layout === "comparison" ? "comparison" : "process",
      nodes
    },
    image: {
      kind: "illustration",
      placement: layout === "image-focus" ? "right" : "inline",
      prompt: `${brief.topic}，${sectionTitle}，${brief.style || "现代企业"}风格，抽象但具体的商务插画，高对比配色`,
      alt: `${sectionTitle}视觉插画`
    }
  };
}

export function createFallbackDeck(brief: GenerationBrief, skill: SkillPackage): DeckPlan {
  return {
    title: brief.topic,
    subtitle: `${brief.companyName || "项目"} · ${brief.audience || "目标受众"} · ${brief.language}`,
    narrative: `面向${brief.audience || "目标受众"}，以${brief.tone || "专业清晰"}的表达完成${brief.pageCount}页${brief.style || "企业"}演示稿。`,
    visualTheme: createDefaultVisualTheme(brief),
    slides: Array.from({ length: brief.pageCount }, (_, index) => buildSlide(index, brief.pageCount, brief, skill))
  };
}
