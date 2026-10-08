---
lang: zh-CN
title: Idea
titleTemplate: metacubexd
description: metacubexd
head:
  - - meta
    - name: description
      content: metacubexd
  - - meta
    - name: keywords
      content: metacubexd mihomo podman docker
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# metacubexd All-in-One Server 部署说明

> [!TIP]
>
> 适用环境:Linux+ rootless Podman 5.x
> 最后更新:2026-10-05

## 一、部署概览

| 项目 | 值 |
|---|---|
| 镜像 | `registry.cn-hangzhou.aliyuncs.com/eyeineye/ghcr.io.metacubex.metacubexd-server-linux-amd64:latest` |
| 部署目录 | `/home/ray/metacubexd/`(`.env` + `docker-compose.yml`) |
| 数据卷 | named volume `metacubexd-data`(挂载到容器 `/data`) |
| 容器名 | `metacubexd` |
| 重启策略 | `unless-stopped`( Linux 启动且 podman socket 就绪时自动拉起) |

端口(容器内外一致):

| 端口 | 用途 |
|---|---|
| `8080` | 仪表盘 UI + Control API(`/api/control`) |
| `9090` | mihomo Clash API(WebSocket 流量也走这里) |
| `7890` | HTTP/SOCKS 混合代理端口 |

访问入口:

- 仪表盘:`http://localhost:8080`(浏览器可直接用 localhost,走 Linux 端口转发)
- Clash API 地址(UI 连接后端用):`http://<Linux-IP>:9090`,当前 Linux IP 为 `172.31.21.141`
- 代理:`127.0.0.1:7890`(HTTP 与 SOCKS 同端口)

登录令牌与密钥保存在 `/home/ray/metacubexd/.env`(权限 600),部署脚本结束时也会打印一遍;**不要把真实令牌写进本文档或任何会提交 git 的文件**。

> [!TIP]
>
> `ray` 这里是用户名,请自行修改

## 二、文件说明

```
/home/ray/workspace/metacubexd/
├── deploy.sh    # 一键部署脚本(幂等,可反复执行)
└── deploy.md    # 本文档

/home/ray/metacubexd/          # 部署产物(脚本生成)
├── .env                       # 所有配置与密钥(600)
├── .env.bak.<时间戳>          # 每次重跑脚本前的自动备份
└── docker-compose.yml         # 密钥经 ${VAR:?} 引用 .env,文件本身不含敏感信息
```

数据卷 `metacubexd-data` 的宿主机路径(可直接读写、备份):

```
/home/ray/.local/share/containers/storage/volumes/metacubexd-data/_data/
```

内存放内核运行数据:`active.yaml`(激活的内核配置)、`profiles/`、`cache.db`、`geoip.dat`、`geosite.dat`、`country.mmdb` 等。重建容器不影响这里的数据。

## 三、部署 / 重新部署

### 前置条件

- Linux 中已安装 podman ≥ 5.x(`podman --version`)
- `podman compose` 可用(5.x 会自动委托给 podman-compose)
- 网络可访问阿里云镜像仓库与 jsdelivr CDN

### 执行

```bash
bash ~/workspace/metacubexd/deploy.sh           # 默认部署到 ~/metacubexd
bash ~/workspace/metacubexd/deploy.sh ~/其他目录  # 指定目录
```

脚本按顺序做五件事,全部支持回车取默认值:

1. **清理旧部署**:移除同名旧容器 `metacubexd`、旧网络 `metacubexd_default`(不存在则跳过)
2. **交互生成 `.env`**:
   - `CONTROL_TOKEN` / `CLASH_SECRET`:回车 = 自动生成 32 位随机 hex
   - 三个端口:默认 8080 / 9090 / 7890(非法输入会要求重输)
   - `TZ`:默认 Asia/Shanghai
   - `DEFAULT_BACKEND_URL`:回车 = 自动探测本机 IP,填 `http://<WSL-IP>:9090`
   - `GITHUB_TOKEN`:可选,回车跳过
3. **生成 `docker-compose.yml`**:密钥只存在于 `.env`
4. **预下载 geo 数据文件**:从 jsdelivr CDN 拉取 `geoip.dat` / `geosite.dat` / `country.mmdb` 装入数据卷(容器内直连 GitHub 下载常失败,故由宿主机预下载;文件已存在时询问是否重新覆盖,默认跳过)
5. **询问是否立即启动**:`podman compose up -d`,默认否

> **重新配置**:直接重跑脚本,输入新值即可。旧 `.env` 自动备份,容器自动重建,**数据卷数据不丢**。

