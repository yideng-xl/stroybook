# 腾讯云 Ubuntu 部署指南 (StoryBook MVP1)

本指南指导您将奇妙绘本馆部署到 `/usr/share/nginx/storybook/`，并与 n8n 的故事生成目录打通。

## 1. 环境准备

### 1.1 登录服务器
```bash
ssh ubuntu@<your-server-ip>
```

### 1.2 安装 Node.js (v18+)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 1.3 安装 PM2
```bash
npm install -g pm2
```

## 2. 目录与软链接配置 (核心步骤)

假设您的故事数据（由 n8n 生成）存储在：`/home/ubuntu/n8n/workspace/storybook/stories`
Web 应用将部署在：`/usr/share/nginx/storybook/`

### 2.1 创建部署目录
```bash
sudo mkdir -p /usr/share/nginx/storybook
sudo chown -R ubuntu:ubuntu /usr/share/nginx/storybook
```

### 2.2 获取代码 (Git Clone)
推荐使用 Git 拉取代码，方便后续更新。

```bash
cd /usr/share/nginx/storybook

# 克隆仓库 (注意：当前目录下不应有其他文件，或者克隆后再移动)
# 如果目录不为空，建议先克隆到临时目录
git clone https://github.com/yideng-xl/stroybook.git .

# 或者
# git clone https://github.com/yideng-xl/stroybook.git
# mv stroybook/* .
# rm -rf stroybook
```

### 2.3 创建软链接 (Symlink)
这一步至关重要！它将 n8n 的生成目录直接挂载到本项目中。

```bash
cd /usr/share/nginx/storybook

# 如果当前目录下已有空的 stories 文件夹，先删除（备份）
rm -rf stories 

# 创建软链接：指向 n8n 的数据目录
ln -s /home/ubuntu/n8n/workspace/storybook/stories ./stories

# 验证链接
ls -l stories
# 应显示 -> /home/ubuntu/n8n/workspace/storybook/stories
```

## 3. 安装与构建

### 3.1 安装依赖
```bash
cd /usr/share/nginx/storybook

# 根目录
npm install

# 前端
cd web
npm install

# 资源服
cd ../file-server
npm install
```

### 3.2 构建前端
```bash
cd /usr/share/nginx/storybook/web
npm run build
```

## 4. 启动服务

```bash
cd /usr/share/nginx/storybook
npx pm2 start ecosystem.config.js
```

服务端口：
- **Web App**: 5173
- **File Server**: 3001

## 5. 自动化索引更新

当 n8n 生成了新故事后，Web 端不会立即显示，需要运行扫描脚本更新索引。
建议配置一个 Crontab 定时任务，或者在 n8n 流程末尾调用一个 webhook 来触发此命令。

**手动更新命令**:
```bash
cd /usr/share/nginx/storybook/web
npm run scan
```

由于我们建立了软链接，`npm run scan` 会直接读取 `/home/ubuntu/n8n/...` 下的新内容。

## 6. Nginx 配置 (端口转发)

如果您希望通过 80 端口访问：

编辑 `/etc/nginx/sites-available/storybook`：
```nginx
server {
    listen 80;
    server_name <your-domain-or-ip>;

    # 前端页面
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # 故事图片资源 (指向我们的 file-server)
    location /stories/ {
        proxy_pass http://localhost:3001/stories/;
    }
}
```