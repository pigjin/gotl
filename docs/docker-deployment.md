# Docker 部署

GOTL 的前端资源已经内嵌在 Go 程序中，部署时只需要运行一个容器，不需要额外的前端服务或数据卷。

镜像发布到 GitHub Container Registry：

```text
ghcr.io/pigjin/gotl
```

镜像同时支持 `linux/amd64` 和 `linux/arm64`，Docker 会根据服务器架构自动拉取对应版本。

## 发布镜像

GitHub Actions 会在 Pull Request 和 `main` 分支上验证测试及镜像构建，但不会发布镜像。只有推送符合语义化版本格式的 `v*` 标签时，才会发布镜像：

```bash
git tag v1.0.0
git push origin v1.0.0
```

`v1.0.0` 会生成以下镜像标签：

```text
ghcr.io/pigjin/gotl:1.0.0
ghcr.io/pigjin/gotl:1.0
ghcr.io/pigjin/gotl:latest
```

可以在仓库的 **Actions** 页面查看构建过程，在 GitHub 个人主页的 **Packages** 页面查看镜像。

### 首次发布后设为公开镜像

GHCR 首次发布的软件包默认为 Private。首次构建完成后，需要执行一次以下设置，服务器才能匿名拉取镜像：

1. 打开 GitHub 个人主页，进入 **Packages**。
2. 选择 `gotl`，进入 **Package settings**。
3. 找到 **Danger Zone** 中的 **Change visibility**。
4. 将可见性修改为 **Public** 并按页面提示确认。

## 使用 Docker 运行

生产环境建议固定具体版本，便于升级和回滚：

```bash
docker pull ghcr.io/pigjin/gotl:1.0.0
docker run -d \
  --name gotl \
  --restart unless-stopped \
  -p 8080:8080 \
  ghcr.io/pigjin/gotl:1.0.0
```

启动后访问 [http://服务器地址:8080](http://localhost:8080)。

如需使用其他宿主机端口，例如 9000，只修改冒号左侧端口：

```bash
docker run -d \
  --name gotl \
  --restart unless-stopped \
  -p 9000:8080 \
  ghcr.io/pigjin/gotl:1.0.0
```

## 使用 Docker Compose 运行

仓库提供了 `compose.yaml`。默认使用 `latest` 并监听宿主机 8080 端口：

```bash
docker compose up -d
```

生产环境建议在 `compose.yaml` 同级目录创建 `.env` 并固定版本：

```dotenv
GOTL_VERSION=1.0.0
GOTL_PORT=8080
```

然后启动服务：

```bash
docker compose pull
docker compose up -d
```

## 查看状态和日志

Docker 运行方式：

```bash
docker ps --filter name=gotl
docker inspect --format '{{json .State.Health}}' gotl
docker logs -f --tail 100 gotl
curl -fsS http://127.0.0.1:8080/ > /dev/null
```

Docker Compose 运行方式：

```bash
docker compose ps
docker compose logs -f --tail 100 gotl
```

容器内置健康检查，每 30 秒请求一次 `/`。连续检查失败后，`docker ps` 和 `docker inspect` 会显示 `unhealthy`。

## 升级

### Docker

先拉取新版本，再重新创建容器：

```bash
docker pull ghcr.io/pigjin/gotl:1.1.0
docker rm -f gotl
docker run -d \
  --name gotl \
  --restart unless-stopped \
  -p 8080:8080 \
  ghcr.io/pigjin/gotl:1.1.0
```

GOTL 不使用持久化数据卷，重新创建容器不会丢失服务端数据。

### Docker Compose

修改 `.env` 中的 `GOTL_VERSION`，然后执行：

```bash
docker compose pull
docker compose up -d
```

## 回滚

Docker 方式删除当前容器并重新运行上一版本：

```bash
docker rm -f gotl
docker run -d \
  --name gotl \
  --restart unless-stopped \
  -p 8080:8080 \
  ghcr.io/pigjin/gotl:1.0.0
```

Compose 方式将 `.env` 中的 `GOTL_VERSION` 改回上一版本，然后执行：

```bash
docker compose pull
docker compose up -d
```

## 停止和删除

Docker：

```bash
docker rm -f gotl
```

Docker Compose：

```bash
docker compose down
```

## 常见问题

### 拉取镜像时出现 401 或 403

确认 GHCR 中的 `gotl` 软件包已经设为 Public。如果刚刚修改可见性，可以先退出已有登录状态后重试：

```bash
docker logout ghcr.io
docker pull ghcr.io/pigjin/gotl:1.0.0
```

### 端口已被占用

修改宿主机端口，例如使用 `-p 9000:8080`；Compose 部署则修改 `.env` 中的 `GOTL_PORT`。

### 容器显示 unhealthy

先查看健康检查和应用日志：

```bash
docker inspect --format '{{json .State.Health}}' gotl
docker logs --tail 100 gotl
```

确认容器进程正在监听内部 8080 端口，并检查服务器资源是否充足。
