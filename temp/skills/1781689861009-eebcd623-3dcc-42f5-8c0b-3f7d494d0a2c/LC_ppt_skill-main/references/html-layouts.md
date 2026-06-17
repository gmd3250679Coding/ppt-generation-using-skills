# 网页 PPT 工作流和版式

用于用户明确要求网页、HTML、浏览器演示、横向翻页或单文件 deck 的场景。

## 快速开始

1. 复制模板:

```bash
cp "<SKILL_ROOT>/assets/template-inspur.html" "项目/ppt/index.html"
```

2. 替换 `<title>` 和 `<!-- SLIDES_HERE -->`。
3. 图片放在 `index.html` 同级 `images/` 文件夹。
4. 运行:

```bash
node "<SKILL_ROOT>/scripts/validate-inspur-deck.mjs" "项目/ppt/index.html"
```

## 页面结构

每页使用:

```html
<section class="slide light" data-layout="cover">
  ...
</section>
```

主题 class 必须是:

- `light`: 白底正文页。
- `blue`: 深蓝背景页。
- `soft`: 浅蓝背景页。

8 页以上的 deck 至少包含 1 页 `blue` 和 1 页 `soft`, 避免全白。

## 可用版式

### cover

封面。适合标题、作者、部门、日期。

```html
<section class="slide blue" data-layout="cover">
  <div class="eyebrow">INSPUR AI</div>
  <h1 class="hero-title">海岳大模型产品方案</h1>
  <p class="hero-subtitle">面向企业知识与流程自动化的智能化底座</p>
  <div class="meta-row"><span>人工智能产品研发部</span><span>2026</span></div>
</section>
```

### agenda

目录页。

```html
<section class="slide light" data-layout="agenda">
  <h2>目录</h2>
  <div class="agenda-list">
    <div><b>01</b><span>业务背景</span></div>
    <div><b>02</b><span>产品方案</span></div>
    <div><b>03</b><span>实践案例</span></div>
    <div><b>04</b><span>下一步计划</span></div>
  </div>
</section>
```

### section

章节页。

```html
<section class="slide blue" data-layout="section">
  <div class="section-no">01</div>
  <h2 class="section-title">业务背景</h2>
  <p class="lead">从文档处理到流程执行, 企业 AI 正在进入可运营阶段。</p>
</section>
```

### cards

三/四列能力卡。

```html
<section class="slide light" data-layout="cards">
  <h2>核心能力</h2>
  <div class="card-grid cols-3">
    <article class="card"><b>文档理解</b><p>解析合同、发票、制度和业务材料。</p></article>
    <article class="card"><b>流程编排</b><p>把模型能力接入审批、填报和台账。</p></article>
    <article class="card"><b>持续运营</b><p>监控效果, 沉淀知识和规则。</p></article>
  </div>
</section>
```

### metric

指标大字报。

```html
<section class="slide soft" data-layout="metric">
  <h2>落地价值</h2>
  <div class="metric-grid">
    <div><strong>60%</strong><span>填报时间下降</span></div>
    <div><strong>3x</strong><span>文档处理效率提升</span></div>
    <div><strong>24h</strong><span>业务连续响应</span></div>
  </div>
</section>
```

### split

左文右图。

```html
<section class="slide light" data-layout="split">
  <div>
    <h2>智能填报闭环</h2>
    <p class="lead">从多模态材料到业务字段自动映射, 降低人工录入和审核成本。</p>
    <ul class="bullets">
      <li>支持文本、表格、扫描件和图片。</li>
      <li>字段规则可配置, 结果可追溯。</li>
      <li>接入现有业务系统回填。</li>
    </ul>
  </div>
  <figure class="image-frame"><img src="images/demo.png" alt=""></figure>
</section>
```

### flow

流程页。

```html
<section class="slide light" data-layout="flow">
  <h2>处理流程</h2>
  <div class="flow">
    <div><b>01</b><span>材料接入</span></div>
    <div><b>02</b><span>语义理解</span></div>
    <div><b>03</b><span>字段抽取</span></div>
    <div><b>04</b><span>规则校验</span></div>
    <div><b>05</b><span>系统回填</span></div>
  </div>
</section>
```

### compare

左右对比。

```html
<section class="slide soft" data-layout="compare">
  <h2>模式对比</h2>
  <div class="compare-grid">
    <article><h3>传统方式</h3><p>人工阅读材料, 手动录入, 复核成本高。</p></article>
    <article class="accent"><h3>海岳方案</h3><p>模型理解 + 规则校验 + 流程回填, 形成闭环。</p></article>
  </div>
</section>
```

### closing

收束页。

```html
<section class="slide blue" data-layout="closing">
  <h2 class="hero-title">未来, 因潮澎湃</h2>
  <p class="hero-subtitle">让企业 AI 从工具走向可持续运营的生产力。</p>
</section>
```
