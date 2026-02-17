---
lang: zh-CN
title: Idea
titleTemplate: gitlab 容器部署并用 nginx 代理
description: gitlab 容器部署并用 nginx 代理
head:
  - - meta
    - name: description
      content: gitlab 容器部署并用 nginx 代理
  - - meta
    - name: keywords
      content: gitlab nginx linux docker
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# gitlab 容器部署并用 nginx 代理

将GitLab 容器部署并使用 nginx 代理，以便访问私人仓库。

## 前置条件

确保已安装 Docker 和 Docker Compose，并配置好 nginx 代理以及 ssl 证书申请。

| 名称 | 版本 |
| --- | --- |
| Ubuntu | 24.04 LTS |
| Docker | 29.2.1 |
| Docker-Compose | 5.0.2 |
| Nginx | 1.28.2 |
| GitLab | 18.8.4-ce.0 |

主机配置 4 Core 8G 内存 50G SSD硬盘。

创建项目目录结构并创建所需文件。

```bash
$ mkdir -p gitlab-docker && cd gitlab-docker
```

目录结构如下：

```text
.
├── Makefile
├── deploy-gitlab.sh
├── docker-compose.yml
└── setup-gitlab.sh
```

### 创建 `setup-gitlab.sh`

生成 `.env` 文件并输入 GitLab 配置信息。

::: code-group

```bash [setup-gitlab.sh]
#!/bin/bash
# setup-gitlab.sh - GitLab 配置向导
# 更新于: 2026-02-09

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[ℹ]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }

echo "=== GitLab 设置向导 ==="
echo ""

# 如果已有 .env，备份并加载
if [ -f .env ]; then
    print_info "检测到现有配置，将保留其他设置..."
    cp .env .env.backup.$(date +%s)
    grep -v -E "^(CF_API_|DOMAIN_NAME=|SSL_EMAIL=)" .env > .env.tmp 2>/dev/null || true
else
    touch .env.tmp
fi

echo "=== GitLab ssh port 配置 ==="
echo ""

read -p "请输入 GitLab ssh 端口号：" GITLAB_SSH_PORT_NUM
# 端口号验证逻辑
# 1. 必须是数字
# 2. 范围必须在 1-65535 之间
# 3. 大于等于1024的端口通常不需要root权限（建议但非强制）
if [[ "$GITLAB_SSH_PORT_NUM" =~ ^[0-9]+$ ]]; then
  # 检查端口号是否在有效范围内
  if [ "$GITLAB_SSH_PORT_NUM" -ge 1 ] && [ "$GITLAB_SSH_PORT_NUM" -le 65535 ]; then
    # 检查是否为特权端口（可选）
    if [ "$GITLAB_SSH_PORT_NUM" -lt 1024 ]; then
      print_warn "警告：端口 $GITLAB_SSH_PORT_NUM 是特权端口，可能需要 root 权限"
    fi
                                                     
    print_success "有效端口号: $GITLAB_SSH_PORT_NUM"
  else
    print_error "错误：端口号必须在 1-65535 范围内"
    exit 1
  fi
else
  print_error "错误：端口号必须是数字"
  exit 1
fi

# 创建必需目录
mkdir -p gitlab/config gitlab/data gitlab/logs

# 生成完整的 .env 文件
cat > .env << EOF
# ===== GitLab 配置 =====
GITLAB_SSH_PORT=${GITLAB_SSH_PORT_NUM}
GITLAB_HOME=${PWD}/gitlab

# ===== 时区配置 =====
# TZ=Asia/Shanghai
EOF

# 追加原有配置中不需要覆盖的部分
if [ -f .env.tmp ]; then
  echo "" >> .env
  echo "# ===== 原有其他配置 =====" >> .env
  cat .env.tmp >> .env
  rm .env.tmp
fi

chmod 640 .env

print_success "=== 配置完成 ==="

# 清理临时文件
rm -f .env.tmp
```

:::

### 创建 `deploy-gitlab.sh`

做前置条件检查，然后部署 GitLab 容器并使用 nginx 代理。

::: code-group

