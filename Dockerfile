# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM golang:1.25-alpine3.24 AS build

ARG GOPROXY=https://proxy.golang.org,direct
ENV GOPROXY=$GOPROXY

WORKDIR /src

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

COPY . .

ARG TARGETOS
ARG TARGETARCH
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -trimpath -ldflags="-s -w" -o /out/gotl .

FROM alpine:3.24

RUN apk add --no-cache ca-certificates \
    && addgroup -S -g 10001 gotl \
    && adduser -S -D -H -u 10001 -G gotl gotl

WORKDIR /app

COPY --from=build --chown=gotl:gotl /out/gotl /usr/local/bin/gotl

USER gotl

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

STOPSIGNAL SIGTERM

ENTRYPOINT ["/usr/local/bin/gotl"]
CMD ["-p", "8080"]