## 四、部署后验证

```bash
# 1. 容器状态(应显示 Up (healthy))
podman ps

# 2. 健康检查(200 且 {"ok":true} 表示仪表盘 + Control Agent 正常;不代表内核状态)
curl http://localhost:8080/api/control/health

# 3. 内核(mihomo)是否运行,密钥替换为 .env 中的 CLASH_SECRET
curl -H "Authorization: Bearer <CLASH_SECRET>" http://localhost:9090/version

# 4. 代理链路(应返回 HTTP 200)
curl -o /dev/null -w 'HTTP %{http_code}\n' -x http://127.0.0.1:7890 https://www.google.com

# 5. 代理出口 IP
curl -x http://127.0.0.1:7890 https://api.ipify.org; echo
```

仪表盘内确认:连接设置中后端地址应已预填 `http://<WSL-IP>:9090`,输入 CLASH_SECRET 连接。

## 五、日常管理

```bash
cd ~/metacubexd
podman compose up -d      # 启动/重建
podman compose down       # 停止(数据卷保留)
podman compose pull && podman compose up -d   # 更新镜像
podman logs -f metacubexd # 日志(Clash 日志在仪表盘 Logs 页;此处是容器/内核进程日志)
```

**数据备份**(整个数据卷打包):

```bash
VOL=/home/ray/.local/share/containers/storage/volumes/metacubexd-data/_data
tar -C "$(dirname "$VOL")" -czf ~/metacubexd-data-$(date +%F).tgz "$(basename "$VOL")"
```

**恢复**:部署好新环境后解包回同路径,或 `podman volume import`。

## 六、故障排查(按实际踩过的坑记录)

### 1. 代理端口(7890)连接被瞬间 reset,但 9090 正常

**现象**:`curl -x http://127.0.0.1:7890` 立刻 `Connection reset`,baidu/google 都失败;而 Clash API 9090 一切正常,内核出站(DIRECT 测速)也正常。

**原因**:rootless podman 的 `rootlessport` 转发进容器的连接,源地址是容器网卡 IP 而非 loopback;mihomo 默认 `allow-lan: false` 时 mixed 端口只接受 loopback 来源 → 一律拒绝。Clash API 是独立监听,不受此限制,所以呈现"9090 通、7890 不通"的单边故障。

**解决**:仪表盘 → **配置** 页 → 打开「**允许局域网连接**(Allow LAN)」。该开关由 agent 持久化写入数据卷的 `active.yaml`,重启不丢。开启后同网段设备理论上可使用该代理,WSL2 NAT 环境下实际仅 Windows 宿主机可达;如有顾虑可在 mihomo 配置中加 `authentication` 或 `lan-allowed-ips`。

### 2. geo 数据文件下载失败

容器内直连 GitHub 不稳定。脚本已内置 jsdelivr CDN 预下载;若文件缺失/损坏,重跑 `deploy.sh` 并在「是否重新下载覆盖」处选 `y`。文件有效性可用开头字节判断:`geoip.dat`/`geosite.dat` 是 protobuf(非 HTML 文本),`country.mmdb` 以 MMDB 元数据头开始。

### 3. Linux IP 变化导致 UI 预填后端连不上

WSL2 的 eth0 IP 重启后会变。仪表盘连接设置里手动填新 IP 的 `:9090` 地址,或重跑 `deploy.sh`(回车即可,`DEFAULT_BACKEND_URL` 会重新探测)。仅 Windows 本机访问时 `localhost:9090` 通常也可用。

### 4. 订阅刷新超时

容器日志中 `subscription fetch timed out` 属订阅源站网络问题,与代理功能无关;代理链路正常后,在仪表盘里刷新订阅即可。

### 5. 内核未运行 / 起不来

- 健康检查 200 只代表仪表盘 + Control Agent 正常,内核状态看仪表盘「控制」页或容器日志
- 配置解析错误看容器日志中的 kernel 输出段(与 Clash 运行日志是两回事)
- 端口冲突:`ss -ltnp | grep -E ':7890|:8080|:9090'` 查占用,或改 `.env` 端口重跑脚本

## 七、当前部署快照(2026-10-05)

- 容器 `Up (healthy)`,内核 mihomo v1.19.27
- geo 文件已由脚本预装(geoip.dat 16M / geosite.dat 4.1M / country.mmdb 7.4M)
- `allow-lan: true`(经 UI 开启并持久化),代理出口:KR 节点
- 旧部署 `/home/ray/container/metacubexd/`(bind mount + 硬编码 token 方式)已停用,文件保留未删,确认无误后可自行清理

