# CONSENSUS: MVP4 - 语音播放故事

## 1. 需求概述 (Requirements)
为绘本阅读器添加语音朗读功能。用户可在 PC/Mobile 端播放故事内容，支持中文和英文双语，并提供自动播放选项。音频文件将在故事生成时预先生成并存储。

## 2. 核心功能与验收标准 (Acceptance Criteria)

### 2.1 音频生成与存储 (N8N)
- **生成**：在 MVP3 故事生成流程中，N8N 工作流应为每页的中文和英文文本生成对应的 MP3 音频文件。
- **文件命名约定**：
    - 中文音频: `page-<页码>-zh.mp3` (例如 `page-1-zh.mp3`)
    - 英文音频: `page-<页码>-en.mp3` (例如 `page-1-en.mp3`)
- **存储路径**：音频文件应存储在 `stories/{storyId}/` 目录下，与 `story.json` 同级。
- **验收标准**：成功生成的故事文件夹中，除 `story.json` 和图片样式文件夹外，应包含对应的中英文音频文件。

### 2.2 后端数据同步 (Backend)
- **实体扩展**：`StoryPage` 实体应新增 `audioUrlZh` 和 `audioUrlEn` 字段，存储音频文件的 URL 路径。
- **同步逻辑**：`StorySyncService` 扫描故事目录时，应识别并读取 `stories/{storyId}/page-X-zh.mp3` 和 `stories/{storyId}/page-X-en.mp3` 文件，并将其路径更新到对应的 `StoryPage` 记录中。
- **验收标准**：数据库中 `story_pages` 表的 `audio_url_zh` 和 `audio_url_en` 字段应正确填充对应的音频 URL。

### 2.3 前端音频播放器 (Frontend)
- **播放控件**：在阅读页面 (`ReadPage.tsx`) 的每页区域（或控制栏）显示一个播放/暂停按钮。
- **语言联动**：
    - 当阅读器切换到中文显示时，播放中文音频 (`audioUrlZh`)。
    - 当阅读器切换到英文显示时，播放英文音频 (`audioUrlEn`)。
    - 在双语模式下，默认播放中文音频，或提供切换选项。
- **自动播放设置**：在阅读页或全局设置中，提供一个开关用于启用/禁用“翻页自动朗读”功能。
- **播放状态**：播放按钮应能正确显示播放/暂停状态。
- **验收标准**:
    - 阅读页面显示播放按钮，点击后能播放当前页音频。
    - 切换语言模式能播放对应语言的音频。
    - 开启自动播放后，翻页时自动开始朗读新页内容。
    - 音频播放流畅，无明显卡顿或延迟。

## 3. 技术规范 (Technical Specifications)

### 3.1 Backend
- **实体扩展**: `storybook-service/src/main/java/com/storybook/entity/StoryPage.java` 新增 `audioUrlZh: string`, `audioUrlEn: string`。
- **同步逻辑**: `storybook-service/src/main/java/com/storybook/service/impl/StorySyncServiceImpl.java` 修改 `syncStoryFilesInternal`，根据 `storyId` 目录查找音频文件并更新 `StoryPage`。

### 3.2 Frontend
- **音频管理**: 封装一个 `useAudioPlayer` hook 或 `AudioPlayer` 组件，管理 `HTMLAudioElement` 的状态和播放逻辑。
- **阅读器集成**: 修改 `FlipBookViewer.tsx` 和 `ScrollViewer.tsx`，接收音频 URL，并在翻页时（或接收到播放指令时）触发播放。
- **控制栏**: 修改 `ReaderControls.tsx`，添加播放按钮和自动播放开关。

### 3.3 N8N Workflow
- **TTS 节点**：集成一个 Text-to-Speech (TTS) 服务（如 OpenAI TTS / Google Cloud TTS），接收文本，输出 MP3 音频文件。
- **文件写入节点**：将生成的 `page-X-zh.mp3` 和 `page-X-en.mp3` 写入 `stories/{storyId}/` 目录。

## 4. 交付物 (Deliverables)
1.  **后端代码**: `StoryPage` 实体更新，`StorySyncService` 更新。
2.  **前端代码**: 阅读器组件更新，音频播放逻辑，控制栏 UI。
3.  **文档更新**: `DESIGN_MVP4.md`, `TASK_MVP4.md`, `FINAL_MVP4.md`, `TODO_MVP4.md`。
4.  **N8N 工作流指南** (可选，N8N 流程的 JSON 导出或详细步骤)。

## 5. 风险与约束
- **音频生成质量**：TTS 服务的选择对音质影响大。
- **生成时间**：音频生成会增加 N8N 整体流程的时间。
- **存储成本**：音频文件会增加存储占用。