```bash [deploy-gitlab.sh]
#!/bin/bash
# deploy-gitlab.sh 部署脚本
# 支持 docker-compose 和 docker compose 命令

set -e
# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
print_info() { echo -e "${GREEN}[ℹ]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_step() { echo -e "${BLUE}[→]${NC} $1"; }
echo "🚀 === GitLab 自动化部署 ==="
echo ""

# 1. 检查前置条件
check_prerequisites() {
    print_info "检查前置条件..."
    
    # 检查必要文件
    if [ ! -f .env ]; then
        print_error ".env 文件不存在"
        echo "请先运行: ./setup-cloudflare-token.sh"
        exit 1
    fi
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装"
        exit 1
    fi
    
    if ! sudo docker info &> /dev/null; then
        print_error "Docker 服务未运行或无权限"
        echo "尝试: sudo systemctl start docker"
        exit 1
    fi
    
    # 检查Docker Compose命令
    if docker compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
        print_success "使用 docker compose (Docker Compose v2)"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
        print_success "使用 docker-compose (Docker Compose v1)"
    elif sudo docker compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="sudo docker compose"
        print_success "使用 sudo docker compose (Docker Compose v2)"
    elif command -v sudo &> /dev/null && sudo docker-compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="sudo docker-compose"
        print_success "使用 sudo docker-compose (Docker Compose v1)"
    else
        print_error "Docker Compose 未安装"
        echo "请安装 Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi

    # 根据 DOCKER_COMPOSE_CMD 决定 docker 命令前缀（是否需要 sudo）
    if echo "$DOCKER_COMPOSE_CMD" | grep -q "^sudo"; then
        DOCKER_CMD="sudo docker"
    else
        DOCKER_CMD="docker"
    fi
    
    print_success "前置条件检查通过"
}

# 2. 准备部署环境
prepare_environment() {
    print_info "准备部署环境..."
    
    # 加载环境变量
    source .env
    
    # 显示配置
    echo ""
    echo "📋 部署配置"
    echo "──────────"
    echo "• 部署位置: ${GITLAB_HOME}"
    echo "• SSH PORT: ${GITLAB_SSH_PORT}"
    echo ""
    
    # 确认部署
    read -p "是否继续部署？(y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "部署已取消"
        exit 0
    fi
    
}

# 3. 启动主服务
start_main_services() {
    print_info "启动主服务..."
    
    # 启动GitLab
    print_info "启动GitLab服务..."
    if ! $DOCKER_COMPOSE_CMD up -d gitlab; then
        print_error "GitLab启动失败"
        exit 1
    fi
    
    # 等待GitLab启动
    print_info "等待GitLab启动..."
    local max_tries=30
    local tried=0
    
    while [ $tried -lt $max_tries ]; do
        if $DOCKER_COMPOSE_CMD exec -T gitlab curl -f http://127.0.0.1:80 &> /dev/null 2>&1; then
            print_success "GitLab服务已就绪"
            break
        fi
        tried=$((tried + 1))
        echo "  等待GitLab... (${tried}/${max_tries})"
        sleep 10
    done
    
    if [ $tried -ge $max_tries ]; then
        print_warn "GitLab启动较慢，继续部署..."
    fi
    
}

# 4. 验证部署
verify_deployment() {
    print_info "验证部署..."
    
    echo ""
    echo "📊 服务状态"
    echo "──────────"
    $DOCKER_COMPOSE_CMD ps
    
    echo ""
    echo "🔧 管理命令"
    echo "──────────"
    echo "• 查看日志: $DOCKER_COMPOSE_CMD logs -f"
    echo "• 重启服务: $DOCKER_COMPOSE_CMD restart"
    echo "• 停止服务: $DOCKER_COMPOSE_CMD down"
    echo "• 进入容器: $DOCKER_COMPOSE_CMD exec gitlab bash"
    
    echo ""
    echo "📁 重要文件位置"
    echo "──────────────"
    echo "• 配置文件: .env"
    echo "• GitLab日志: logs/"


    print_success "✅ 生产环境部署完成！"
}

# 主函数
main() {
    echo ""
    check_prerequisites
    prepare_environment
    start_main_services
    verify_deployment
    
    echo ""
    print_success "✨ 部署流程完成！"
}

# 异常处理
trap 'print_error "脚本执行被中断"; exit 1' INT TERM

# 运行主函数
main "$@"
```

:::

### 创建 `docker-compose.yml`

用于启动 GitLab。

首先用 `docker network ls` 命令查看 nginx 容器的网络信息。然后用 `docker network inspect` 命令查看 nginx 容器的网络信息。这里的 `nginx_proxy_proxy-network` 就是 nginx 容器的网络名称。我们主要是获取 nginx 容器的 Subnet 和 Gateway。

```bash
$ docker network ls # [!code focus]
NETWORK ID     NAME                        DRIVER    SCOPE
8a4c5a55036b   bridge                      bridge    local
733836bac6f7   nginx_proxy_proxy-network   bridge    local # [!code focus]
83b907826bc7   none                        null      local

$ docker network inspect nginx_proxy_proxy-network # [!code focus]
[
    {
        "Name": "nginx_proxy_proxy-network",
        "Id": "733836bac6f783e5f77bbb97398b06b991b0071637c7421daae787e307a83f44",
        "Created": "2026-02-11T08:37:58.720607628Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv4": true,
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.18.0.0/16", # [!code focus]
                    "Gateway": "172.18.0.1" # [!code focus]
                }
            ]
        },
        ...
    }
    ...
]
```

