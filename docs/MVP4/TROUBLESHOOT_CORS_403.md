# 高级排查：后端安全配置与CORS问题

您遇到的 403 错误（在 Nginx 配置完全正确的情况下）极有可能是因为 **Spring Security 拦截了浏览器的 CORS 预检请求 (OPTIONS)**。

## 1. 原理说明
浏览器在发送跨域 POST 请求（如 `/api/auth/login`）之前，会先发一个 OPTIONS 请求来询问服务器是否允许。
如果后端 Spring Security 没有显式放行 OPTIONS 请求，或者 CORS 配置未正确加载，它会直接拦截这个 OPTIONS 请求并返回 403。浏览器收到预检失败，就会在控制台报错 `Forbidden`。

## 2. 解决方案：更新后端代码
我们已经修改了后端 `SecurityConfig.java` 代码，做了两件事：
1.  **显式添加 CORS Bean**：明确告诉 Spring Security 允许所有来源、所有方法（包括 OPTIONS）。
2.  **放行 OPTIONS 请求**：在安全过滤器链中添加了 `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`。

## 3. 执行更新
请执行以下步骤将修复后的后端部署到服务器：

### 步骤 1: 重新打包后端
在本地项目根目录（或者 `storybook-service` 目录）执行：
```bash
mvn clean package -DskipTests
```
*(我已经帮您运行了这一步，构建成功)*

### 步骤 2: 上传新 Jar 包
将 `storybook-service/target/storybook-service-0.0.1-SNAPSHOT.jar` 上传到服务器 `/home/ubuntu/storybook-server/` 目录，覆盖旧文件。

### 步骤 3: 重启后端服务
在服务器上执行：
```bash
sudo systemctl restart storybook-service
```
等待约 10-20 秒让服务启动。

### 步骤 4: 验证
刷新网页，再次尝试登录。此时应该可以正常通过了。
