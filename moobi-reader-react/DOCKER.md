# Moobi Reader - Docker 部署指南

本项目支持 Docker 部署，提供了完整的容器化解决方案。

## 快速开始

### 使用 Docker Compose（推荐）

最简单的部署方式：

```bash
docker-compose up -d
```

这会自动构建镜像并启动容器，应用将在 `http://localhost:1000` 或 `http://服务器IP:1000` 上运行。

### 使用 Docker 命令

#### 1. 构建镜像

```bash
docker build -t moobi-reader .
```

#### 2. 运行容器

```bash
docker run -d \
  --name moobi-reader \
  -p 1000:1000 \
  --restart unless-stopped \
  moobi-reader
```

## 访问应用

构建并运行后，可以通过以下方式访问：

- 本地访问：`http://localhost:1000`
- 远程访问：`http://服务器IP:1000`

## 管理容器

### 查看容器状态

```bash
docker-compose ps
# 或
docker ps | grep moobi-reader
```

### 查看日志

```bash
docker-compose logs -f
# 或
docker logs -f moobi-reader
```

### 停止容器

```bash
docker-compose down
# 或
docker stop moobi-reader
```

### 重启容器

```bash
docker-compose restart
# 或
docker restart moobi-reader
```

### 删除容器和镜像

```bash
docker-compose down --rmi all
# 或
docker stop moobi-reader
docker rm moobi-reader
docker rmi moobi-reader
```

## 配置说明

### 端口配置

默认端口为 1000。如需修改，编辑 `docker-compose.yml`：

```yaml
ports:
  - "8080:1000"  # 将本地 8080 端口映射到容器 1000 端口
```

### Nginx 配置

如需自定义 Nginx 配置，编辑 `nginx.conf` 文件，然后重新构建镜像。

### 环境变量

可在 `docker-compose.yml` 中添加环境变量：

```yaml
environment:
  - NODE_ENV=production
  - 其他环境变量=值
```

## 多阶段构建

本项目使用 Docker 多阶段构建：

1. **构建阶段（Builder）**：使用 Node.js 20 Alpine 镜像构建应用
2. **运行阶段（Production）**：使用 Nginx Alpine 镜像提供静态文件

这种方式确保最终镜像体积小且高效。

## 性能优化

Nginx 配置包含以下优化：

- **Gzip 压缩**：减少传输数据量
- **静态资源缓存**：1 年缓存有效期
- **SPA 路由支持**：所有路由正确指向 index.html
- **安全头**：XSS 保护、防点击劫持等

## 故障排除

### 端口冲突

如果 1000 端口已被占用：

```bash
# 修改 docker-compose.yml 中的端口映射
ports:
  - "8080:1000"
```

### 容器无法启动

查看日志：

```bash
docker-compose logs
```

### 重新构建镜像

如果代码有更新：

```bash
docker-compose up -d --build
```

## 生产环境建议

1. **使用反向代理**：在生产环境中，建议在前面加一层 Nginx 或 Traefik 反向代理
2. **HTTPS**：配置 SSL 证书以启用 HTTPS
3. **监控**：添加健康检查和监控
4. **备份**：定期备份用户数据（如果有持久化需求）
5. **资源限制**：设置容器资源限制

示例 docker-compose.yml 配置：

```yaml
services:
  moobi-reader:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:1000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 技术栈

- **基础镜像**：Node.js 20 Alpine（构建）+ Nginx Alpine（运行）
- **Web 服务器**：Nginx
- **构建工具**：Vite
- **端口**：1000

## 支持

如有问题，请查看项目 README.md 或提交 Issue。
