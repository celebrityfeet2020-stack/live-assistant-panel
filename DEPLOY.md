# 直播讲解助手控制面板 - 部署指南

本指南将帮助您在 VPS9 上部署直播讲解助手控制面板。

## 1. 环境准备

确保您的 VPS 已安装 Docker 和 Docker Compose。

```bash
# 检查 Docker 版本
docker --version
# 检查 Docker Compose 版本
docker-compose --version
```

## 2. 部署步骤

1.  **上传源码**：将 `live-assistant-panel` 文件夹上传到服务器。
2.  **进入目录**：
    ```bash
    cd live-assistant-panel
    ```
3.  **修改配置**（可选）：
    编辑 `docker-compose.yml`，修改 `SECRET_KEY` 和 `FUNASR_HOST`（如果 FunASR 在其他机器上）。
4.  **启动服务**：
    ```bash
    docker-compose up -d --build
    ```

## 3. 验证部署

访问 `http://<VPS_IP>:8000`，您应该能看到登录页面。

- **默认管理员账号**：`admin`
- **默认密码**：`admin123`

## 4. HTTPS 配置 (推荐)

建议使用 Nginx Proxy Manager 或手动配置 Nginx 来启用 HTTPS。

**Nginx 配置示例：**

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 5. 常见问题

- **WebSocket 连接失败**：请检查 Nginx 是否正确配置了 `Upgrade` 和 `Connection` 头，这对于 WebSocket 是必须的。
- **数据库位置**：数据存储在 `./data/sql_app.db`，请定期备份该文件。
