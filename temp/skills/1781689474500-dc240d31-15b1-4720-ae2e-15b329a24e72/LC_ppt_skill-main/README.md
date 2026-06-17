# LC-ppt-skill

用于在 Codex 中生成浪潮/海岳公司风格的 PPT、方案汇报、产品介绍、转正述职和网页演示。默认交付原生、可编辑的 `.pptx`; 只有用户明确要求网页、HTML、横向翻页或单文件演示时, 才使用 HTML deck。

## 适用场景

- LC风格公司汇报。
- 客户方案、产品介绍、AI 产品发布。
- ChatBI、大模型平台、智能体平台、数据智能类介绍。
- 新员工转正、述职和内部分享。
- 明确要求浏览器打开的网页 PPT。

## 安装结构

安装包必须包含:

```text
inspur_ppt_skill/
├── SKILL.md
├── README.md
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

安装版不依赖 `examples/`。如果开发目录存在 `examples/`, 只能作为风格参考, 不要在生成流程里强依赖这些大 PPTX。

## 安装后自检

在 skill 根目录运行:

```bash
test -f SKILL.md
test -f templates/汇报模板.pptx
test -f templates/新员工转正汇报模板.pptx
test -f assets/template-inspur.html
test -f scripts/validate-inspur-deck.mjs
test -f scripts/inspect-inspur-pptx.mjs
```

任一命令失败都说明安装包不完整, 需要补齐后再使用。

## 使用方式

在 Codex 中可以这样触发:

```text
使用 $inspur-ppt-skill 做一份 10 页左右的 ChatBI 功能介绍 PPT
```

```text
用浪潮/海岳风格生成一份客户方案汇报 PPT, 15 页左右
```

```text
做一个单文件 HTML 网页 PPT, 海岳大模型产品发布风格
```

## 默认 PPTX 工作流

1. 读取 `SKILL.md` 判断交付形态。
2. 原生 PPTX 先读 `references/native-pptx-workflow.md`。
3. 按需读取 `template-map.md`、`pptx-components.md`、`artifact-tool-pptx.md`。
4. 优先复用 `templates/汇报模板.pptx` 或 `templates/新员工转正汇报模板.pptx` 的风格。
5. 如果模板内部元素无法稳定编辑, 使用 artifact-tool 重建可编辑文本、形状和线条。
6. 交付前按 `references/pptx-quality-gates.md` 和 `references/checklist.md` 检查。

10 页 AI 产品介绍默认结构:

1. 封面。
2. 目录。
3. 核心问题。
4. 功能总览。
5. 核心流程。
6. 技术底座。
7. 亮点能力。
8. 安全治理。
9. 典型场景。
10. 总结与建设路径。

## HTML 工作流

仅在用户明确要求网页 PPT、HTML、横向翻页或浏览器演示时使用:

```bash
cp assets/template-inspur.html index.html
node scripts/validate-inspur-deck.mjs index.html
```

HTML 页面结构和可用版式见 `references/html-layouts.md`。

## 质量检查

PPTX:

```bash
unzip -t "<output.pptx>"
node scripts/inspect-inspur-pptx.mjs "<output.pptx>"
```

HTML:

```bash
node scripts/validate-inspur-deck.mjs "<index.html>"
```

如果 Presentations/artifact-tool 的 contact sheet 因系统 Python 缺少 `PIL` 失败, 优先切换 Codex bundled Python; 不要把已生成的 PPTX 误判为失败。

## 设计原则

- 可编辑优先: 文本、形状、线条、表格都应可编辑。
- 蓝白科技风: 深蓝、亮蓝为主, 青绿和橙色少量强调。
- 一页一个中心观点: 不把长文档硬塞进单页。
- 不编造数据: 没有真实口径时标注 `待补充`、`示例` 或 `预估`。
- 不依赖大示例文件: 安装版以 `references/` 的轻量经验为准。

## 参考

项目组织参考 `op7418/guizang-ppt-skill` 的分层方式: `SKILL.md` 放核心流程, `references/` 放细则, `assets/` 放模板, `scripts/` 放校验脚本, `README.md` 放安装和使用说明。视觉和内容输出保持浪潮/海岳风格, 不复用参考项目的品牌信息。
