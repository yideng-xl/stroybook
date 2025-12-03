# N8N Webhook 接口规范 (Story Generation)

## 1. 概述
本规范定义了 Spring Boot 后端调用 N8N 工作流时，N8N Webhook 节点应接收的 JSON 请求体结构。N8N 收到此请求后，将触发故事生成流程。

## 2. Webhook URL
后端将向配置在 `application.yml` 中的 N8N Webhook URL 发送 POST 请求。
例如: `http://your-n8n-instance:5678/webhook/storybook-generate`

## 3. 请求方法
`POST`

## 4. 请求头 (Headers)
`Content-Type: application/json`

## 5. 请求体 (Request Body)

N8N Webhook 节点将接收一个 JSON 对象，包含以下字段：

| 字段名         | 类型     | 描述                                     | 示例                                     |
| :------------- | :------- | :--------------------------------------- | :--------------------------------------- |
| `storyId`      | `string` | 唯一的故事 ID (UUID)，由后端生成。用于 N8N 内部追踪和最终回调后端。 | `"a1b2c3d4-e5f6-7890-1234-567890abcdef"` |
| `prompt`       | `string` | 用户输入的故事创意或提示词。             | `"一只想飞的企鹅的冒险故事"`             |
| `style`        | `string` | 用户选择的故事风格 ID。                  | `"迪士尼"`                               |
| `userId`       | `string` | 创建故事的用户 ID。                      | `"user123"`                              |

### 5.1 请求体示例

```json
{
  "storyId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "prompt": "一只小企鹅梦想着飞向月亮的故事，它为此克服了重重困难。",
  "style": "迪士尼",
  "userId": "some-user-uuid-or-id"
}
```

## 6. N8N Webhook 节点配置指南 (v1.122.4)

为了确保 N8N 能正确接收请求并与后端配合，请按以下参数配置 Webhook 节点：

*   **Authentication**: `None` (MVP阶段暂不鉴权，生产环境建议配合 Header Auth)
*   **HTTP Method**: `POST`
*   **Path**: `/webhook/storybook-generate` (必须与后端 `application.yml` 中的配置一致)
*   **Respond**: `Immediately` (**关键设置**)
    *   *说明*: 选择 "Immediately" 模式，Webhook 节点在收到请求后会立即返回 `200 OK` 给后端，而不会等待整个工作流执行完毕。这对于避免后端超时至关重要。
*   **Response Code**: `200` (配置为 `200 OK`)
*   **Response Data**: (在 N8N 中配置，用于定义 Webhook 响应给后端的数据。通常可以留空以发送默认 `200 OK` 空响应体，或配置一个简单的 JSON 对象如 `{"status": "received", "message": "Webhook request processed."}`。)

## 7. N8N 工作流的响应
N8N Webhook 节点应立即响应 `200 OK`，无需等待故事生成完成。故事的最终状态将通过 N8N 回调接口异步通知后端。