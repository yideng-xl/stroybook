# ALIGNMENT: Rename Backend to Storybook Service

## 1. 背景与目标 (Background & Objective)
**目标**: 将项目根目录下的 `backend` 文件夹重命名为 `storybook-service`，以更准确地反映服务的职能，并保持项目命名的一致性。

## 2. 变更范围 (Scope of Changes)

### 2.1 目录重命名
- `backend/` -> `storybook-service/`

### 2.2 引用更新
需要更新所有引用了 `backend` 路径或名称的文件：

1.  **构建与配置**:
    - `ecosystem.config.js`: 更新服务路径。
    - `backend/pom.xml` (现在的 `storybook-service/pom.xml`): 更新 `artifactId` 和 `name` (如果需要)。
    - `backend/src/main/resources/application.yml`: 检查是否有文件路径配置。

2.  **文档 (Docs)**:
    - `docs/` 目录下的设计文档、任务文档、对齐文档等。
    - `README.md` (如果提及)。

3.  **代码 (Code)**:
    - 前端代码如果硬编码了后端路径 (通常是 API URL, 不太可能是文件路径，但需检查)。
    - 脚本文件。

4.  **N8N集成**:
    - 检查 N8N 相关文档中的路径描述。

## 3. 验证计划 (Verification Plan)
1.  确保重命名后，`mvn clean install` 在 `storybook-service` 下能成功构建。
2.  确保 `ecosystem.config.js` 能正确启动服务。
3.  确保文档 grep search `backend` 结果显著减少（仅保留非路径的普通文本，如 "backend logic"）。
