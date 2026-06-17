---
name: inspur-ppt-skill
description: 生成浪潮/海岳公司风格的汇报、方案、产品介绍、转正汇报、AI 产品发布和内部分享 PPT。优先基于本 skill 的 templates/*.pptx 制作原生 PowerPoint, 也可在用户需要网页演示、横向翻页 deck、单文件 HTML PPT 时使用 assets/template-inspur.html 生成公司风格网页 PPT。适用于用户提到"浪潮风格"、"海岳大模型"、"公司 PPT"、"汇报模板"、"方案 PPT"、"转正汇报"、"产品介绍"、"网页 PPT"等场景。
---

# Inspur PPT Skill

用于制作浪潮/海岳公司风格 PPT。风格依据当前 skill 内的 `templates/`、`references/` 和开发期可选 `examples/` 归纳:

- 主色: 深蓝 `#0D48CE/#0E48CE`, 亮蓝 `#1D78FA/#006EFF`, 青绿 `#00A0A0`, 白底和深蓝底交替。
- 字体: 中文优先 `Microsoft YaHei`/`微软雅黑`, 英文和数字优先 `Arial`/`Inter`。
- 气质: 企业科技、可信、清爽、信息密度中高, 避免花哨装饰。
- 常见版式: 封面、目录、章节页、指标卡、流程图、三/四列能力卡、左右图文、案例页、对比表、收束页。

## 安装后自检

首次使用或从 GitHub zip 安装后, 先确认这些文件存在:

```bash
test -f SKILL.md
test -f templates/汇报模板.pptx
test -f templates/新员工转正汇报模板.pptx
test -f assets/template-inspur.html
test -f scripts/validate-inspur-deck.mjs
test -f scripts/inspect-inspur-pptx.mjs
```

如果任一命令失败, 说明安装包不完整。不要继续生成, 先让用户补齐仓库或重新安装完整目录。

## 工作流

### 1. 判断交付形态

默认选择 **原生 PPTX**:

- 用户要"公司 PPT"、"汇报"、"方案"、"转正汇报"、"产品介绍"、"可以编辑的 PPT"。
- 先读 `references/native-pptx-workflow.md`。
- 再按需要读取 `references/template-map.md`、`references/pptx-components.md`、`references/artifact-tool-pptx.md` 和 `references/pptx-quality-gates.md`。
- 优先复用 `templates/汇报模板.pptx` 的风格和页型; 新员工转正场景使用 `templates/新员工转正汇报模板.pptx`。
- 如果无法稳定编辑模板内部元素, 使用 artifact-tool 重新生成可编辑文本、形状和线条, 不退回整页截图式 PPT。

只有在用户明确需要网页、HTML、横向翻页、单文件演示、浏览器打开时, 选择 **网页 PPT**:

- 先读 `references/html-layouts.md`。
- 复制 `assets/template-inspur.html` 到目标项目的 `index.html`。
- 生成后运行 `node <SKILL_ROOT>/scripts/validate-inspur-deck.mjs <index.html>`。

### 2. 需求对齐

如果用户只给了主题, 最多问 1-3 个关键问题。优先问:

1. 受众和场景: 内部汇报、客户方案、产品发布、述职/转正、技术分享?
2. 页数或演讲时长: 10 分钟约 8-10 页, 20 分钟约 12-16 页, 30 分钟约 18-24 页。
3. 是否有旧 PPT、文档、数据、截图、必须使用的模板?

如果信息足以开工, 直接做合理假设并继续。

### 3. 先定结构再写页面

用公司汇报的默认叙事:

1. 封面: 标题、部门/作者、日期、英文副标或口号。
2. 目录: 3-5 个部分, 编号用 `01/02/03/04`。
3. 背景/问题: 现状、痛点、趋势或客户需求。
4. 方案/产品: 架构、能力、流程、核心优势。
5. 实践/案例: 场景、落地路径、效果数据。
6. 总结/计划: 价值、下一步、资源诉求或 Q&A。

产品功能介绍、ChatBI、AI 产品发布等 10 页左右需求, 默认使用 `references/native-pptx-workflow.md` 里的"AI 产品功能介绍 10 页默认结构"。

详细视觉规则读 `references/style-guide.md`。

### 4. 使用素材

资源导览:

```
inspur_ppt_skill/
├── SKILL.md
├── templates/
│   ├── 汇报模板.pptx
│   └── 新员工转正汇报模板.pptx
├── assets/
│   └── template-inspur.html
├── references/
│   ├── style-guide.md
│   ├── native-pptx-workflow.md
│   ├── template-map.md
│   ├── pptx-components.md
│   ├── artifact-tool-pptx.md
│   ├── pptx-quality-gates.md
│   ├── example-style-summary.md
│   ├── html-layouts.md
│   └── checklist.md
└── scripts/
    ├── inspect-inspur-pptx.mjs
    └── validate-inspur-deck.mjs
```

安装版默认不依赖 `examples/`。如果当前 skill 目录存在 `examples/`, 只能作为开发期风格参考; 不要把示例 PPTX 整体复制到新项目里, 也不要假设用户安装后一定有这些大文件。优先使用 `references/example-style-summary.md`。

### 5. 质量检查

交付前必须读 `references/checklist.md` 并自检。重点:

- 标题、正文、图表不进入页脚/页码区域。
- 一页只表达一个中心观点, 不把长文档硬塞进单页。
- 颜色不跑偏: 蓝白科技主调, 少量青绿或橙色只做强调。
- 中文大标题不超过两行; 客户方案页避免口号化空话。
- PPTX 必须可编辑; HTML 必须本地打开可翻页。
- PPTX 交付前运行 `references/pptx-quality-gates.md` 中的 zip、文本层和预览检查。

## 参考来源

本 skill 的组织方式参考 `op7418/guizang-ppt-skill` 的分层方法: `SKILL.md` 放核心流程, `references/` 放可按需加载的细则, `assets/` 放模板, `scripts/` 放校验脚本, `README.md` 面向安装和触发说明。不要把参考项目的品牌、赞助信息或视觉风格写进浪潮/海岳输出物。
