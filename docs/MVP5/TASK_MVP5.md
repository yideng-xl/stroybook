# MVP5: 用户声音克隆 - 任务清单

## Phase 1: TTS Infrastructure (Python)
- [ ] **Task 1.1: 创建 Python 项目结构**
    - 创建 `tts-service/` 目录。
    - 初始化 `requirements.txt` (FastAPI, uvicorn, torch, torchaudio, neutts-air 等)。
- [ ] **Task 1.2: 编写 TTS Wrapper Service**
    - 实现 `main.py`。
    - 定义 API 接口 `POST /tts`。
    - 集成 `neuphonic/neutts-air` 模型加载与推理逻辑。
    - **验证点**: 本地调用 API，成功生成音频文件。
- [ ] **Task 1.3: 编写部署文档与脚本**
    - 创建 `Dockerfile` (Linux 部署用)。
    - 编写 `README_DEPLOY.md` (包含 Win11 和 Docker 部署指南)。

## Phase 2: Backend Development (Java)
- [ ] **Task 2.1: 数据库迁移**
    - 创建 `UserVoice` 实体。
    - 更新数据库 Schema (Flyway 或 JPA auto-ddl)。
- [ ] **Task 2.2: 实现 Voice API**
    - `VoiceController`:
        - `POST /api/voices`: 上传音频文件，保存到 `stories/voices/`，写入 DB。
        - `GET /api/voices`: 获取当前用户的声音列表。
- [ ] **Task 2.3: 更新 Story Generation Logic**
    - 更新 `StoryGenerationRequest` DTO，增加 `voiceId` 字段。
    - 在调用 N8N Webhook 时，查询 `voiceId` 对应的 `filePath`，并将其作为参数传递给 N8N。

## Phase 3: Frontend Development (React)
- [ ] **Task 3.1: 开发“我的声音”管理面板**
    - 在个人中心增加 Tab 或页面。
    - 实现文件上传组件 (限制 .wav/.mp3, < 10MB)。
    - 显示已上传的声音列表。
- [ ] **Task 3.2: 更新“生成故事”表单**
    - 在选择朗读角色时，从后端获取 `my voices` 列表。
    - 允许用户选择“我的克隆声音”。

## Phase 4: Integration (N8N)
- [ ] **Task 4.1: 修改 N8N Workflow**
    - 接收 `voice_path` 参数。
    - 增加 IF 节点: 如果 `voice_path` 存在，则调用 **Custom TTS Service**；否则调用原有 TTS 节点。
    - 确保 TTS Service 返回的音频流能被后续节点正确处理（上传/保存）。

## Phase 5: Verification
- [ ] **Task 5.1: 端到端测试**
    - 用户上传声音 -> 生成故事 -> 故事朗读声音为用户声音。
