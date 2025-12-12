# 紧急修复：Nginx 配置错误与 403 问题

## 1. 问题分析
根据您提供的日志：
```
nginx: [emerg] "user" directive is not allowed here in /etc/nginx/conf.d/stroybook_yideng_ltd.conf:2
...
nginx.service: Failed with result 'exit-code'.
```
这表明 **Nginx 启动失败了**。原因是在子配置文件（`stroybook_yideng_ltd.conf`）中使用了全局指令 `user`。
由于 Nginx 启动失败，它可能**仍在运行旧的配置**（或者完全停止了），因此 403 错误（权限 + 路径问题）依然存在。

必须先修复 Nginx 配置错误，才能解决 403。

## 2. 修复步骤

### 第一步：还原并修正站点配置
请编辑 `/etc/nginx/conf.d/stroybook_yideng_ltd.conf`：

1.  **删除**该文件中的 `user ubuntu;` 行（如果有）。`user` 指令不能放在这里。
2.  **修正** `/api/` 的代理路径（解决 API 403）：
    ```nginx
    location /api/ {
        # 确保末尾没有斜杠
        proxy_pass http://localhost:8080;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 20M;
    }
    ```

### 第二步：正确修改 Nginx 运行用户 (解决静态资源 403)
`user` 指令必须在 **主配置文件** 中修改。

1.  打开主配置文件：
    ```bash
    sudo nano /etc/nginx/nginx.conf
    ```
2.  找到第一行（通常是 `user www-data;`），修改为：
    ```nginx
    user ubuntu;
    ```
3.  保存退出。

### 第三步：验证并重启
1.  **检查语法**（这步非常重要，确保没有报错）：
    ```bash
    sudo nginx -t
    ```
    *如果输出 `syntax is ok` 和 `test is successful`，则继续。如果报错，请告诉我报错内容。*

2.  **重启 Nginx**：
    ```bash
    sudo systemctl restart nginx
    ```

## 3. 验证
1.  刷新浏览器，再次尝试登录。
2.  检查静态资源（图片）是否能正常加载。
