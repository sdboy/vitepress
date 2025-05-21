---
lang: zh-CN
title: Idea
titleTemplate: HashiCorp Vault 结合CoreDNS签发TLS 证书
description: HashiCorp Vault 结合CoreDNS签发TLS 证书
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: HashiCorp Vault  coredns acme ssl tls
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# HashiCorp Vault 结合CoreDNS签发TLS 证书

很棒的选择！

你想要的是基于 **HashiCorp Vault 作为私有 ACME 服务结合 CoreDNS**，为内网服务签发可信任的 TLS 证书，并实现自动申请、自动更新、内部 DNS 解析与安全访问控制。这是一个高度灵活、内网友好、可审计、可自动化的全栈 TLS 办公方案。

我将从以下几个方面为你详细说明整套方案：

---

## 🎯 目标：

我们要构建一套**零信任内网证书体系**：

- Vault 作为内部私有 CA 负责创建证书（支持 SAN、IP、DNS）
- 为组件签发 CN 为 `*.dev.local` 或其他内网域名的证书
- CoreDNS 作为内部 DNS 来保证 `.dev.local` 域名解析
- 使用 acme.sh 或 LEGO 签发证书（Mock Let's Encrypt 的 ACME 协议模式）
- 实现如下方式申请证书：
  - DNS Challenge（推荐）
  - 或者 HTTP Challenge（适用于能暴露服务到某个验证节点）

- 所有机器信任 Vault 签发的根证书以信任 ACME 证书

---

# ✅ 方案拓扑图：

```plaintext
+--------------------------+
| HTTPS Service (Nginx)   |
+-----------+------------+
            |
    Issued using Vault CA
            |
+-----------v--------------+
| Vault + ACME             |<----+   acme.sh + DNS / HTTP
+-----------+--------------+     |
            |                   |
       backend CA engine          | DNS or Web Challenge
+-----------v--------------+     |
| CFSSL / Internal CA      |     |
+--------------------------+     |
                                |
         +----------------------v-------------------+      +------------------+
         | DNS Resolver                             |----->| CoreDNS          |
         | (example server.dev.local => 10.10.1.10)  |      | 为内网域名解析提供一致性 |
         +------------------------------------------+      +------------------+
```

---

# 🛠️ 第一步：部署 HashiCorp Vault

Vault + TLS Secret 引擎可以用来作为私有 ACME 服务。

## 1. 启动 Vault 服务器并启用 TLS CA 引擎

```bash
vault secrets enable pki
vault secrets tune -max-lease-ttl=87600h pki
```

### 提交内部 CA：

```bash
vault write pki/root/generate/internal \
    common_name="internal-ca" \
    ttl="87600h"
```

也可以引入您的企业内部根证书：

```bash
vault write pki/root/generate/internal \
    common_name="your-ca" \
    private_key_type="ec" \
    key_bits=384 \
    pem_bundle=@internal-ca.pem
```

> 👉 将 root CA 生成一个 `.pem` 文件，备份后部署到信任库中

## 2. 创建角色（支持 SAN、多个域名、IP）

```bash
vault write pki/roles/tls-dev \
    allowed_domains="dev.local" \
    allow_subdomains=true \
    max_ttl="720h" \
    key_types="ec" \
    key_bits=384 \
    allow_ip_sans=true \
    allow_dns_sans=true \
    allow_any_name=false
```

---

# 📡 第二步：暴露 Vault CA 为 **符合 ACME 协议的服务端点**

Vault 本身原生不带兼容的 ACME 端口，需要通过代理或作为通 ACME 协议服务暴露。

## ✅ 推荐工具 ✅：[smallstep/acme-proxy](https://github.com/smallstep/acme-proxy)

acme-proxy 是一个兼容 Let's Encrypt ACME 协议、但背后使用 Vault 签发证书的代理（ACME 协议兼容器）。这非常适合内网使用。

---

## 🧠 acme-proxy 的关键功能

- 背后调用 Vault 的 `pki` 引擎签发证书
- 暴露 `/acme/directory` 兼容 Let's Encrypt 协议端点
- 客户端（包括 acme.sh）可直接对接这个代理 endpoint 来模拟 Let's Encrypt

