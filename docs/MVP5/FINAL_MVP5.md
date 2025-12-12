# MVP5: 用户声音克隆 - 项目交付报告

## 1. 核心成果
本阶段实现了用户声音克隆与自定义配音功能，增强了故事的个性化体验。

### 1.1 基础设施 (TTS Service)
*   **技术选型**: 自部署 `neuphonic/neutts-air` (Python/FastAPI)。
*   **优势**: 开源免费，支持即时声音克隆，数据隐私安全。
*   **产出物**: 
    *   `tts-service/` 源代码。
    *   `Dockerfile` 和 `README_DEPLOY.md` (Win11/Linux 部署指南)。

### 1.2 后端 (Spring Boot)
*   **数据库**: 新增 `user_voices` 表，更新 `stories` 和 `story_pages` 表。
*   **API**:
    *   `POST /api/voices`: 上传参考音频。
    *   `POST /api/stories/{id}/redub`: 对已有故事进行重新配音。
    *   `POST /api/stories/generate`: 支持携带 `voiceId`。
*   **逻辑**: 集成 N8N Webhook，支持 `REDUB` 模式。

### 1.3 前端 (Web)
*   **页面**:
    *   `/my-voices`: 声音管理面板。
    *   `/create`: 支持选择“我的克隆声音”。
*   **数据**: `Story` 模型增加 `customVoiceId`，支持前端筛选和标记。

## 2. 部署与集成指南

### 2.1 部署 TTS Service
请务必按照 `tts-service/README_DEPLOY.md` 在 GPU 服务器上部署服务。
验证命令：`curl http://localhost:8000/health`

### 2.2 配置 N8N
请参考 `docs/MVP5/N8N_VOICE_SPEC.md`。
*   修改 Webhook 节点，接收 `voicePath` 和 `type`。
*   增加 `IF` 节点判断 `type == 'REDUB'`。
    *   如果是 REDUB，则仅运行 TTS 流程，并回调 Backend。
    *   如果是 GENERATE，则运行完整流程。

### 2.3 数据库更新
后端启动时，Hibernate 会自动更新 Schema。
*   `stories` 表增加 `custom_voice_id`, `audio_status`。
*   `story_pages` 表增加 `custom_audio_url_zh`, `custom_audio_url_en`。

## 3. 遗留事项 (TODO)
*   **前端播放器**: 需更新 `ReadPage.tsx` 中的 `useAudioPlayer`，支持在 `audioUrlZh` 和 `customAudioUrlZh` 之间切换。
*   **N8N 调试**: 需要在实际 N8N 环境中配置并测试 `REDUB` 分支逻辑。

## 4. 总结
MVP5 成功搭建了低成本、高性能的声音克隆基础设施，为 StoryBook V3 增加了强大的竞争壁垒。
