# N8N 回调接口规范 (Story Generation Callback)

## 1. 概述
本规范定义了 N8N 工作流在完成故事生成（成功或失败）后，应调用 Spring Boot 后端的回调接口，以更新故事状态。

## 2. 回调 URL
N8N 将向后端的回调接口发送 POST 请求。
URL: `http://your-backend-instance:8080/api/stories/callback`

> **注意：N8N 运行在 Docker 中时的网络连接问题**
> 如果您的 N8N 运行在 Docker 容器中，而后端运行在宿主机上，请勿使用 `localhost` 或 `127.0.0.1`。
> *   **Windows/Mac Docker Desktop**: 使用 `http://host.docker.internal:8080/api/stories/callback`
> *   **Linux Docker**: 使用宿主机的局域网 IP (例如 `192.168.1.100`) 或 Docker 网桥 IP (`172.17.0.1`)。

## 3. 请求方法
`POST`

## 4. 请求头 (Headers)
`Content-Type: application/json`

## 5. 请求体 (Request Body)

后端回调接口接收一个 JSON 对象，包含以下字段：

| 字段名         | 类型     | 描述                                     | 示例                                     |
| :------------- | :------- | :--------------------------------------- | :--------------------------------------- |
| `storyId`      | `string` | 唯一的故事 ID (UUID)，与 N8N Webhook 请求中传入的 `storyId` 相同。 | `"a1b2c3d4-e5f6-7890-1234-567890abcdef"` |
| `status`       | `string` | 故事生成结果状态。可选值：`"SUCCESS"` 或 `"FAILED"`。 | `"SUCCESS"`                              |
| `errorMessage` | `string` | 可选。如果 `status` 为 `"FAILED"`，此处应包含具体的错误信息。 | `"AI 生成图片失败，请检查提示词。"`        |

### 5.1 请求体示例 (成功)

```json
{
  "storyId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "status": "SUCCESS"
}
```

### 5.2 请求体示例 (失败)

```json
{
  "storyId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "status": "FAILED",
  "errorMessage": "图像生成服务超时或提示词不符合规范。"
}
```

## 6. 后端响应
后端将返回 `200 OK` (空响应体) 表示成功接收回调。任何非 `200` 响应表示回调失败。