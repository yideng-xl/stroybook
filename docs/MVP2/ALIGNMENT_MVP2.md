# ALIGNMENT: MVP2 - 用户体系与后端服务

## 1. 项目背景与目标
**当前状态**: MVP1 设计完成（纯前端，读取本地文件）。
**MVP2 目标**: 引入后端服务，实现用户管理和阅读历史记录功能。
**核心变更**:
- 架构从 Serverless/Static 演变为 Client-Server。
- 引入数据库持久化用户数据。

## 2. 技术栈需求 (基于原始需求)
- **后端框架**: Java Spring Boot (建议版本 3.x, JDK 17/21)。
- **数据库**: PostgreSQL。
- **运行环境**: OpenJDK。
- **前端对接**: React 前端需增加 API 调用层 (Axios/Fetch)，对接后端接口。

## 3. 核心功能分析

### 3.1 用户体系 (User System)
- **注册/登录**:
    - 基础的用户名/密码注册。
    - 登录鉴权 (JWT Token 机制)。
- **用户信息**: 昵称、头像（可选 MVP3）。

### 3.2 读书历史 (Reading History)
- **记录逻辑**: 当用户阅读某个故事时，自动记录。
    - 记录内容：用户ID、故事ID、最后阅读页码、阅读时间。
    - 业务逻辑：如果记录已存在，更新页码和时间；如果不存在，创建新记录。
- **展示**:
    - 在首页或个人中心展示“最近阅读”。

### 3.3 故事数据同步问题 (Challenge)
- **现状**: 故事元数据存储在文件系统 (`stories/`)，由前端扫描生成索引。
- **问题**: 后端数据库记录“阅读历史”时，需要引用 `story_id`。
- **策略**: 
    - **弱关联**: 数据库仅存储 `story_id` 字符串，不强制外键约束到“故事表”（因为故事在文件里）。
    - **后端扫描 (可选)**: 后端也实现一套扫描 `stories/` 文件夹的逻辑，以便提供更强大的搜索或校验功能。
    - *建议*: MVP2 保持简单，后端仅作为“用户数据”的存储，对故事内容保持“无知”，仅存储 ID。

## 4. 待确认决策点 (Key Decisions)

### 4.1 鉴权方式
- 使用 **Spring Security + JWT** (无状态，适合 SPA) 还是 **Session** (有状态)？
- *推荐*: **JWT**。前端存储 Token，请求头携带 `Authorization: Bearer ...`。

### 4.2 部署架构
- **开发环境**: 前端 Vite (Port 5173) + 后端 Spring Boot (Port 8080)。
- **反向代理**: 是否需要 Nginx 处理跨域，或者直接在 Spring Boot 配置 `@CrossOrigin`？
- *推荐*: 开发期 Spring Boot 配置 CORS 允许前端端口。

### 4.3 数据库设计
- 是否需要设计 `User` 表和 `ReadingProgress` 表？
- 是否需要“书架/收藏”功能？(原始需求未提及，暂仅做历史记录)。

## 5. 接口规范草案
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `POST /api/history` (同步阅读进度)
- `GET /api/history` (获取历史列表)