---

# 🚀 配置 acme-proxy（简要）

```yaml
# config.yaml
vault:
  addr: https://vault.internal:8200
  token: "vault-aviable-with-policy"
  ttl: 720h
acme:
  domains:
    - "*.dev.local"
  keys:
    - curve: P-384 # 推荐使用 ECDSA
    - algorithm: RS256
  resolver: https://10.10.1.1/dns # 结合 CoreDNS 与配策的 OCSP
server:
  addr: ":4401"
```

然后启动：

```bash
acme-proxy --config config.yaml
```

该服务会在 https://acmeproxy.dev.local:4401 提供类似 Let's Encrypt 的 `/acme` 接口。

---

# 📐 第三步：配置 CoreDNS 为内网解析服务

CoreDNS 为内网提供 DNS 服务，主要用于 acme.sh + DNSChallenge。

### 示例 CoreDNS 配置 `coredns.conf`：

```coredns
dev.local:53 {
    file /etc/coredns/zones/dev.local.zone
    log
    errors
    reload 5s
}
```

### 区域文件 `dev.local.zone` 示例：

```dns
@       IN      SOA     ns1.dev.local. admin.dev.local. (
                                2025010101  ; serial
                                24h         ; refresh
                                2h          ; retry
                                4d          ; expire
                                1h )        ; minimum

@       IN      NS      ns1.dev.local.
ns1     IN      A       10.10.1.13

*       IN      A       10.10.1.100
```

这样你可以解析 `nginx.dev.local` 或任意子域。

---

# 🔐 第四步：acme.sh 使用 acme-proxy 签发证书

acme.sh 支持自定义 acme 服务器注册，可以对接你运行的 `acme-proxy`。

### ✅ 使用 RSA + ECDSA 证书（DNS Challenge）

假设 acme-proxy 暴露在 `https://acmeproxy.dev.local/acme/directory`

### 🧬 利用 CoreDNS 管理内网域名验证

你可以为 acme.sh 自定义 DNS 提供商钩子脚本，如通过 Vault 的 HTTP 调用写入 TXT 用于验证（或调自己的 DNS API）。

也可以通过手动方式，如：

```bash
acme.sh --issue \
    --server  https://acmeproxy.dev.local/acme/directory \
    -d nginx.dev.local \
    --standalone \
    --httpport 8081 \
    --cert-file      /etc/nginx/tls.crt \
    --key-file       /etc/nginx/tls.key \
    --fullchain-file /etc/nginx/tls.fullchain.crt \
    --log \
    --run-hook-after-issue /etc/ssl/hooks/deploy.sh
```

 or 使用 DNS 验证（更稳定） 👇

---

## ✅ 配置 `acme.sh --dns` 钩子（推荐）

你创建一个名为：

```bash
~/.acme.sh/dns_myvault.sh
```

写入：

```bash
#!/bin/bash

VAULT_TOKEN=XXXX \
VAULT_ADDR=https://vault.internal:8200 \
vault kv put pki/txt_records/value/domain="${CERT_DOMAIN}/challenge"

sleep 2
```

然后运行：

```bash
acme.sh --issue \
         --server  https://acmeproxy.dev.local/acme/directory \
         -d nginx.dev.local \
         --dns dns_myvault.sh \
         --log
```

---

## 🧾 第五步：签署的证书注入 Nginx ⚙️

你可以使用以下 ACME.sh 命令自动部署：

```bash
acme.sh --install-cert -d nginx.dev.local \
         --cert-file      /etc/nginx/ssl/tls.crt \
         --key-file       /etc/nginx/ssl/tls.key \
         --fullchain-file /etc/nginx/ssl/tls.fullchain.crt \
         --chain-file     /etc/nginx/ssl/tls.chain.pem \
         --reloadcmd     "systemctl reload nginx"
```

你也可以 hook 额外分发逻辑，如：

- SCP 到多个节点
- rsync 到 k8s secret 目录
- 通过 Ansible 动态分发证书

---

## ✅ 配置 Nginx 使用该证书：

