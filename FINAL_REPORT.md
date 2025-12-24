# 直播讲解助手控制面板 - 最终交付报告

## 1. 项目概述

本项目为直播讲解助手提供了一个功能强大的 Web 控制面板，支持多用户管理、实时语音识别监控、关键词触发配置以及详细的操作审计。系统采用前后端分离架构，容器化部署，具备高并发处理能力。

## 2. 核心功能

### 2.1 前端控制台
- **深色护眼 UI**：专为长时间使用设计。
- **配置管理**：支持无限添加链接，标签式关键词管理，支持导入/导出。
- **实时监控**：WebSocket 实时推送语音识别结果和操作日志。
- **数据可视化**：展示今日触发趋势图。
- **操作审计**：记录所有敏感操作。
- **超级管理员后台**：可视化的用户管理界面。

### 2.2 后端服务
- **FastAPI 架构**：高性能异步框架。
- **多用户隔离**：每个用户拥有独立的 WebSocket 通道。
- **数据持久化**：SQLite 数据库存储所有数据。
- **告警系统**：支持识别超时告警配置。

## 3. 部署信息

- **服务器**：VPS9 (212.64.83.18)
- **访问地址**：`http://212.64.83.18:8000`
- **默认管理员**：`admin` / `admin123`

## 4. CI/CD 流程

本项目已配置 GitHub Actions 自动化构建流程：
1.  代码推送到 GitHub `main` 分支。
2.  GitHub Actions 自动构建 Docker 镜像。
3.  镜像推送到 Docker Hub (`junpeng999/live-assistant-panel`)。
4.  VPS9 上执行 `docker-compose pull && docker-compose up -d` 更新服务。

## 5. 维护指南

### 更新服务
```bash
ssh ubuntu@212.64.83.18
cd live-assistant-panel
sudo docker-compose pull
sudo docker-compose up -d
```

### 查看日志
```bash
sudo docker-compose logs -f --tail=100
```

### 备份数据库
数据库文件位于 `~/live-assistant-panel/data/sql_app.db`，建议定期备份。
