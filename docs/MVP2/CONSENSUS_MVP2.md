# CONSENSUS: MVP2 - 用户体系与后端服务

## 1. 需求概述
在 MVP1 基础上，引入 Java Spring Boot 后端和 PostgreSQL 数据库。
**核心变更**:
- 增加用户注册/登录功能。
- 增加阅读历史记录功能。
- **架构变更**: 故事元数据由后端扫描并同步到数据库，前端改为通过 API 获取数据，不再依赖静态 JSON 索引。

## 2. 核心功能与验收标准

### 2.1 数据同步 (Data Sync)
- **功能**: 后端启动时（或通过管理接口）扫描 `stories/` 目录。
- **逻辑**:
    - 读取 `story.json` -> 存入/更新 `stories` 表。
    - 读取子目录风格 -> 存入/更新 `story_styles` 表。
- **验收标准**: 数据库中能准确查询到文件系统中的所有故事及其风格信息。

### 2.2 用户鉴权 (Auth)
- **功能**: 
    - 注册 (用户名/密码)。
    - 登录 (返回 JWT Token)。
    - 接口保护 (部分接口需携带 Token)。
    - **修改密码**: 登录用户可修改密码。
    - **密码策略**: 长度>=8，包含大写/小写/数字/特殊字符中的至少2种。注册时需二次确认。
- **技术**: Spring Security + JWT。

### 2.3 阅读历史与书架 (History & Bookshelf)
- **功能**:
    - `POST /api/history`: 记录当前读到的页码 **及本次阅读时长**。
    - `GET /api/history`: 获取用户最近读过的绘本列表（我的书架）。
    - **书架展示**: 显示封面、阅读进度、最后阅读时间、累计阅读时长。
- **验收标准**: 用户换设备登录后，能看到之前的阅读记录；点击记录能跳转到上次读到的页码。

### 2.4 权限与限制 (Permissions)
- **新建故事**: 仅限登录用户 (MVP3 预留接口，MVP2 需实现权限拦截)。
- **阅读限制**:
    - **未登录用户**: 每天只能阅读 **2本** 不同的故事。
    - **已登录用户**: 无限制。
    - *实现*: 前端生成 GuestID，后端基于 GuestID + Date 记录阅读计数。

## 3. 技术规范

### 3.1 后端技术栈
- **Language**: Java 17+ (OpenJDK)。
- **Framework**: Spring Boot 3.x。
- **Database**: PostgreSQL 14+。
- **ORM**: Spring Data JPA (Hibernate)。
- **Build**: Maven 或 Gradle (建议 Maven)。

### 3.2 数据库模型 (Schema Draft)
- `users`: id, username, password_hash, created_at.
- `stories`: id (String, folder_name), title_zh, title_en, created_at.
- `story_styles`: id, story_id, style_name, cover_image_path.
- `reading_progress`: id, user_id, story_id, style_id, current_page, updated_at.

### 3.3 接口规范 (API)
- `GET /api/stories`: 获取故事列表 (支持搜索/筛选)。
- `GET /api/stories/{id}`: 获取详情。
- `POST /api/auth/login`: 登录。
- `GET /api/history`: 获取历史。

## 4. 交付物
- Spring Boot 工程代码 (`backend/`).
- 数据库初始化 SQL 脚本。
- 更新后的前端代码 (对接 API)。

## 5. 风险
- **同步冲突**: 如果文件删除了，数据库同步逻辑需处理“软删除”或标记为不可用。