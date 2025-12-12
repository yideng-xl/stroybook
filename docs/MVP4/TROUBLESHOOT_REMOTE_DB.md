# 排查：无法远程连接 PostgreSQL 数据库

如果腾讯云安全组已开放 5432 端口，但仍无法连接，通常有以下 3 个原因。

## 方案 A：使用 SSH 本地执行（最快、最安全）
**如果您的目标仅仅是导入表结构（FIX 那个报错），不需要暴露公网 IP，直接 SSH 登录服务器操作最简单。**

1. **SSH 登录服务器**
   ```bash
   ssh ubuntu@your-server-ip
   ```

2. **切换到 postgres 用户并进入数据库**
   ```bash
   sudo -u postgres psql
   ```

3. **连接到 storybook 数据库**
   ```sql
   \c storybook
   ```
   *(如果提示数据库不存在，先执行 `CREATE DATABASE storybook;`)*

4. **粘贴 SQL 建表语句**
   复制 `schema.sql` 中的内容粘贴到终端中执行。执行完输入 `\q` 退出。

---

## 方案 B：配置公网直连（调试用）
如果您确实需要使用 Navicat/DBeaver 远程连接，请按顺序检查以下配置：

### 1. 检查监听地址 (postgresql.conf)
默认情况下，PostgreSQL 只监听本机 (127.0.0.1)。

**检查命令：**
```bash
sudo netstat -nplt | grep 5432
```
- 如果显示 `127.0.0.1:5432` -> **配置未开放** (只能本机连)
- 如果显示 `0.0.0.0:5432` -> **配置已正确** (跳到第 2 步)

**修改方法：**
1. 找到配置文件 (通常在 `/etc/postgresql/{version}/main/postgresql.conf`)
   ```bash
   sudo nano /etc/postgresql/14/main/postgresql.conf
   # 注意：版本号 14 可能不同，按实际情况调整
   ```
2. 找到 `listen_addresses`，取消注释并改为：
   ```ini
   listen_addresses = '*'
   ```
3. 保存退出 (`Ctrl+O`, `Enter`, `Ctrl+X`)。

### 2. 配置允许访问的 IP (pg_hba.conf)
即使监听了端口，PostgreSQL 还需要显式允许外部 IP 连接。

**修改方法：**
1. 编辑 `pg_hba.conf` (通常与 `postgresql.conf` 在同级目录)
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```
2. 在文件末尾添加一行（允许所有 IP 使用密码访问）：
   ```text
   # TYPE  DATABASE        USER            ADDRESS                 METHOD
   host    all             all             0.0.0.0/0               scram-sha-256
   ```
   *(注：老版本 PG 请将 `scram-sha-256` 改为 `md5`)*
3. 保存退出。

### 3. 重启并验证
```bash
sudo service postgresql restart
```
再次检查端口是否监听在 `0.0.0.0:5432`。

---

### 4. 检查服务器内部防火墙
如果以上都配好了还是连不上，可能是 Ubuntu 内部的防火墙 (`ufw`) 拦截了。

**检查：**
```bash
sudo ufw status
```

**放行：**
```bash
sudo ufw allow 5432/tcp
```
