# ALIGNMENT: MVP3 - 故事创作与 N8N 集成

## 1. 项目背景与目标
**目标**: 允许用户在 Web 端创建新故事，并通过 N8N 工作流自动生成绘本内容（文本 + 图片）。
**当前基础**: MVP2 已实现用户系统、后端 API 和数据库存储，故事数据来源于文件系统同步。

## 2. 核心需求分析

### 2.1 故事创作 (用户侧)
- **入口**: 首页或个人中心增加“创作故事”按钮。
- **输入**: 用户需提供生成故事的核心参数。
    - **核心创意/提示词** (Prompt): 例如 "一只想飞的企鹅"。
    - **风格选择**: 复用现有的风格库（迪士尼、黏土等）。
- **输出**: 提交后进入“生成中”状态，最终生成一个新的绘本。

### 2.2 N8N 集成 (系统侧)
- **触发机制**:
    - 用户提交请求 -> Backend API (创建 `Story` 记录，状态为 `GENERATING`) -> **调用 N8N Webhook**。
    - 传递参数: `userId`, `storyId` (后端预生成的 UUID), `prompt`, `style` 等。
- **生成流程 (N8N)**:
    - 1. 接收 Webhook 请求。
    - 2. 生成故事大纲与文本 (LLM)。
    - 3. 生成分镜描述 (Image Prompts)。
    - 4. 生成图片 (Stable Diffusion / Midjourney)。
    - 5. **保存文件**: 将生成的 `story.json` 和图片文件写入服务器的 `stories/{storyId}/{style}` 目录。
- **闭环通知 (Callback)**:
    - N8N 完成文件写入后，调用 Backend 的 **回调接口** (`POST /api/stories/callback`)。
    - 传递参数: `storyId`, `status` (`SUCCESS`/`FAILED`), `errorMessage` (可选)。
    - Backend 收到通知后，更新 `Story` 状态（`PUBLISHED`/`FAILED`），触发数据同步（将新文件内容入库），并向前端发送通知（可选，通过 WebSocket 或轮询）。

## 3. 已确认决策点 (Key Decisions)

### 3.1 交互流程
- **异步模式**: 用户提交生成请求后，前端提示“正在生成中，请稍后在书架查看”，用户可以离开页面。书架页面将显示生成中的故事卡片（例如带有加载动画或灰色状态），直到生成完成。

### 3.2 输入参数
- 用户需要输入 **核心创意/提示词** (Prompt)。
- 用户需要 **选择故事风格** (从现有风格库中选择)。
- 故事标题可由 AI 根据 Prompt 自动生成，或允许用户输入。

### 3.3 N8N 通信与文件管理
- **N8N 与 Backend 通信**: Backend 通过 HTTP 调用 N8N Webhook。
- **文件写入**: N8N 直接将生成的文件写入服务器的 `stories` 目录（沿用 MVP2 的软链接/共享文件系统方案）。
- **回调机制**: N8N 生成完成后，通过 HTTP 调用 Backend 的回调接口进行状态更新和数据同步。

## 4. 技术方案草案 (Proposed Technical Solution)

### 4.1 Backend
- 新增 `POST /api/stories/generate`: 
    - 接收 `prompt`, `style`。
    - 生成 `storyId` (UUID)。
    - 在数据库中创建 `Story` 记录，状态设为 `GENERATING`。
    - 构建 N8N Webhook URL，发送 HTTP POST 请求。
    - 返回 `storyId` 给前端。
- 新增 `POST /api/stories/callback`: 
    - 接收 `storyId`, `status`, `errorMessage`。
    - 根据 `storyId` 更新数据库中的 `Story` 状态 (`PUBLISHED`/`FAILED`)。
    - 如果成功，触发故事文件扫描和服务同步（将 `stories/{storyId}` 下的文件内容加载到数据库）。

### 4.2 Frontend
- 新增 `CreateStoryPage` (或 Modal)。
    - 包含 Prompt 输入框和风格选择器。
    - 提交表单调用 `POST /api/stories/generate`。
    - 提交成功后，跳转到书架页或显示通知。
- 更新 `HomePage` (书架页) 和 `StoryCard` 组件：
    - 根据 `Story` 状态显示“生成中”UI。
    - 实现轮询机制 (Polling) 或考虑 WebSocket (更复杂) 以实时更新故事状态。

### 4.3 N8N Workflow (外部依赖)
- **Webhook 节点**: 监听来自 Backend 的请求。
- **LLM 节点**: 根据 Prompt 生成故事文本。
- **图像生成节点**: 根据文本生成图片。
- **文件写入节点**: 将生成的 JSON 和图片写入 `/home/ubuntu/n8n/workspace/storybook/stories/{storyId}/{style}`。
- **Webhook 回调节点**: 调用 `POST /api/stories/callback` 通知 Backend。