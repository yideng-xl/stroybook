# DESIGN: MVP1 - 幼儿绘本网站架构设计

## 1. 系统架构概览 (System Overview)

本系统采用 **单页应用 (SPA)** 架构，基于 React 和 Vite 构建。数据层依赖于静态文件系统，通过 `manifest.json` 进行索引。系统核心关注点在于**多端响应式适配**和**沉浸式阅读体验**。

```mermaid
graph TD
    User[用户 (PC/Pad/Mobile)] -->|访问| WebApp[React SPA]
    WebApp -->|Fetch| Manifest[story-manifest.json]
    WebApp -->|Load Image| Assets[Stories Images]
    
    subgraph "Data Preparation (Build/Update Time)"
        Stories[Stories Folder] -->|Scan Script| Manifest
    end
    
    subgraph "Frontend Layer"
        Router[React Router]
        Store[Context API (Lang, Theme)]
        
        Router --> HomePage[首页 - 绘本列表]
        Router --> ReadPage[阅读页 - 绘本详情]
        
        HomePage --> Search[搜索/筛选模块]
        HomePage --> Grid[封面网格展示]
        
        ReadPage --> Adapter[设备适配层]
        Adapter -->|PC/Pad| FlipView[仿真翻页视图]
        Adapter -->|Mobile| ScrollView[垂直滑动视图]
        
        ReadPage --> Controls (Lang Switch [ZH/EN/DUAL], Style Switch, Fullscreen)
    end
```

## 2. 核心模块设计 (Core Modules)

### 2.1 路由结构 (Routes)
| 路径 | 组件 | 说明 | 参数 |
| :--- | :--- | :--- | :--- |
| `/` | `HomePage` | 展示绘本列表 | query: `?q=search_term&style=filter` |
| `/read/:storyId` | `ReadPage` | 阅读特定故事 | params: `storyId`; query: `?style=disney` |

### 2.2 数据模型 (Data Models)

#### TypeScript 接口定义

```typescript
// 故事元数据 (对应 story.json)
export interface StoryMetadata {
  id: string;          // 文件夹名称，如 "灰姑娘"
  titleZh: string;
  titleEn: string;
  defaultStyle?: string; // 默认风格，如 "迪士尼"
  pages: StoryPage[];
}

// 页面内容
export interface StoryPage {
  pageNumber: number;
  textZh: string;
  textEn: string;
}

// 风格信息 (扫描生成)
export interface StoryStyle {
  id: string;          // 风格ID，如 "迪士尼"
  name: string;        // 风格显示名称 (通常同ID)
  coverImage: string;  // 封面图路径 (通常是 page-1.png)
}

// 清单索引 (story-manifest.json)
export interface StoryManifestItem {
  id: string;
  titleZh: string;
  titleEn: string;
  styles: StoryStyle[]; // 该故事下所有可用风格
}

export type StoryManifest = StoryManifestItem[];
```

### 2.3 组件层级 (Component Hierarchy)

```
App
├── Layout (Main Container)
│   ├── Header (Logo, SearchBar)
│   └── Content
│       ├── HomePage
│       │   ├── FilterBar (Style Dropdown)
│       │   └── StoryGrid
│       │       └── StoryCard (Cover, Title)
│       └── ReadPage
│           ├── ReaderContainer (Logic: Data Fetching, Style Switching)
│           ├── ReaderControls (Lang Switch, Style Switch, Fullscreen)
│           └── ResponsiveReader (Logic: Device Detection)
│               ├── FlipBookViewer (Desktop Implementation)
│               └── ScrollViewer (Mobile Implementation)
```

## 3. 关键逻辑流程 (Key Logic Flows)

### 3.1 索引加载与初始化
1.  App 启动，`useEffect` 触发 `fetch('/story-manifest.json')`。
2.  数据存入全局 Context 或 React Query 缓存。
3.  如果加载失败（如文件不存在），提示用户“请运行扫描脚本”。

### 3.2 风格与资源路径解析
假设 `storyId="灰姑娘"`, `style="迪士尼"`, `page=1`。
- **资源基准路径**: `/stories/${storyId}/${style}/`
- **图片路径**: `${basePath}page-${page}.png`
- **Prompt路径**: `${basePath}imagePrompt-page${page}.json` (MVP1 仅展示图片，Prompt 可选加载)。

### 3.3 响应式适配策略
- 使用 CSS Media Queries + JS `window.matchMedia` 检测设备类型。
- **Breakpoint**: `768px` (iPad Portrait 宽度)。
- **Logic**:
    - `width >= 768px`: 渲染 `<FlipBookViewer />`。
    - `width < 768px`: 渲染 `<ScrollViewer />`。

## 4. 目录结构规划 (Directory Structure)

```
web/
├── index.html
├── package.json
├── vite.config.ts
├── scripts/
│   └── scan-stories.js       # [Core] 索引生成脚本
├── public/
│   └── story-manifest.json   # [Generated]
└── src/
    ├── assets/
    ├── components/
    │   ├── common/           # 通用组件 (Button, Select)
    │   ├── home/             # 首页组件 (StoryCard)
    │   └── reader/           # 阅读器组件 (FlipBook, ScrollView)
    ├── hooks/                # 自定义 Hooks (useStoryData, useMedia)
    ├── pages/                # 页面入口
    ├── types/                # TS 类型定义
    ├── utils/                # 工具函数 (path helper)
    ├── App.tsx
    └── main.tsx
```

## 5. 异常处理
- **图片加载失败**: 显示占位图 (Placeholder)，提示“图片丢失”。
- **故事解析错误**: 如果 `story.json` 格式错误，在列表页标记为“损坏”或跳过。
- **路由 404**: 访问不存在的故事 ID，跳转回首页并 Toast 提示。

## 6. 构建与部署配置
- **Vite Config**:
    - 配置 `server.fs.allow` 包含 `../stories`。
    - 配置 `base` 路径 (默认 `/`)。
- **Build Script**:
    - `prebuild`: 运行 `scan-stories.js`。
    - `build`: `tsc && vite build`。
    - `postbuild`: (可选) 将 `../stories` 复制到 `dist/stories` (如果我们要生成完全独立的静态包)。考虑到 MVP1 需求，我们将在 `scan-stories.js` 中增加一个参数，支持在构建时执行复制操作。
