# Artifact-tool PPTX 经验

当模板 PPTX 的内部元素无法稳定编辑时, 可以用 artifact-tool 从可编辑文本、形状和线条重新生成 PPTX。目标是保持可编辑, 不做整页截图。

## 已验证写法

文本先 `compose`, 再设置 `shape.position`:

```js
const [shape] = slide.compose(jsx("text", {
  frame: { width, height },
  style: {
    fontSize,
    color,
    bold,
    typeface: "Microsoft YaHei",
  },
  children: value,
}));
shape.position = { left, top, width, height };
```

矩形等形状用 `slide.shapes.add()` 后置设置位置和填充:

```js
const box = slide.shapes.add({ geometry: "rect" });
box.position = { left, top, width, height };
box.fill = "#0D48CE";
box.line = { color: "#D6E6FF", transparency: 0 };
```

## 常见坑

- 不要假设 JSX 的 `frame.left`、`frame.top`、`position.left`、`position.top` 会直接生效; 文本定位以后置 `shape.position` 为准。
- 不要使用未验证的 `slide.add({ type: "text" })`。
- 不要依赖不支持的 `textStyle` prop。
- 不要在生成失败后退回整页截图式 PPT。
- 不要把复杂架构图合成一张大图; 优先用可编辑矩形、线条和文本组合。

## 推荐公共函数

```js
function addText(slide, value, box, style = {}) {
  const [shape] = slide.compose(jsx("text", {
    frame: { width: box.width, height: box.height },
    style: {
      fontSize: 14,
      color: "#111827",
      typeface: "Microsoft YaHei",
      ...style,
    },
    children: value,
  }));
  shape.position = box;
  return shape;
}

function addRect(slide, box, fill, line = { color: "#D6E6FF" }) {
  const shape = slide.shapes.add({ geometry: "rect" });
  shape.position = box;
  shape.fill = fill;
  shape.line = line;
  return shape;
}
```

基于这两个函数再封装:

- `title(slide, title, subtitle)`
- `footer(slide, page, total)`
- `card(slide, box, heading, body, accentColor)`
- `metric(slide, box, value, unit, label)`
- `flowNode(slide, box, index, heading, body)`

## 预览拼图依赖

如果 Presentations/artifact-tool 的 contact sheet 阶段因为系统 Python 缺少 `PIL` 失败, 不要临时安装依赖。优先切换 Codex bundled Python:

```bash
PYTHON=/Users/mingdaguo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
```

PPTX 已经生成但 contact sheet 失败时, 不要误判为 PPTX 失败; 继续运行 `scripts/inspect-inspur-pptx.mjs` 和人工预览检查。
