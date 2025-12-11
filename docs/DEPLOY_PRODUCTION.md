# StoryBook V3 生产环境部署手册 (Secure)

本文档针对您的特定服务器环境 (`/home/ubuntu` 和 `/usr/share/nginx`) 定制，并强化了安全配置流程。

## 1. 目录规划

*   **前端目录**: `/usr/share/nginx/storybook` (Nginx 托管静态文件)
*   **后端目录**: `/home/ubuntu/storybook-server` (存放 Jar 包和配置)
*   **故事数据**: `/home/ubuntu/n8n/workspace/storybook/stories` (N8N 生成目录)
*   **软连接**: `/usr/share/nginx/storybook/stories` -> 指向故事数据目录

---

## 2. 基础环境安装 (PostgreSQL)

### 2.1 安装 PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

### 2.2 启动并设置开机自启
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.3 创建数据库与用户
**注意：请将 `<YOUR_DB_PASSWORD>` 替换为您自己生成的强密码。**

```bash
# 切换到 postgres 用户
sudo -i -u postgres

# 进入数据库命令行
psql

# --- SQL Commands ---
CREATE DATABASE storybook;
CREATE USER storybook WITH ENCRYPTED PASSWORD '<YOUR_DB_PASSWORD>';
GRANT ALL PRIVILEGES ON DATABASE storybook TO storybook;
# --------------------

# 退出 psql
\q
exit
```

---

## 3. 后端部署 (Spring Boot)

### 3.1 准备目录与文件
```bash
mkdir -p /home/ubuntu/storybook-server
```

1.  **上传 JAR 包**: 将构建好的 `backend/target/storybook-service-0.0.1-SNAPSHOT.jar` 上传到该目录。
2.  **创建生产配置**: 
    在服务器该目录下创建一个名为 `application-prod.yml` 的文件。您可以参考源码中的 `backend/src/main/resources/application-prod.yml.template`。

    **`application-prod.yml` 内容示例 (务必修改敏感信息):**
    ```yaml
    spring:
      datasource:
        url: jdbc:postgresql://localhost:5432/storybook
        username: storybook
        password: <YOUR_DB_PASSWORD> # 【必须修改】填写步骤 2.3 中设置的密码
      jpa:
        hibernate:
          ddl-auto: update # 生产环境首次运行用 update，后续建议 validate
        show-sql: false

    jwt:
      secret: <YOUR_JWT_SECRET_KEY> # 【必须修改】生成一个长随机字符串 (至少32位)
      expiration: 86400000

    storybook:
      stories-path: /home/ubuntu/n8n/workspace/storybook/stories
      n8n-webhook-url: <YOUR_N8N_WEBHOOK_URL> # 填入 N8N 实际地址
      n8n-redub-webhook-url: <YOUR_N8N_REDUB_WEBHOOK_URL>
    ```

### 3.2 配置 Systemd 开机自启
创建一个服务文件 `/etc/systemd/system/storybook-service.service`:

```ini
[Unit]
Description=StoryBook Backend Service
After=network.target postgresql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/storybook-server
# 关键：使用 --spring.config.location 指定外部配置文件
ExecStart=/usr/bin/java -jar storybook-service-0.0.1-SNAPSHOT.jar --spring.config.location=file:./application-prod.yml
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3.3 启动后端
```bash
sudo systemctl daemon-reload
sudo systemctl start storybook-service
sudo systemctl enable storybook-service

# 查看日志
sudo journalctl -u storybook-service -f
```

---

## 4. 前端部署 (Nginx)

### 4.1 构建前端
在本地开发机执行：
```bash
cd web
npm install
npm run build
# 将 dist 目录下的所有文件上传到服务器的 /usr/share/nginx/storybook
```

### 4.2 创建软连接 (关键步骤)
为了让前端能访问 N8N 生成的图片和音频：

```bash
# 确保目标目录存在
mkdir -p /home/ubuntu/n8n/workspace/storybook/stories

# 创建软连接
sudo ln -s /home/ubuntu/n8n/workspace/storybook/stories /usr/share/nginx/storybook/stories

# 检查
ls -l /usr/share/nginx/storybook/stories
# 应显示 -> /home/ubuntu/n8n/workspace/storybook/stories
```

### 4.3 Nginx 配置示例
编辑 `/etc/nginx/sites-available/storybook` (或 default):

```nginx
server {
    listen 80;
    server_name <YOUR_DOMAIN_OR_IP>; # 【必须修改】

    root /usr/share/nginx/storybook;
    index index.html;

    # 前端路由支持 (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 故事资源文件 (通过软连接访问)
    location /stories/ {
        alias /usr/share/nginx/storybook/stories/;
        autoindex off; 
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # 增加上传大小限制 (因为我们要上传语音文件)
        client_max_body_size 20M; 
    }
}
```

### 4.4 重启 Nginx
```bash
sudo nginx -t  # 检查配置语法
sudo systemctl restart nginx
```

---

## 5. 验证

1.  **访问网页**: `http://<Server-IP>`
2.  **测试 API**: `http://<Server-IP>/api/stories` (如果返回 401/403 是正常的，说明服务在运行)
3.  **检查文件访问**: 尝试上传一个语音文件，或生成一个故事。