## 八、部署脚本

::: code-group

```bash [deploy.sh]
#!/usr/bin/env bash
# ============================================================================
# metacubexd all-in-one server 一键部署脚本(podman 版)
#
# 功能:
#   1. 清理旧部署(停止并移除名为 metacubexd 的旧容器及其网络,幂等可重复执行)
#   2. 交互式生成 .env(直接回车接受默认值;token 回车=自动随机生成)
#   3. 生成 docker-compose.yml(密钥只存在于 .env,compose 通过 ${VAR} 引用)
#   4. 从 jsdelivr CDN 下载 geoip.dat / geosite.dat / country.mmdb 并装入数据卷
#      (内核在容器内直连 GitHub 下载常因网络问题失败,故由宿主机预下载)
#   5. 询问是否立即执行 podman compose up -d
#
# 用法:
#   bash deploy.sh [部署目录]        # 省略目录时默认 ~/metacubexd
#
# 重新配置:再次运行本脚本,输入新值即可(旧 .env 自动备份,容器自动重建)。
# 数据保存在 named volume metacubexd-data 中,重建容器不会丢失。
# ============================================================================
set -euo pipefail

IMAGE='registry.cn-hangzhou.aliyuncs.com/eyeineye/ghcr.io.metacubex.metacubexd-server-linux-amd64:latest'
CONTAINER_NAME='metacubexd'
DEFAULT_DIR="${HOME}/metacubexd"

log()  { printf '\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m警告:\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m错误:\033[0m %s\n' "$*" >&2; exit 1; }

command -v podman >/dev/null 2>&1 || die "未找到 podman,请先安装 podman。"

# ---------------------------------------------------------------- 1. 部署目录
TARGET_DIR="${1:-}"
if [[ -z "${TARGET_DIR}" ]]; then
  read -r -p "部署目录 [${DEFAULT_DIR}]: " TARGET_DIR || true
  TARGET_DIR="${TARGET_DIR:-${DEFAULT_DIR}}"
fi
TARGET_DIR="${TARGET_DIR/#\~/$HOME}"   # 支持 ~ 开头的路径
mkdir -p "${TARGET_DIR}"
log "部署目录:${TARGET_DIR}"

# ------------------------------------------------------------ 2. 清理旧部署
log "检查并清理旧部署..."
# 老版本 podman-compose 可能注册过 systemd 用户单元,一并禁用(不存在则忽略)
systemctl --user disable --now podman-compose@metacubexd.service >/dev/null 2>&1 || true
if podman container exists "${CONTAINER_NAME}" 2>/dev/null; then
  log "  停止并移除旧容器 ${CONTAINER_NAME}"
  podman rm -f "${CONTAINER_NAME}" >/dev/null
else
  echo "  未发现旧容器 ${CONTAINER_NAME},跳过"
fi
if podman network exists "${CONTAINER_NAME}_default" 2>/dev/null; then
  log "  移除旧网络 ${CONTAINER_NAME}_default"
  podman network rm "${CONTAINER_NAME}_default" >/dev/null
fi

# -------------------------------------------------------- 3. 交互生成 .env
gen_token() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 16
  else
    od -An -N16 -tx1 /dev/urandom | tr -d ' \n'
  fi
}

# detect_ip:探测本机 IP(WSL2 的 eth0 网段地址),失败则回退 hostname -I
detect_ip() {
  local ip=""
  if command -v ip >/dev/null 2>&1; then
    ip="$(ip -4 addr show eth0 2>/dev/null | grep -m1 -oP '(?<=inet\s)\d+(\.\d+){3}')" || true
  fi
  if [[ -z "${ip}" ]]; then
    ip="$(hostname -I 2>/dev/null | awk '{print $1}')" || true
  fi
  printf '%s' "${ip}"
}

# ask "提示" "默认值":读取一行输入存入 REPLY,空输入取默认值
ask() {
  local prompt="$1" def="$2" r=""
  read -r -p "$(printf '%s [%s]: ' "${prompt}" "${def}")" r || true
  REPLY="${r:-${def}}"
}

# ask_port "提示" "默认值":校验 1-65535 的数字端口,不合法则重试
ask_port() {
  local name="$1" def="$2"
  while :; do
    ask "${name}" "${def}"
    if [[ "${REPLY}" =~ ^[0-9]{1,5}$ ]] && (( 10#${REPLY} >= 1 && 10#${REPLY} <= 65535 )); then
      break
    fi
    warn "端口必须是 1-65535 之间的数字,请重新输入"
  done
}

ENV_FILE="${TARGET_DIR}/.env"
if [[ -f "${ENV_FILE}" ]]; then
  BACKUP="${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
  cp "${ENV_FILE}" "${BACKUP}"
  warn "已存在 .env,旧文件已备份为 ${BACKUP}"
fi

echo
log "开始配置(直接回车接受方括号中的默认值)"
ask "CONTROL_TOKEN(Control API 访问令牌,回车=自动生成)" "$(gen_token)"
CONTROL_TOKEN="${REPLY}"
ask "CLASH_SECRET(Clash API 密钥,回车=自动生成)" "$(gen_token)"
CLASH_SECRET="${REPLY}"
ask_port "CONTROL_PORT(仪表盘 + Control API 端口)" "8080"
CONTROL_PORT="${REPLY}"
ask_port "CLASH_API_PORT(mihomo Clash API 端口)" "9090"
CLASH_API_PORT="${REPLY}"
ask_port "MIXED_PORT(HTTP/SOCKS 混合代理端口)" "7890"
MIXED_PORT="${REPLY}"
ask "TZ(时区)" "Asia/Shanghai"
TZ="${REPLY}"
LOCAL_IP="$(detect_ip)"
DEFAULT_BACKEND_DEF=""
if [[ -n "${LOCAL_IP}" ]]; then
  DEFAULT_BACKEND_DEF="http://${LOCAL_IP}:${CLASH_API_PORT}"
fi
ask "DEFAULT_BACKEND_URL(UI 连接表单预填的 Clash API 地址,回车=本机IP ${LOCAL_IP:-未检测到})" "${DEFAULT_BACKEND_DEF}"
DEFAULT_BACKEND_URL="${REPLY}"
ask "GITHUB_TOKEN(可选:提升 GitHub API 限流,回车跳过)" ""
GITHUB_TOKEN="${REPLY}"

cat > "${ENV_FILE}" <<EOF
# metacubexd all-in-one server 配置(由 deploy.sh 生成)
# 修改本文件后重新运行 deploy.sh,或直接: podman compose up -d 重建容器
CONTROL_TOKEN=${CONTROL_TOKEN}
CLASH_SECRET=${CLASH_SECRET}
CONTROL_PORT=${CONTROL_PORT}
CLASH_API_PORT=${CLASH_API_PORT}
MIXED_PORT=${MIXED_PORT}
TZ=${TZ}
DEFAULT_BACKEND_URL=${DEFAULT_BACKEND_URL}
GITHUB_TOKEN=${GITHUB_TOKEN}
EOF
chmod 600 "${ENV_FILE}"
log "已生成 ${ENV_FILE}"

# -------------------------------------------------- 4. 生成 docker-compose.yml
COMPOSE_FILE="${TARGET_DIR}/docker-compose.yml"
cat > "${COMPOSE_FILE}" <<EOF
# 由 deploy.sh 生成,不要把密钥写进本文件(统一放在 .env)。
services:
  metacubexd:
    image: ${IMAGE}
    container_name: ${CONTAINER_NAME}
    restart: unless-stopped
    environment:
      CONTROL_TOKEN: '\${CONTROL_TOKEN:?请在 .env 中设置 CONTROL_TOKEN}'
      CLASH_SECRET: '\${CLASH_SECRET:?请在 .env 中设置 CLASH_SECRET}'
      GITHUB_TOKEN: '\${GITHUB_TOKEN:-}'
      # 可选:预填 UI 连接表单的 Clash API 地址
      DEFAULT_BACKEND_URL: '\${DEFAULT_BACKEND_URL:-}'
      CONTROL_PORT: '\${CONTROL_PORT:?请在 .env 中设置 CONTROL_PORT}'
      CLASH_API_PORT: '\${CLASH_API_PORT:?请在 .env 中设置 CLASH_API_PORT}'
      MIXED_PORT: '\${MIXED_PORT:?请在 .env 中设置 MIXED_PORT}'
      TZ: '\${TZ:-UTC}'
    ports:
      # 仪表盘 UI + /api/control
      - '\${CONTROL_PORT:?}:\${CONTROL_PORT:?}'
      # mihomo Clash API + WebSocket(UI 中连接后端用)
      - '\${CLASH_API_PORT:?}:\${CLASH_API_PORT:?}'
      # HTTP/SOCKS 混合代理端口
      - '\${MIXED_PORT:?}:\${MIXED_PORT:?}'
    volumes:
      # profiles、active config、geo/缓存必须可写
      - 'metacubexd-data:/data'
    healthcheck:
      test: ['CMD', 'wget', '-qO-', 'http://127.0.0.1:\${CONTROL_PORT:-8080}/api/control/health']
      interval: 30s
      timeout: 5s
      start_period: 10s
      retries: 3
    # ---- TUN(高级用法,仅 Linux):启用系统级路由 ----
    # 需删除上面的 ports: 段(host 网络模式下无效),并在 mihomo 配置中启用 tun:
    # network_mode: host
    # cap_add: [NET_ADMIN]
    # devices: ['/dev/net/tun:/dev/net/tun']

volumes:
  # 显式命名,避免 podman-compose 按项目名加前缀
  metacubexd-data:
    name: metacubexd-data
EOF
log "已生成 ${COMPOSE_FILE}"

# ------------------------------------------- 4.5 下载 geo 数据文件到数据卷
GEO_BASE='https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release'
GEO_FILES=(geoip.dat geosite.dat country.mmdb)
VOL_NAME='metacubexd-data'

# 数据卷由 podman compose up -d 自动创建;这里提前建好,以便装入 geo 文件
if ! podman volume exists "${VOL_NAME}" 2>/dev/null; then
  log "创建数据卷 ${VOL_NAME}"
  podman volume create "${VOL_NAME}" >/dev/null
fi
VOL_MP="$(podman volume inspect "${VOL_NAME}" --format '{{.Mountpoint}}')"

GEO_MISSING=0
for f in "${GEO_FILES[@]}"; do
  [[ -s "${VOL_MP}/${f}" ]] || GEO_MISSING=1
done

SKIP_GEO=0
if (( GEO_MISSING )); then
  log "下载数据卷缺失的 geo 数据文件(MetaCubeX/meta-rules-dat @ jsdelivr CDN)"
else
  read -r -p "geo 数据文件已存在于数据卷,是否重新下载覆盖? [y/N]: " REDO_GEO || true
  if [[ "${REDO_GEO:-}" =~ ^[Yy]$ ]]; then
    log "重新下载 geo 数据文件"
  else
    SKIP_GEO=1
    log "跳过 geo 数据文件下载"
  fi
fi

if (( ! SKIP_GEO )); then
  GEO_TMP="$(mktemp -d)"
  GEO_FAIL=0
  for f in "${GEO_FILES[@]}"; do
    log "  下载 ${f} ..."
    if curl -fsSL --retry 3 --retry-delay 2 --connect-timeout 15 \
         -o "${GEO_TMP}/${f}" "${GEO_BASE}/${f}" \
       && [[ "$(stat -c %s "${GEO_TMP}/${f}" 2>/dev/null || echo 0)" -ge 10240 ]]; then
      cp -f "${GEO_TMP}/${f}" "${VOL_MP}/${f}"
      chmod 644 "${VOL_MP}/${f}"
      log "  已装入数据卷:$(du -h "${VOL_MP}/${f}" | cut -f1)  ${VOL_MP}/${f}"
    else
      warn "  ${f} 下载失败,已跳过(容器启动后内核会自行尝试下载)"
      GEO_FAIL=1
    fi
  done
  rm -rf "${GEO_TMP}"
  if (( ! GEO_FAIL )); then
    log "geo 数据文件全部就绪"
  fi
fi

# ------------------------------------------------------------ 6. 可选启动
echo
read -r -p "是否立即执行 podman compose up -d 启动容器? [y/N]: " START_NOW || true
cd "${TARGET_DIR}"
if [[ "${START_NOW:-}" =~ ^[Yy]$ ]]; then
  podman compose up -d
  log "容器已启动:podman ps 查看状态,podman logs -f ${CONTAINER_NAME} 查看日志"
else
  log "已跳过启动,之后手动执行:"
  echo "  cd ${TARGET_DIR} && podman compose up -d"
fi

cat <<EOF

============================ 部署信息 ============================
  仪表盘:       http://localhost:${CONTROL_PORT}  (登录令牌 = CONTROL_TOKEN)
  Clash API:    http://localhost:${CLASH_API_PORT}  (密钥 = CLASH_SECRET)
  混合代理端口: ${MIXED_PORT}
  健康检查:     curl http://localhost:${CONTROL_PORT}/api/control/health
  CONTROL_TOKEN = ${CONTROL_TOKEN}
  CLASH_SECRET  = ${CLASH_SECRET}
  (以上两个值保存在 ${ENV_FILE},权限 600)
==================================================================
EOF
```

:::
