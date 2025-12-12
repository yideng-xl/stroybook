# TASK: Rename Backend to Storybook Service

## 1. 目录重命名 (Directory Rename)
- [ ] **TASK-REF-01: 重命名文件夹**
    - **Action**: `mv backend storybook-service`
    - **Verify**: 文件夹存在且内容完整。

## 2. 配置更新 (Configuration Update)
- [ ] **TASK-REF-02: 更新 Java 项目配置 (`pom.xml`)**
    - **Target**: `storybook-service/pom.xml`
    - **Action**: 
        - `<artifactId>backend</artifactId>` -> `<artifactId>storybook-service</artifactId>`
        - `<name>backend</name>` -> `<name>storybook-service</name>`
- [ ] **TASK-REF-03: 更新 PM2 配置 (`ecosystem.config.js`)**
    - **Target**: `ecosystem.config.js`
    - **Action**: 更新 `cwd` 或 `script` 路径指向 `storybook-service`。

## 3. 文档批量替换 (Documentation Batch Replace)
- [ ] **TASK-REF-04: 更新所有 Markdown 文档引用**
    - **Target**: `docs/**/*.md`, `README.md`
    - **Action**: 替换路径引用 `backend/` -> `storybook-service/`，替换一些特定的 "Backend" 能够指代这个模块的地方。
    - **Note**: 也就是要把 `backend` 这个词作为目录名时替换，作为架构名词（"Frontend and Backend"）时保留。

## 4. 验证 (Verification)
- [ ] **TASK-REF-05: 编译验证**
    - **Action**: 在 `storybook-service` 目录下运行 `mvn clean install`。
