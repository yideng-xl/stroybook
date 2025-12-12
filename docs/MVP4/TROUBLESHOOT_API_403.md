### 排查：API 请求返回 403 Forbidden

如果您已经修复了 Nginx 的 `user` 配置，静态资源访问正常，但 API 仍然 403，通常是因为 Nginx 的反向代理路径重写（Rewrite）导致后端 Spring Security 匹配失败。

**故障复现逻辑**：
1.  客户端请求 `POST /api/auth/login`
2.  Nginx 配置如果为 `location /api/ { proxy_pass http://localhost:8080/api/; }` (有尾随杠) 或 `proxy_pass http://localhost:8080/;` (重写为空)
3.  后端实际接收到的路径由 Nginx 决定。如果 Nginx 截断了前缀，后端可能收到 `/auth/login`。
4.  后端安全配置 (`SecurityConfig.java`) 只放行了 `/api/auth/login`。
5.  结果：`/auth/login` 不在白名单 -> Access Denied (403)。

**解决办法**：

1.  **修改 Nginx 站点配置** (`/etc/nginx/conf.d/xxx.conf` 或 `sites-available/default`)：

    将 `/api/` 块修改为**无路径代理模式**，让 Nginx 原样透传路径：

    ```nginx
    location /api/ {
        # 关键：proxy_pass 后面不要加任何路径，包括最后的 /
        proxy_pass http://localhost:8080; 
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
    }
    ```

2.  **验证并重启 Nginx**：
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

3.  **检查后端日志（如果还有问题）**：
    如果要彻底确认后端收到了什么请求，请查看 Spring Boot 日志。
    ```bash
    sudo journalctl -u storybook-service -f
    ```
