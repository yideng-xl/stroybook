# N8N 音频生成与写入规范 (Audio Generation Spec)

## 1. 概述
本规范是对 MVP3 N8N 工作流的扩展，旨在增加“文本转语音 (TTS)”和“音频文件写入”步骤。我们将使用 Google Cloud Text-to-Speech API，并通过 API Key 进行简化认证。

## 2. Google Cloud Platform (GCP) 前置条件：API Key

为了简化 N8N 配置，我们使用 API Key 进行认证：

#### 2.1 创建 GCP 项目并启用 API
*   访问 [Google Cloud Console](https://console.cloud.google.com/)。
*   创建或选择一个项目。
*   导航到 **“API 和服务”** > **“库”**，搜索并启用 **“Cloud Text-to-Speech API”**。

#### 2.2 创建 API Key
*   导航到 **“API 和服务”** > **“凭据”**。
*   点击 **“创建凭据”** > **“API 密钥”**。
*   复制生成的 API Key（以 `AIza` 开头）。
*   (可选) 点击密钥名称，限制密钥仅可用于 **Cloud Text-to-Speech API**。

#### 2.3 在 N8N 中配置 API Key 变量
*   建议在 N8N 的全局变量或 Workflow 变量中设置 `GOOGLE_API_KEY_FOR_TTS`，值为您的 API Key。
*   或者在后续配置中直接使用该 Key。

## 3. N8N 工作流配置：HTTP Request 节点调用 Google Cloud TTS API

#### 3.1 流程变更点与连线
在 MVP3 的“生成故事文本”节点之后，“写入文件”节点之前，需要插入音频生成逻辑。

**连线至关重要，请仔细检查：**

1.  **`Loop` 分支（循环体）**:
    *   **连接方式**: 将 `Loop Over Items` 的 **`Loop`** 输出连接到 **TTS (HTTP Request)** 节点，然后连接到 **Write Binary File** 节点。
    *   **注意**: 循环体内的最后一个节点（例如 `Write Binary File`）**不要**连接到回调节点，也不要连回 `Loop Over Items` 节点。让它作为该分支的终点即可。

2.  **`Done` 分支（循环结束）**:
    *   **连接方式**: 将 `Loop Over Items` 的 **`Done`** 输出直接连接到 **HTTP Request (Callback)** 节点。
    *   **作用**: 只有当所有页面都处理完毕后，`Done` 分支才会被触发**一次**。
*   **Batch Size**: 建议设置为 `1`，确保每个页面按顺序生成音频。

#### 3.2 TTS 节点配置 (使用 HTTP Request 节点调用 Google Cloud TTS)

您需要为中文和英文 TTS 分别配置一个 HTTP Request 节点。

##### 3.2.1 HTTP Request (中文 TTS)

*   **节点名称**: `Synthesize Chinese Audio (GCP TTS)`
*   **设置 (Settings)** 选项卡:
    *   **Authentication**: `None` (我们将通过 URL 参数传递 API Key)
    *   **Request Method**: `POST`
    *   **URL**: `https://texttospeech.googleapis.com/v1/text:synthesize?key={{env("GOOGLE_API_KEY_FOR_TTS")}}`
        *   *注意*: 请将 `{{env("GOOGLE_API_KEY_FOR_TTS")}}` 替换为您的实际 API Key，或者确保环境变量已配置。
    *   **Body Content Type**: `JSON`
    *   **JSON Body**:
        ```json
        {
          "input": {
            "text": {{ JSON.stringify($json.textZh) }} // 使用 JSON.stringify() 处理特殊字符
          },
          "voice": {
            "languageCode": "zh-CN",
            "name": "cmn-CN-Wavenet-A"  // 已更新为指定中文语音
          },
          "audioConfig": {
            "audioEncoding": "MP3" // 明确请求 MP3 格式
          }
        }
        ```
    *   **Headers**:
        *   `Content-Type`: `application/json`
    *   **Response (响应)** 选项卡:
        *   **Response Format**: `JSON`
        *   *注意*: 由于 Google API 返回的是 Base64 字符串，我们需要后续添加一个 Code 节点将其转换为二进制文件。

#### 3.2.2 HTTP Request (英文 TTS - 使用 Journey 声音)

*   **节点名称**: `Synthesize English Audio (Journey)`
*   **设置 (Settings)** 选项卡:
    *   **Authentication**: `None`
    *   **Request Method**: `POST`
    *   **URL**: `https://texttospeech.googleapis.com/v1/text:synthesize?key={{env("GOOGLE_API_KEY_FOR_TTS")}}`
    *   **Body Content Type**: `JSON`
    *   **JSON Body**:
        ```json
        { 
          "input": {
            "text": {{ JSON.stringify($json.textEn) }} // 使用 JSON.stringify() 处理特殊字符
          },
          "voice": {
            "languageCode": "en-US",
            "name": "en-US-Journey-F" // 示例英文语音，更具表现力，请查阅 [Google Cloud TTS 文档](https://cloud.google.com/text-to-speech/docs/voices) 选择合适语音
          },
          "audioConfig": {
            "audioEncoding": "MP3" // 明确请求 MP3 格式
          }
        }
        ```
    *   **Headers**:
        *   `Content-Type`: `application/json`
    *   **Response (响应)** 选项卡:
        *   **Response Format**: `JSON`

### 3.3 Base64 转二进制 (Code 节点)

在每个 TTS HTTP Request 节点之后，必须连接一个 **Code 节点**，将 Google API 返回的 Base64 字符串转换为 N8N 的二进制数据对象。

*   **节点名称**: `Convert Base64 to Binary`
*   **Language**: `JavaScript`
*   **Code**:
    ```javascript
    const audioBase64 = $input.item.json.audioContent;
    
    // 如果没有音频内容，直接返回（避免报错）
    if (!audioBase64) return $input.item;

    return {
      json: $input.item.json, // 保留原有 JSON 数据以便后续使用（如 pageNumber）
      binary: {
        audioContent: { // 将二进制数据存储在 'audioContent' 属性中
          data: audioBase64, 
          mimeType: 'audio/mpeg',
          fileName: 'audio.mp3'
        }
      }
    };
    ```

### 3.4 文件写入配置 (Write Binary File)
在 Code 节点之后，连接到 `Write Binary File` 节点。

#### 3.4.1 中文音频写入
*   **节点名称**: `Write Chinese Audio File`
*   **设置 (Settings)** 选项卡:
    *   **Binary Data**: `audioContent` (来自 Code 节点的输出属性名)
    *   **File Name**: `page-{{$json.pageNumber}}-zh.mp3`
    *   **File Path**: `/home/ubuntu/n8n/workspace/storybook/stories/{{$json.storyId}}/`
        *   *注意*: 确保 N8N 进程对该目录有写入权限。

#### 3.4.2 英文音频写入
*   **节点名称**: `Write English Audio File`
*   **设置 (Settings)** 选项卡:
    *   **Binary Data**: `audioContent`
    *   **File Name**: `page-{{$json.pageNumber}}-en.mp3`
    *   **File Path**: `/home/ubuntu/n8n/workspace/storybook/stories/{{$json.storyId}}/`

#### 3.5 完整写入路径示例
假设:
- `storyId` = `a1b2c3d4...`
- `pageNumber` = `1`
- N8N 根目录 = `/home/ubuntu/n8n/workspace/storybook`

则写入路径为:
`/home/ubuntu/n8n/workspace/storybook/stories/a1b2c3d4.../page-1-zh.mp3`

## 4. 注意事项
- **API Key 限制**: 建议在 Google Cloud Console 中对 API Key 进行 IP 限制或 HTTP Referrer 限制，以提高安全性。
- **TTS 服务名称**: `cmn-CN-Wavenet-D` 和 `en-US-Journey-F` 只是示例语音名称。您需要查阅 [Google Cloud TTS 文档](https://cloud.google.com/text-to-speech/docs/voices) 以获取所有可用的语音名称和语言代码。特别是中文，目前 Journey 声音可能暂不支持，建议使用 Wavenet 或 Neural2 系列。
- **文件权限**: 确保 N8N 有权限写入目标目录。
- **并发控制**: 如果 TTS 服务有速率限制，请在 Loop 中增加 `Wait` 节点以避免超限。
