# 致命错误：JWT 密钥格式不正确

## 1. 错误分析
日志报错：
```
java.lang.IllegalArgumentException: Illegal base64 character: '_'
at io.jsonwebtoken.io.Decoders.BASE64.decode(Decoders.java:...)
```
这意味着后端在启动或者处理登录请求时，试图使用 `Base64` 解码您配置在 `application-prod.yml` 中的 `jwt.secret`，但是该密钥包含了非 Base64 字符（例如下划线 `_`，或者就是单纯的普通字符串）。

JJWT 库要求密钥必须是 Base64 编码的字符串，或者如果不是，应该使用纯文本处理方式。但代码中使用的是 `Decoders.BASE64.decode(jwtSecret)`，**强制要求您的密钥必须是有效的 Base64 字符串**。

## 2. 解决方案
您必须在生产环境配置文件 `application-prod.yml` 中更换一个有效的 Base64 密钥。

### 生成一个新的 Base64 密钥
您可以在 Linux 终端运行以下命令生成一个安全的 Base64 密钥：
```bash
# 生成 32 字节随机数并转为 Base64
openssl rand -base64 32
```
或者直接使用下面这个我为您生成的有效密钥（仅供备用，建议自行生成）：
`hKj8F9yL2Np+A4zS6vW1xR3qM5tO8uI7bP0dC3eF2gA=`

### 3. 修改配置文件
编辑服务器上的 `/home/ubuntu/storybook-server/application-prod.yml`：

```yaml
jwt:
  # 把原来的 secret 替换为上面生成的 Base64 字符串
  secret: hKj8F9yL2Np+A4zS6vW1xR3qM5tO8uI7bP0dC3eF2gA= 
  expiration: 86400000
```

### 4. 重启服务
修改配置后，必须重启后端才能生效：
```bash
sudo systemctl restart storybook-service
```

### 5. 验证
再次尝试登录。这次应该不会报错了。
