# GOTL

GOTL（Online Go Tools）是一个轻量的 Go 开发工具箱。前端页面和转换接口会被编译进同一个 Go 程序，无需额外安装或部署前端服务。

## 工具

| 工具 | 页面 | 执行方式 |
| --- | --- | --- |
| JSON → Go Struct | `/tools/json-to-go` | 浏览器本地转换 |
| SQL → Ent Schema | `/tools/sql-to-ent` | `POST /sql2ent` |
| SQL → GORM Model | `/tools/sql-to-gorm` | `POST /sql2gorm` |
| SQL → Go-Zero Model | `/tools/sql-to-go-zero` | `POST /sql2gozero` |
| SQL → Elasticsearch DSL | `/tools/sql-to-es` | `POST /sql2es` |
| YAML → Go Struct | `/tools/yaml-to-go` | `POST /yaml2go` |
| YAML → JSON | `/tools/yaml-to-json` | `POST /yaml2json` |
| XML → JSON | `/tools/xml-to-json` | `POST /xml2json` |

SQL → Elasticsearch DSL、YAML → JSON 和 XML → JSON 默认按 2 空格缩进展示转换结果，并支持一键压缩为单行 JSON、重新格式化展开，以及复制当前显示结果。

## 本地运行

```bash
go run .
```

默认访问地址为 [http://localhost:8080](http://localhost:8080)。可以通过 `-p` 修改端口：

```bash
go run . -p 9000
```

编译后的单个可执行文件同样包含完整前端：

```bash
go build -o gotl .
./gotl -p 8080
```

## 验证

```bash
go test ./handler
node --test frontend/*_test.js
go build ./...
```

前端使用原生 HTML、CSS 和 JavaScript，不需要 Node 构建步骤。Node 仅用于运行前端模块的开发测试。

## Docker 部署

版本标签会通过 GitHub Actions 构建并发布 `linux/amd64`、`linux/arm64` 双架构镜像到 `ghcr.io/pigjin/gotl`。

```bash
docker run -d --name gotl --restart unless-stopped -p 8080:8080 ghcr.io/pigjin/gotl:latest
```

生产环境的版本发布、Docker Compose、升级、回滚和故障排查请参阅 [Docker 部署文档](docs/docker-deployment.md)。

## 第三方代码

JSON → Go 使用 [mholt/json-to-go](https://github.com/mholt/json-to-go)，遵循 MIT License。许可文本位于 `frontend/assets/vendor/LICENSE.json-to-go`。
