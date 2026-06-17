# PPTX 质量门禁

原生 PPTX 交付前必须完成这些检查。目标是确认文件能打开、页数正确、内容可编辑、视觉不溢出。

## 1. zip 完整性

```bash
unzip -t "<output.pptx>"
```

通过后继续; 失败时说明 PPTX 包损坏, 必须重新生成。

## 2. 页数检查

```bash
unzip -Z1 "<output.pptx>" | rg '^ppt/slides/slide[0-9]+\\.xml$' | wc -l
```

页数应与用户要求或最终大纲一致。10 页左右需求通常控制在 8-12 页。

## 3. 文本层检查

优先运行项目脚本:

```bash
node scripts/inspect-inspur-pptx.mjs "<output.pptx>"
```

脚本会输出每页文本字符数。若大量页面文本为 0, 很可能是整页截图或内容不可编辑, 需要返工。

也可临时使用 Python:

```python
import zipfile, re
with zipfile.ZipFile("output.pptx") as z:
    for n in z.namelist():
        if re.match(r"ppt/slides/slide\\d+\\.xml$", n):
            xml = z.read(n).decode("utf-8", "ignore")
            text = "".join(re.findall(r"<a:t>(.*?)</a:t>", xml))
            print(n, len(text), text[:80])
```

## 4. 预览检查

- 导出 PNG 预览或打开 PowerPoint/兼容工具逐页检查。
- 重点看标题、页脚、页码、卡片、图表是否越界。
- 检查中文是否出现单字掉行, 大标题是否超过两行。
- 检查连续页面节奏: 8 页以上不建议全部白底正文页。

如果使用 artifact-tool 且有 layout 输出, 运行:

```bash
node check_layout_quality.mjs --layout <layout-dir> --warn-only --min-gap 8
```

没有该脚本时, 以 PNG 预览和人工检查为准。

## 5. 可编辑性标准

通过标准:

- 标题、正文、页码、卡片文字在文本层中可检出。
- 架构、流程、指标优先由形状和文本构成。
- 图片只用于产品截图、界面截图、照片或必要图示。
- 不存在整页单图截图作为主要内容的正文页。

## 6. 交付命名

文件名使用清晰版本:

- `ChatBI功能介绍-v1.pptx`
- `海岳大模型产品方案-v1.pptx`
- `新员工转正汇报-姓名-v1.pptx`
