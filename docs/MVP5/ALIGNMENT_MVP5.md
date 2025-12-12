# MVP5: 用户声音克隆 (User Voice Cloning) - 需求对齐文档

## 1. 背景与目标
StoryBook V3 已经实现了基础的 AI 故事生成和固定角色的 TTS 朗读。MVP5 的核心目标是增强用户的**沉浸感**和**个性化体验**，允许家长录制/上传自己的声音样本，系统通过 AI 克隆该声音，并用其朗读生成的故事。

## 2. 核心需求

### 2.1 用户侧 (Frontend)
1.  **声音管理入口**：在“个人中心”或“创建故事”流程中增加“我的声音”管理面板。
2.  **声音样本上传/录制**：
    *   支持上传本地音频文件 (MP3/WAV, < 10MB)。
    *   (可选) 网页端直接录音 (Web Audio API)。
3.  **声音选择**：在“生成故事”时，TTS 角色列表应包含“我的克隆声音”选项。

### 2.2 后端侧 (Backend)
1.  **声音模型管理**：
    *   扩展 `User` 实体，增加 `voiceId` 字段 (或创建独立的 `Voice` 实体，如果支持多声音)。
    *   API: `POST /api/voice/clone` (接收文件，触发克隆流程)。
    *   API: `GET /api/voice` (获取用户声音列表)。
2.  **集成 N8N**：
    *   后端不直接对接 TTS 供应商 (如 ElevenLabs)，而是继续通过 N8N 编排。
    *   后端将音频文件发送给 N8N Webhook。

### 2.3 AI 编排侧 (N8N)
1.  **Voice Cloning Workflow**：
    *   接收音频文件。
    *   调用 TTS 服务商 API (推荐 **ElevenLabs Instant Voice Cloning**)。
    *   返回生成的 `voice_id`。
2.  **Story Generation Workflow 更新**：
    *   接收前端传入的 `voice_id`。
    *   生成音频时使用该特定 ID。

## 3. 技术方案与决策点 (已确认)

### 决策点 1: TTS 供应商选择
*   **选定方案**: **自部署 Neuphonic/NeuTTS-Air**。
    *   **原因**: 开源免费，支持即时声音克隆，支持中文（基于 Qwen），数据隐私性好，避免了 ElevenLabs 的订阅成本。
    *   **挑战**: 需要自建 GPU 环境，需要开发 API Wrapper 以供 N8N 调用。
    *   **部署目标**: 支持 Windows 11 和 Linux (Ubuntu/CentOS) 双平台部署。

### 决策点 2: 数据存储
*   **方案**: 创建 `user_voices` 表 (id, user_id, provider, voice_id/path, name)。
    *   `provider`: 'NEUTTS_AIR'
    *   `voice_id/path`: 存储用户上传的参考音频文件路径（NeuTTS Air 每次生成时需要参考音频）。

### 决策点 3: 系统架构变更
*   新增 **Custom TTS Service (Python/FastAPI)**：
    *   由于 NeuTTS Air 是 Python 库，我们需要封装一个 HTTP 服务。
    *   接口 1: `/clone` (预处理/检查音频，虽然 NeuTTS 是即时的，但我们可能需要转码)。
    *   接口 2: `/tts` (接收文本 + 参考音频路径，返回生成音频)。
*   **N8N 集成**: N8N 通过 HTTP Request 节点调用这个自建服务。

## 4. 风险评估
1.  **硬件要求**: NeuTTS Air 需要 GPU (NVIDIA) 才能达到实时或可接受的速度。纯 CPU 推理可能过慢（需测试）。
2.  **环境配置**: CUDA、PyTorch 等环境配置在不同 OS 上有差异，需提供详细文档。
3.  **音频质量**: 开源模型的抗噪能力可能不如 ElevenLabs，需在前端加强引导（“安静环境录音”）。

## 5. 待确认事项
*   [x] 确认使用自部署 NeuTTS Air。
*   [x] 仅支持文件上传作为 MVP 交互。
