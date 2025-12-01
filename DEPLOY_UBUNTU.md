# 腾讯云 Ubuntu 部署指南 (StoryBook MVP2)

本指南指导您部署奇妙绘本馆 MVP2 版本。
MVP2 引入了 Java 后端和 PostgreSQL 数据库，并废弃了独立的 file-server。

## 1. 环境准备

### 1.1 登录服务器
```bash
ssh ubuntu@<your-server-ip>
```

### 1.2 安装 Node.js (前端构建)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 1.3 安装 Java JDK 21 (后端运行)
MVP2 基于 Spring Boot 3，需要 JDK 17+ (推荐 21)。
```bash
sudo apt update
sudo apt install -y openjdk-21-jdk
# 验证
java -version
```

### 1.4 安装 Maven (后端构建)
```bash
sudo apt install -y maven
# 验证
mvn -version
```

### 1.5 安装 PostgreSQL 17 (数据库)
由于 Ubuntu 默认源可能不包含最新的 v17，需添加官方仓库：

```bash
# 1. 安装必要的工具
sudo apt install -y curl ca-certificates gnupg lsb-release

# 2. 导入 PostgreSQL 官方仓库密钥
curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg

# 3. 添加 PostgreSQL 仓库源
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# 4. 更新包列表并安装
sudo apt update
sudo apt install -y postgresql-17 postgresql-contrib-17
```

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql

# 在 psql 命令行中执行：
# (注意：将 password 替换为您自己的强密码，并需同步更新 backend/src/main/resources/application.yml)
CREATE DATABASE storybook_db;
CREATE USER storybook_user WITH ENCRYPTED PASSWORD 'storybook_pass';
GRANT ALL PRIVILEGES ON DATABASE storybook_db TO storybook_user;
\q
```

## 2. 部署目录配置

假设：
- 代码目录：`/usr/share/nginx/storybook`
- 故事数据（n8n生成）：`/home/ubuntu/n8n/workspace/storybook/stories`

### 2.1 获取代码
```bash
sudo mkdir -p /usr/share/nginx/storybook
sudo chown -R ubuntu:ubuntu /usr/share/nginx/storybook
cd /usr/share/nginx/storybook

git clone https://github.com/yideng-xl/stroybook.git .
# 切换到 main 或 v0.2.0 分支
git checkout v0.2.0
```

### 2.2 挂载故事数据 (软链接)
后端将从项目根目录的 `stories` 文件夹读取数据。
```bash
# 确保 backend 能读取到 ../stories
# 我们直接在项目根目录创建 link
ln -s /home/ubuntu/n8n/workspace/storybook/stories ./stories
```

## 3. 构建与启动

### 3.1 构建前端
```bash
cd /usr/share/nginx/storybook/web
npm install
npm run build
# 构建产物位于 web/dist
```

### 3.2 构建后端
```bash
cd /usr/share/nginx/storybook/backend

# 确认 application.yml 中的数据库配置正确
# 这里的 stories-path 默认配置为 ../stories，与步骤 2.2 对应
mvn clean package -DskipTests

# 构建产物位于 target/storybook-0.0.1-SNAPSHOT.jar
```

### 3.3 启动服务
推荐使用 systemd 来管理 Java 进程，或者简单的 nohup。

**方式 A: 简单启动 (测试用)**
```bash
nohup java -jar target/storybook-0.0.1-SNAPSHOT.jar > backend.log 2>&1 &
```

**方式 B: Systemd 服务 (生产推荐)**
创建 `/etc/systemd/system/storybook.service`:
```ini
[Unit]
Description=Storybook Backend
After=syslog.target network.target postgresql.service

[Service]
User=ubuntu
WorkingDirectory=/usr/share/nginx/storybook/backend
ExecStart=/usr/bin/java -jar target/storybook-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable storybook
sudo systemctl start storybook
```

## 4. 数据同步

后端启动后，会自动读取 `stories` 目录并同步到数据库。
如果添加了新故事，可以调用同步接口（需鉴权或重启后端，MVP2 建议重启或实现定时任务）。
或者手动触发：
```bash
curl -X POST http://localhost:8080/api/stories/sync
```

## 5. Nginx 配置

Nginx 负责托管前端静态文件，并将 API 请求转发给 Java 后端。

编辑 `/etc/nginx/sites-available/storybook`:
```nginx
server {
    listen 80;
    server_name <your-domain-or-ip>;

    root /usr/share/nginx/storybook/web/dist;
    index index.html;

    # 前端路由支持 (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 故事图片资源 (由后端提供)
    location /stories {
        proxy_pass http://localhost:8080;
    }
}
```

启用配置并重启 Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/storybook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. 验证
访问 `http://<your-ip>`，应该能看到首页。
登录功能应正常工作（注册一个新用户试用）。
点击故事封面，应能加载图片（从 `/stories/...` 加载）。
