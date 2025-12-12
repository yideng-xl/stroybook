# MVP5: 用户声音克隆 - 系统架构设计

## 1. 整体架构图

```mermaid
graph TD
    User[用户 (Web/Mobile)] -->|上传声音样本| Backend[Spring Boot Backend]
    Backend -->|存储音频文件| FileSystem[Local Storage /stories]
    Backend -->|保存记录| DB[(PostgreSQL)]
    
    User -->|生成故事 (选择克隆声音)| Backend
    Backend -->|触发生成| N8N[N8N Workflow]
    
    subgraph "AI Infrastructure"
        N8N -->|1. 生成文本| LLM[LLM Service]
        N8N -->|2. 生成图片| SD[Stable Diffusion]
        N8N -->|3. 生成语音| TTSService[Custom TTS Service (FastAPI)]
    end
    
    TTSService -->|加载模型| NeuTTS[NeuTTS-Air Model]
    TTSService -->|读取参考音频| FileSystem
    TTSService -->|返回音频流| N8N
    
    N8N -->|回调结果| Backend
```

## 2. 核心组件：Custom TTS Service

为了将 `neuphonic/neutts-air` 集成到 N8N，我们需要开发一个独立的微服务。

*   **技术栈**: Python 3.10+, FastAPI, Uvicorn.
*   **依赖**: `neutts-air`, `torch`, `torchaudio`.
*   **硬件要求**: NVIDIA GPU (推荐 VRAM >= 4GB) + CUDA 11.8/12.x。

### 2.1 接口定义

#### `POST /tts`
根据文本和参考音频生成语音。

*   **Request Body**:
    ```json
    {
      "text": "很久很久以前，有一只小兔子...",
      "reference_audio_path": "/app/data/stories/user_123/voice_sample.wav", 
      "language": "zh"
    }
    ```
    *注意：`reference_audio_path` 需要是服务本地可访问的路径。我们需要挂载共享卷。*

*   **Response**: Audio File (WAV/MP3)

#### `GET /health`
健康检查，确保模型已加载。

## 3. 数据流与存储

1.  **样本上传**:
    *   前端上传 -> 后端保存至 `stories/voices/{username}/{timestamp}.wav`。
    *   数据库 `user_voices` 表记录路径: `voices/{username}/{timestamp}.wav`。
2.  **生成调用**:
    *   N8N 接收 `voice_path` 参数。
    *   N8N 调用 TTS Service，传入**绝对路径**（需确保 Docker 卷挂载一致）。

## 4. 部署方案

### 4.1 方案 A: Windows 11 (原生/Conda)
适合本地开发机。
*   **前置条件**: 安装 NVIDIA 驱动, 安装 CUDA Toolkit, 安装 Anaconda/Miniconda。
*   **运行方式**: `uvicorn main:app --host 0.0.0.0 --port 8000`

### 4.2 方案 B: Linux (Docker + NVIDIA Container Toolkit)
适合生产服务器。
*   **基础镜像**: `pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime`
*   **关键配置**: `--gpus all`
*   **卷挂载**: `-v /host/stories:/app/data/stories` (确保能读取到后端上传的文件)

## 5. 模块设计

### 5.1 数据库变更
在 `backend` 模块中：
*   新增 `UserVoice` 实体。
*   `User` 1:N `UserVoice` (MVP限制为 1:1 或仅取最新)。

```java
@Entity
@Table(name = "user_voices")
public class UserVoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    private String name; // e.g. "Daddy's Voice"

    private String filePath; // e.g. "voices/john/sample.wav"
    
    private String provider; // "NEUTTS_AIR"
}
```

## 6. 开发计划
1.  **Step 1: 开发 TTS Service** (Python)。编写代码，本地跑通 `neutts-air`。
2.  **Step 2: 编写部署脚本** (Dockerfile, README)。
3.  **Step 3: 后端开发** (API, DB)。
4.  **Step 4: 前端开发** (上传界面)。
5.  **Step 5: N8N 集成**。
