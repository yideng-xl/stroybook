# 奇妙绘本馆 (StoryBook Web MVP1)

这是一个为幼儿设计的绘本阅读网站，支持 PC、平板和手机多端自适应阅读。

## ✨ 特性

- **多端适配**: 电脑上仿真翻页，手机上垂直滑动。
- **童话风格**: 沉浸式 UI，互动视差背景。
- **多语言**: 支持中文、英文、中英对照模式。
- **动态扩展**: 只需将故事文件放入文件夹，无需修改代码即可新增内容。
- **前后端分离**: 独立的静态资源服务，确保生产环境稳定加载图片。

## 🚀 启动项目 (标准方式)

本项目使用 PM2 管理所有服务（前端 + 资源服）。

### 1. 环境准备
确保已安装 Node.js (v18+)。

```bash
# 根目录下安装依赖
npm install 

# 安装子模块依赖
cd web && npm install
cd ../file-server && npm install
```

### 2. 启动服务
```

### ⚠️ 重要提示：运行服务前请将 `stories-sample` 重命名为 `stories`

为了避免将大型故事文件提交到 Git 仓库，我们已将示例故事数据移至 `stories-sample` 目录。

**在首次运行或需要加载示例故事时，请务必执行以下操作：**

```bash
# 在项目根目录执行
mv stories-sample stories
```

**如果您之前修改了任何配置（如 `application.yml` 中关于故事路径的设置），请确保将其恢复到原始配置（指向 `stories` 目录）。**

---

我们在根目录提供了 PM2 配置文件，一键启动所有服务：

```bash
# 1. 构建前端 (如果是首次运行或代码有修改)
cd web && npm run build
cd ..

# 2. 启动服务
npx pm2 start ecosystem.config.js
```

启动成功后，访问：
- **Web 首页**: [http://localhost:5173](http://localhost:5173)
- **资源服务**: [http://localhost:3001](http://localhost:3001)

### 3. 常用管理命令
```bash
npx pm2 status        # 查看服务状态
npx pm2 logs          # 查看日志 (排查报错)
npx pm2 restart all   # 重启所有服务
npx pm2 stop all      # 停止所有服务
```

## 📂 内容管理

### 如何添加新故事？
1. 将新的故事文件夹放入项目根目录的 `stories/` 文件夹中。
   - 结构需参考 `stories/灰姑娘`。
2. 更新索引：
   ```bash
   cd web
   npm run scan
   ```
3. 刷新网页即可看到新故事（无需重启服务）。

## 🛠️ 开发指南

如果您需要修改代码：

### 前端开发
```bash
cd web
npm run dev
```
前端服务将运行在 5173 端口，支持热更新。

### 资源服务调试
```bash
cd file-server
node index.js
```