```nginx
server {
    listen       443 ssl;
    server_name  nginx.dev.local;

    ssl_certificate     /etc/nginx/ssl/tls.fullchain.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;

    location / {
        root /usr/share/nginx/html;
    }
}
```

你甚至可以 export 出 `.crt` + `.key` 对，部署到 k8s secret 对象中使用：

```bash
kubectl create secret tls tls-connect -n backend-tls \
  --cert=/etc/nginx/ssl/tls.crt \
  --key=/etc/nginx/ssl/tls.key
```

---

# 📌 第六步：全内网信任保证 🔐

你内网中的每台服务器，需要信任 Vault 签发的 CA：

```bash
sudo cp internal-ca.crt /usr/local/share/ca-certificates/internal-ca.crt
sudo update-ca-certificates
```

或者在 Docker 容器启动时注入信任：

```bash
docker run --volume /etc/ssl/certs/internal-ca.crt:/usr/local/share/ca-certificates/internal-ca.crt \
           ubuntu:latest /update-ca-certificates
```

🌟 **完成 TA 部署后，你可以在服务端信任 acme-sh 签发的所有证书。**

---

# ✅ 内网证书需求进阶配置 🧰

| 需求 | 实施建议 |
|------|----------|
| 多平台证书签发（Kubernetes + Nginx + Envoy + gRPC） | Vault + AcmeProxy 支持内建策略（允许某个机器签发） |
| DNSChallenge 手动写入入库 | 可集成 Vault KV backend 写入 DNS 记录备更新 |
| 证书自动刷新 | 使用 acme.sh 定期 `--renew` + Vault 背后 CA Renew |
| 内部 OCSP 响应 | Vault PKI 提供 OCSP 签发接口可模拟证书状态 |
| 证书签发时审计日志 | 使用 Vault 的 audit log 功能记录所有签发请求 |
| IP SAN 验证支持 | Vault 签发时支持 SAN 写入主机 IP，适用于服务发现 |

---

# ✅ 最终 TO-DO 清单

| 部署项 | 已完成 | 说明 |
|--------|--------|------|
| ⚙️ 部署 CoreDNS 解析 internal .dev.local | 😷 | 保证域名可达 |
| 📘 初始化 Vault PKI secrets engine | 🧪 | 加在网络隔离CA |
| 🔐 配置 ACME proxy 服务器用于签发请求 | 🧪 | 利用 smallstep 或自研 ACME 拓扑 |
| 🖱️ 使用 acme.sh 签发证书（> openssl req create /allow SAN） | 🟩 | 支持 SAN、IP、DNS |
| 📦 更新 Nginx 系统使其信任 Vault CA | 备份中 | `update-ca-certificates` |
| 📅 定期刷新证书并自动部署 | 🚀 | 配合 k8s secret + hook 机制自动刷新 |
| 🗂️ Vault 自动 CRL 生成 | ⌛ | 可定期运行 |

---

## 📬 需要我为你提供的终极交付件

如果你要快速上手整个方案，我可以为你生成：

1.✅ Vault + PKI + 策略完整的 `vault-init.hcl` 配置和写入方式

2.✅ acme-proxy 配置模板（结合你想要的 TTL / DNS 模式 / CoreDNS）

3.✅ acme.sh 远程 DNSChallenge 适配 Vault 的钩子脚本封装版 `dns_internal.sh`

4.✅ 完整 Nginx + smallstep 签发的证书的流程封装（`renew.sh`）

5.✅ Tutorials 文档（中文）教程流程图文步骤 💡

---

如你需要，我会为你生成完整结构包，请告诉我是否希望：

- [ ] 生成 Vault 策略完整脚本（HCL 或 Namespace 定义）
- [ ] 需要内网通用证书签发钩子（acme.sh + Vault）
- [ ] 需要 CoreDNS 动态更新规则脚本配合 Vault 验证
- [x] 需要 OCSP / CRL 的生成机制结合推送通知

（我会根据你的勾选生成完整 Zip 模板）😊

随时告诉我你的生产环境角色：运维系统、K8s 集群/okd/Openshift、还是开发调试用环境？