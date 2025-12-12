# MVP5: N8N 声音克隆集成规范 (Updated)

本文档指导如何在 N8N 中集成自建的 NeuTTS-Air 服务。

## 1. 核心变更：独立的 Redub 工作流

我们将创建两个独立的工作流，分别处理“首次生成”和“重新配音”。

### Workflow A: 故事生成 (Story Generation)
*(保持原有逻辑，但在 TTS 环节增加分支)*
*   **Webhook**: `POST /webhook/generate`
*   **逻辑**: 生成文本 -> 生成图片 -> **(IF voiceId exists ? Custom TTS : Default TTS)** -> 生成默认音频 -> 完成。
*   **注意**: 即使选择了克隆声音，初次生成时通常为了速度和稳定性，建议仍生成默认音频，或者直接生成克隆音频。为了简化，初次生成可以只用默认音。

### Workflow B: 重新配音 (Voice Redubbing) - **新增**
此流程专门用于为已有的故事生成特定用户的配音版本。

*   **Webhook**: `POST /webhook/redub` (需在后端配置此 URL，或复用 URL 并用 IF 节点分流)
*   **参数**:
    *   `storyId`: 故事 ID
    *   `userId`: 用户 ID
    *   `voiceId`: 声音 ID (用于命名文件夹)
    *   `voicePath`: 参考音频的绝对路径 (e.g. `/app/data/stories/voices/123/sample.wav`)

#### 流程步骤详情

1.  **Webhook (Start)**
    *   接收上述参数。

2.  **Read File (读取故事内容)**
    *   节点: `Read Binary File` 或 `Execute Command`
    *   路径: `/app/data/stories/{{$json.storyId}}/story.json`
    *   解析: 将 JSON 字符串解析为 Object，提取 `pages` 数组。

3.  **Split In Batches (遍历页面)**
    *   输入: `pages` 数组。

4.  **HTTP Request (调用 TTS Service)**
    *   URL: `http://tts-service:8000/tts`
    *   Method: `POST`
    *   Body:
        ```json
        {
          "text": "{{ $json.textZh }}", 
          "reference_audio_path": "{{ $node['Webhook'].json.voicePath }}",
          "language": "zh"
        }
        ```
    *   **重要**: 引用 `voicePath` 需指向 Webhook 节点的输入数据。

5.  **Write Binary File (保存音频)**
    *   **路径**: `/app/data/stories/{{$node['Webhook'].json.storyId}}/{{$node['Webhook'].json.userId}}/page-{{$json.pageNumber}}.mp3`
    *   **说明**: 按照您的要求，在 `storyId` 下创建 `userId` 文件夹存放音频。
    *   **注意**: 需确保 `userId` 文件夹已存在，或者使用 `Execute Command` 先创建: `mkdir -p ...`。

6.  **Loop End**: 循环直到所有页面完成。

7.  **HTTP Request (Callback)**
    *   通知后端配音完成。
    *   URL: `http://backend:8080/api/stories/callback`
    *   Body:
        ```json
        {
          "storyId": "{{$node['Webhook'].json.storyId}}",
          "status": "SUCCESS",
          "type": "REDUB" 
        }
        ```

## 2. 后端配置变更
为了支持双 Webhook，建议在 `application.yml` 中增加配置：

```yaml
storybook:
  n8n-webhook-url: "http://n8n:5678/webhook/generate"
  n8n-redub-webhook-url: "http://n8n:5678/webhook/redub" # 新增
```

如果不增加配置，则需要在 N8N 的同一个 Webhook 中加 `IF` 节点判断 `body.type === 'REDUB'`。