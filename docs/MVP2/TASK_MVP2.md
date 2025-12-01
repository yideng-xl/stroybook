# TASK: MVP2 - 任务分解清单

## 1. 后端基础设施 (Backend Infrastructure)
- [ ] **TASK-201: 初始化 Spring Boot 工程**
    - **Action**: 在 `backend/` 目录创建项目，引入 Web, JPA, Postgres, Security, Lombok, JJWT 依赖。
    - **Output**: 可运行的空项目，连接本地数据库成功。
- [ ] **TASK-202: 实体与数据层开发**
    - **Action**: 定义 `User`, `Story`, `StoryStyle`, `ReadingProgress` 实体及对应的 Repository。
    - **Output**: 数据库表结构自动生成。

## 2. 核心服务开发 (Core Services)
- [ ] **TASK-203: 实现故事同步服务 (Sync Service)**
    - **Action**: 编写 `StorySyncService`，实现扫描 `../stories` 并写入数据库的逻辑。实现 `ResourceHandler` 映射静态图片。
    - **Output**: 启动应用后，数据库 `stories` 表自动填充数据，且图片可通过 `http://localhost:8080/stories/...` 访问。
- [ ] **TASK-204: 实现故事查询接口**
    - **Action**: 开发 `StoryController`，提供列表和详情 API。
    - **Output**: `GET /api/stories` 返回 JSON 数据。

## 3. 安全与用户体系 (Security & User)
- [ ] **TASK-205: 集成 JWT 认证**
    - **Action**: 配置 Spring Security 过滤器链，实现 JWT 生成与验证工具类。
    - **Output**: 受保护接口拒绝无 Token 请求。
- [ ] **TASK-206: 实现注册登录接口**
    - **Action**: 开发 `AuthController`，实现用户注册和登录逻辑。
    - **Output**: Postman 测试注册登录流程通过。
- [ ] **TASK-207: 实现阅读历史接口**
    - **Action**: 开发 `HistoryController`，实现进度的保存与查询。
    - **Output**: API 可读写 `reading_progress` 表。

## 4. 前端对接 (Frontend Integration)
- [ ] **TASK-208: 前端 API 封装**
    - **Action**: 移除本地 Mock 数据逻辑，封装 `api/client.ts`，配置 Axios 拦截器处理 Token。
- [ ] **TASK-209: 开发登录/注册页面**
    - **Action**: 新增 `/login` 路由和页面。
- [ ] **TASK-210: 联调故事列表与详情**
    - **Action**: 首页和阅读页改用后端 API 数据。
- [ ] **TASK-211: 联调阅读历史**
    - **Action**: 阅读页翻页时自动调用 API 保存进度；首页展示“继续阅读”卡片。

## 6. MVP2 增强特性 (Enhancements)
- [ ] **TASK-213: 实现密码复杂度校验与修改接口**
    - **Backend**: `AuthService` 添加正则校验；新增 `change-password` 接口。
    - **Frontend**: 注册页增加“确认密码”和正则提示；新增修改密码页。
- [ ] **TASK-214: 实现未登录阅读限制**
    - **Backend**: 新增 `GuestReadingLimit` 实体/Redis记录。在 `getStoryContent` 中检查计数。
    - **Frontend**: 生成并存储 `guest_id`，请求时携带。处理 403 限流错误（提示登录）。
- [ ] **TASK-215: 实现“我的书架”与阅读计时**
    - **Backend**: `ReadingProgress` 增加 `duration` 字段。
    - **Frontend**: 阅读页增加计时器（`useInterval`），退出或心跳上报时长。新增 `/bookshelf` 页面。