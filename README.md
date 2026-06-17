# PPT Skill Workspace

一个运行在本地的 PPT Skill Web 工作台。用户可以在 React 页面上传 PPT Skill，填写模型 API Key 和生成需求，由本地后端调用阿里百炼、腾讯混元、DeepSeek 等国内常见 OpenAI 兼容接口，也可以接入 OpenAI / Azure OpenAI，生成演示稿并在网页中预览、下载结果。

## 项目结构

```text
ppt_generation_using_skills/
  frontend/        React + Vite 前端
  backend/         Express + TypeScript 本地后端
  skills/          可预置本地 Skill 包
  outputs/         生成结果：preview.html、deck.pptx、deck.pdf
  temp/            上传 Skill 的临时解压目录
  architecture/    架构图与设计说明
```

架构说明见 [architecture/README.md](architecture/README.md)。

## 环境要求

- Node.js 20 或更高版本
- npm
- 可用的模型 API Key，例如阿里百炼、腾讯混元、DeepSeek、OpenAI 或 Azure OpenAI

前端使用 React 19、Vite 8；后端使用 Express、TypeScript、pptxgenjs。

## 安装依赖

分别安装前后端依赖：

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 配置后端

复制后端环境变量示例：

```bash
cd backend
cp .env.example .env
```

当前前端 Vite 代理默认指向后端的 `http://localhost:4000`。推荐保持 `backend/.env` 为：

```env
PORT=4000
PUBLIC_BASE_URL=http://localhost:4000
FRONTEND_ORIGIN=http://localhost:5173
ALLOW_MODEL_FALLBACK=false
```

如果有多个本地前端地址，可以用逗号配置：

```env
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:4173
```

开发模式下，前端默认请求相对路径 `/api`，由 Vite 代理到 `http://localhost:4000`，这样不会触发浏览器跨域问题。

如果你不走 Vite 代理，或者要让构建后的前端直接访问后端，可以在 `frontend/.env.local` 中指定完整后端地址：

```env
VITE_API_BASE_URL=http://localhost:<your-backend-port>
```

## 本地开发启动

打开两个终端。

终端 1：启动后端。

```bash
cd backend
npm run dev
```

后端健康检查：

```bash
curl http://localhost:4000/api/health
```

终端 2：启动前端。

```bash
cd frontend
npm run dev
```

浏览器打开：

```text
http://localhost:5173
```

## 使用流程

1. 上传 PPT Skill 文件。
   - 支持 `.zip`、`.md`、`.markdown`
   - `.zip` 包内必须包含 `SKILL.md`
   - 可以包含 `templates/`、`assets/` 等资源目录
2. 填写 Skill 名称。
3. 选择服务商。国内平台通常选择 `国内/通用 OpenAI 兼容接口`：
   - 阿里百炼、腾讯混元、DeepSeek 等 OpenAI 兼容接口
   - OpenAI 官方接口
   - Azure OpenAI
4. 输入 API Key、模型名、接口地址等参数。国内平台通常需要填写平台提供的 base URL。
5. 填写公司名、主题、受众、页数、风格、语气和补充材料。
6. 点击生成，在右侧查看进度和预览。
7. 生成完成后可下载：
   - `deck.pptx`
   - `preview.html`
   - `deck.pdf`

API Key 只会随本次请求发送到本地后端，前端不会写入浏览器存储。

## 使用本地预置 Skill

除了上传文件，也可以把 Skill 放到 `skills/` 目录中：

```text
skills/
  inspur-ppt-skill/
    SKILL.md
    templates/
    assets/
```

前端不上传文件时，在“Skill 名称”里填写目录名，例如：

```text
inspur-ppt-skill
```

后端会从 `skills/inspur-ppt-skill/` 读取 Skill。

## 生产构建与预览

构建后端：

```bash
cd backend
npm run build
npm run start
```

构建前端：

```bash
cd frontend
npm run build
npm run preview
```

前端构建产物位于 `frontend/dist/`，后端构建产物位于 `backend/dist/`。

## 常用命令

后端：

```bash
npm run dev        # 开发模式
npm run build      # 编译 TypeScript
npm run start      # 运行 dist/server.js
npm run typecheck  # 只做类型检查
```

前端：

```bash
npm run dev      # 开发模式
npm run build    # 类型检查并构建
npm run preview  # 预览构建产物
```

## 常见问题

### 点击生成后提示后端连接失败

这通常表示前端没有连上后端。请检查：

- 后端是否已启动
- 后端端口是否为 `4000`
- 或者 `frontend/.env.local` 是否正确设置了 `VITE_API_BASE_URL`

当前前端不会再自动模拟生成；看到连接失败就说明请求没有成功到达后端。

### 报错“Skill 包中未找到 SKILL.md”

上传的 `.zip` 内部必须包含 `SKILL.md`。如果是本地预置 Skill，也需要保证：

```text
skills/<skill-name>/SKILL.md
```

### 国内/通用 OpenAI 兼容接口如何填写

选择“国内/通用 OpenAI 兼容接口”后，接口地址填写兼容服务的 base URL。常见示例：

```text
阿里百炼：https://dashscope.aliyuncs.com/compatible-mode/v1
腾讯混元：https://api.hunyuan.cloud.tencent.com/v1
DeepSeek：https://api.deepseek.com
```

后端会调用：

```text
<base-url>/chat/completions
```

例如选择阿里百炼时：

- 接口地址：`https://dashscope.aliyuncs.com/compatible-mode/v1`
- 模型：`qwen-plus`、`qwen-max` 或百炼控制台中可用的兼容模型名

选择 DeepSeek 时：

- 接口地址：`https://api.deepseek.com`
- 模型：`deepseek-chat` 或 DeepSeek 控制台中可用的模型名

选择腾讯混元时：

- 接口地址：`https://api.hunyuan.cloud.tencent.com/v1`
- 模型：填写混元控制台中支持 OpenAI 兼容调用的模型名

### Azure OpenAI 如何填写

选择 `Azure OpenAI` 后需要填写：

- 接口地址：`https://your-resource.openai.azure.com`
- 部署名称：Azure deployment name
- API Version：例如 `2024-10-21`

## 输出目录

每次生成会在 `outputs/` 下创建一个 job 目录：

```text
outputs/
  <job-id>/
    preview.html
    deck.pptx
    deck.pdf
```

后端会通过 `/outputs/...` 静态访问这些文件。