> [!IMPORTANT]
>
> `172.18.0.0/16` 和 `172.18.0.1` 是 nginx 容器的 Subnet 和 Gateway。

::: code-group

```yaml [docker-compose.yml]
version: '3.8'
services:
  gitlab:
    image: gitlab/gitlab-ce:18.8.4-ce.0
    container_name: gitlab
    expose:
      - "80"
    restart: unless-stopped
    environment:
      TZ: "${TZ:-Asia/Shanghai}"
      GITLAB_OMNIBUS_CONFIG: |
        # 关键：设为用户实际访问的域名
        external_url 'https://gitlab.example.net'
        gitlab_rails['gitlab_shell_ssh_port'] = ${GITLAB_SSH_PORT:-2424}

        # 调整端口设置（因为运行在反代后面）
        nginx['listen_port'] = 80
        nginx['listen_https'] = false  # 由 Nginx 处理 SSL

        # 信任反向代理头
        nginx['real_ip_trusted_addresses'] = ['172.18.0.0/16', '192.168.0.0/16']
        nginx['real_ip_header'] = 'X-Forwarded-For'
        nginx['real_ip_recursive'] = 'on'
        
        gitlab_rails['trusted_proxies'] = ['172.18.0.0/16', '192.168.0.0/16']

    ports:
      - "${GITLAB_SSH_PORT:-2424}:22"
    volumes:
      - '${GITLAB_HOME}/config:/etc/gitlab'
      - '${GITLAB_HOME}/logs:/var/log/gitlab'
      - '${GITLAB_HOME}/data:/var/opt/gitlab'
    shm_size: '256m'
    networks:
      - proxy-network
    healthcheck:
      test: ["CMD-SHELL", "timeout 10 bash -c 'cat < /dev/null > /dev/tcp/127.0.0.1/80' 2>/dev/null || exit 1"]
      interval: 60s
      timeout: 10s
      retries: 3
      start_period: 300s

    env_file:
      - .env

networks:
  proxy-network:
    external: true
    name: nginx_proxy_proxy-network
```

:::

> [!IMPORTANT]
>
> `external_url` 对应的值为用户实际访问的域名，必须填写你的域名。它是你在克隆仓库时使用的域名。
>
> `nginx['real_ip_trusted_addresses']` 对应的数组的第一个元素是 GitLab 运行在的网卡的子网地址，将用上面命令获取到的 Subnet 填进去。
>
> `gitlab_rails['trusted_proxies']` 和`nginx['real_ip_trusted_addresses']` 的值必须一致。

### 创建 `Makefile`

做些自动化处理。

::: code-group

```makefile [Makefile]
# Makefile - 部署命令简化
.PHONY: help setup deploy stop logs clean status test restart reload auto-reload

# 自动检测 docker compose 命令
DOCKER_COMPOSE_CMD := $(shell docker compose version > /dev/null 2>&1 && echo "compose" || echo "-compose")

help:
        @echo "可用命令:"
        @echo "  make setup        - 配置 GitLab"
        @echo "  make deploy       - 部署 GitLab"
        @echo "  make stop         - 停止所有服务"
        @echo "  make restart      - 重启所有服务"
        @echo "  make logs         - 查看所有日志"
        @echo "  make status       - 查看服务状态"
        @echo "  make clean        - 清理数据和配置（危险！）"

setup:
        @chmod +x setup-gitlab.sh
        @./setup-gitlab.sh

deploy:
        @chmod +x deploy-gitlab.sh
        @./deploy-gitlab.sh

stop:
        sudo docker $(DOCKER_COMPOSE_CMD) down

logs:
        sudo docker $(DOCKER_COMPOSE_CMD) logs --tail=100

logs-follow:
        sudo docker $(DOCKER_COMPOSE_CMD) logs --follow --tail=100

status:
        sudo docker $(DOCKER_COMPOSE_CMD) ps

restart:
        sudo docker $(DOCKER_COMPOSE_CMD) restart

clean:
        @echo "⚠️  危险操作：将删除所有数据和配置"
        @read -p "确认删除？(输入 yes 继续): " confirm && [ "$$confirm" = "yes" ]
        sudo docker $(DOCKER_COMPOSE_CMD) down -v
        sudo rm -rf gitlab
        sudo rm -f .env
        @echo "✅ 清理完成"
```

:::
