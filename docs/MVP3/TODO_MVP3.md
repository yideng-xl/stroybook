# TODO: MVP3 - 后续待办事项清单

以下是完成 MVP3 功能后，建议您在生产环境中进一步完善的事项：

## 1. 部署与运维

### 1.1 `application.yml` 配置
- **N8N Webhook URL**：请务必更新 `storybook-service/src/main/resources/application.yml` 中的 `storybook.n8n-webhook-url`，将其替换为您的生产环境 N8N Webhook URL。
- **数据库配置**：确认生产环境的 `spring.datasource` 配置。

### 1.2 权限与安全
- **N8N 回调鉴权**：目前 `POST /api/stories/callback` 接口没有进行鉴权。在生产环境中，强烈建议为该接口添加鉴权机制（例如，N8N 调用时带上一个预共享密钥，后端进行验证），以防止恶意调用。

## 2. N8N 工作流 (External)

### 2.1 权限与目录
- **文件系统权限**：确保 N8N 实例运行的用户对 `/home/ubuntu/n8n/workspace/storybook/stories` 目录拥有**写入权限**。
- **Docker 网络**：如果使用 Docker 部署，请确保 N8N 能通过宿主机 IP 或 `host.docker.internal` 访问后端 API。

## 3. 测试
- **单元测试/集成测试**：强烈建议为 `StoryService`, `N8NService`, `StorySyncService` 编写自动化测试用例，以保证核心逻辑的稳定性。

---