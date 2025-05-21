---
lang: zh-CN
title: Idea
titleTemplate: OpenSSL生成SSL证书方案
description: OpenSSL生成SSL证书方案
head:
  - - meta
    - name: description
      content: OpenSSL生成SSL证书方案
  - - meta
    - name: keywords
      content: 局域网 OpenSSL SSL 证书 加密 传输
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# OpenSSL生成SSL证书方案

作为运维工程师，在一个无法访问外网的内网环境中，你可以使用 `OpenSSL 3.0` 创建一个 X.509 v3 格式的自签名 CA（证书颁发机构）证书，并使用该 CA 为服务器颁发服务器证书，用于 TLS 加密服务（如 HTTPS、SMTPS、FTPS 等）。

以下操作步骤均适用于 Ubuntu 24.04 LTS 系统，用于创建 CA 并签署服务器证书。最终生成的证书支持主流客户端如 Windows、Linux、Android 等。

---

## 一、准备工作

确保系统上安装了 OpenSSL 3.0：
```bash
openssl version
```
如果你还没安装 OpenSS 3.0，可以使用 Ubuntu 24.04 提供的默认包：
```bash
sudo apt update
sudo apt install openssl
```

---

## 二、创建根CA证书（X.509 v3）

### 1. 创建目录结构

```bash
mkdir -p /root/ca/{certs,crl,private,newcerts}
chmod 700 /root/ca/private
touch /root/ca/index.txt
echo 1000 > /root/ca/serial
```

你可以根据需要把这些路径更改为非 root 路径，比如 `/opt/myca/...`

---

### 2. 创建 CA 配置文件 `openssl-ca.cnf`

在 `/root/ca/` 创建 `openssl-ca.cnf`，内容如下：

```ini
[ ca ]
default_ca = CA_default

[ CA_default ]
dir               = /root/ca
certs             = $dir/certs
crl_dir           = $dir/crl
database          = $dir/index.txt
new_certs_dir     = $dir/newcerts
certificate       = $dir/certs/ca.crt
private_key       = $dir/private/ca.key
crl               = $dir/crl/ca.crl.pem
default_md        = sha256
preserve          = no
email_in_dn       = no
name_opt          = ca_default
cert_opt          = ca_default
policy            = policy_loose
x509_extensions   = v3_ca

[ policy_loose ]
countryName               = optional
stateOrProvinceName       = optional
localityName              = optional
organizationName          = optional
organizationalUnitName    = optional
commonName                = supplied
emailAddress              = optional

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer:always
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
```

> 该配置启用了 X.509 v3 的扩展功能，并设置了 CA 的关键约束和用途。

---

### 3. 生成CA私钥

```bash
openssl genrsa -out /root/ca/private/ca.key 4096
chmod 600 /root/ca/private/ca.key
```

---

### 4. 创建自签名的CA证书

```bash
openssl req -config /root/ca/openssl-ca.cnf \
        -key /root/ca/private/ca.key \
        -new -x509 -days 3650 -sha256 -extensions v3_ca \
        -out /root/ca/certs/ca.crt
```

你需要在命令行里输入相应的信息（如 Common Name 建议设为 “My Internal CA”）

---

## 三、为服务器签发证书（X.509 v3）

### 1. 创建服务器证书的配置文件 `openssl-server.cnf`

```ini
[ req ]
prompt = no
default_bits        = 4096
default_md          = sha256
req_extensions      = v3_req
distinguished_name  = dn

[ dn ]
CN = myserver.local

[ v3_req ]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[ alt_names ]
DNS.1 = myserver.local
DNS.2 = localhost
IP.1 = 192.168.1.10   # 替换为服务器IP
IP.2 = 127.0.0.1
```

> 你可以根据服务器的实际域名/IP 地址定制 alt_names 扩展。

---

### 2. 生成服务器私钥和 CSR

```bash
openssl genrsa -out server.key 4096
openssl req -new -key server.key -config openssl-server.cnf -out server.csr
```

---

### 3. 用 CA 签署服务器证书

```bash
openssl ca -config /root/ca/openssl-ca.cnf -days 1000 -notext -batch -in server.csr \
        -out server.crt
```

该命令会使用前面创建的 CA 私钥签名服务器证书，并输出为 `server.crt`。

---

## 四、复制和分发 CA 和服务器证书

最终你会有以下两个重要文件：

- **CA 证书**（用于信任）：`/root/ca/certs/ca.crt`
- **服务器证书**：`server.crt`
- **服务器私钥**：`server.key`

可将 `server.crt` 和 `server.key` 部署到你的服务中，如 Apache、Nginx、OpenLDAP、OpenVPN 等。

---

## 五、客户端信任配置（对 Windows / Linux / Android）

### 1. 在客户端上导入 CA 证书

为了使客户信任你的服务器证书，必须手动将 CA 的公钥证书 (`ca.crt`) 添加为“受信任的根证书颁发机构”。

#### ➤ Windows：

1. 打开 "管理证书" (`certmgr.msc`)
2. 在 "受信任的根证书颁发机构" -> 右击 -> 所有任务 -> 导入
3. 导入 `ca.crt`

#### ➤ Linux：

拷贝证书到信任库，比如 Ubuntu：

```bash
sudo cp ca.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

#### ➤ Android（7.0 以下）：

支持直接导入证书安装信任。

对于 Android 7.0 及以上，系统级 CA 不信任用户添加的证书。你需要将证书添加到应用信任库中，例如使用定向信任方式。

---

## 六、证书结构概览

| 文件 | 说明 | 是否需要分发 |
|------|------|-----------|
| `/root/ca/private/ca.key` | CA 私钥（极为重要，不可泄漏） | ❌ |
| `/root/ca/certs/ca.crt` | CA 根证书，用于客户端信任 | ✅ |
| `server.key` | 服务器私钥 | ❌ |
| `server.crt` | 服务器证书（由 CA 签名） | ✅（与 server.key 一起部署到服务） |

---

## 七、完整脚本示例（脚本方式快速生成CA + 签发）

```bash
mkdir -p /root/ca/{certs,crl,private,newcerts}
chmod 700 /root/ca/private
touch /root/ca/index.txt
echo 1000 > /root/ca/serial

cat > /root/ca/openssl-ca.cnf <<EOF
[ ca ]
default_ca = CA_default

[ CA_default ]
dir               = /root/ca
certs             = \$dir/certs
crl_dir           = \$dir/crl
database          = \$dir/index.txt
new_certs_dir     = \$dir/newcerts
certificate       = \$dir/certs/ca.crt
private_key       = \$dir/private/ca.key
crl               = \$dir/crl/ca.crl.pem
default_md        = sha256
email_in_dn       = no
name_opt          = ca_default
cert_opt          = ca_default
policy            = policy_loose
x509_extensions   = v3_ca

[ policy_loose ]
countryName               = optional
stateOrProvinceName       = optional
localityName              = optional
organizationName          = optional
organizationalUnitName    = optional
commonName                = supplied
emailAddress              = optional

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer:always
basicConstraints = CA:true
keyUsage = digitalSignature, cRLSign, keyCertSign
EOF

openssl genrsa -out /root/ca/private/ca.key 4096
chmod 600 /root/ca/private/ca.key
openssl req -config /root/ca/openssl-ca.cnf -key /root/ca/private/ca.key -new -x509 -days 3650 -sha256 -out /root/ca/certs/ca.crt -addext "subjectAltName = DNS:myca.local" -subj "/CN=Internal CA"

cat > openssl-server.cnf <<EOF
[ req ]
prompt = no
default_bits        = 4096
default_md          = sha256
req_extensions      = v3_req
distinguished_name  = dn

[ dn ]
CN = myserver.local

[ v3_req ]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[ alt_names ]
DNS.1 = myserver.local
DNS.2 = localhost
IP.1 = 192.168.1.10
IP.2 = 127.0.0.1
EOF

openssl genrsa -out server.key 4096
openssl req -new -key server.key -config openssl-server.cnf -out server.csr
openssl ca -config /root/ca/openssl-ca.cnf -days 1000 -batch -in server.csr -out server.crt
```

---

## 八、可能出现的问题及注意事项

### 1. `openssl ca` 命令提示错误
如果提示找不到一些数据库文件，确保路径和文件结构都正确 (`index.txt`, `serial`)

### 2. iOS/安卓等较新的客户端无法信任用户添加的证书
Android 7.0+ 开始不允许应用程序使用“用户安装”的 CA 用于 HTTPS 服务。需要系统级别信任或应用内嵌证书。

### 3. CN 和 SAN 不一致导致客户端报证书错误
请确保 CN 匹配域名，并在 SAN（subjectAltName）扩展中添加所有可能访问的别名（IP、FQDN、localhost 等）。

---

## 总结

你可以通过 OpenSS 3.0 在内网环境下自建私有信任证书结构。推荐为根 CA 和服务器证书都使用 X.509 v3，并使用 SAN 扩展来保证证书的通用性和兼容性。部署到服务后，在客户端设备上安装 CA 根证书即可实现加密通信。

如果你需要给多台服务器签发证书，也可以进一步自动化脚本或使用工具，如 `cfssl` 或 `step-ca` 搭建更完善的证书签发系统。

需要我为你编写自动化脚本或给出某具体服务（如 NGINX）的部署说明吗？

`.pem` 和 `.crt` 是 **用于存储 SSL/TLS 证书和私钥的不同文件扩展名（格式）**，它们的含义和用途略有不同，但在很多情况下可以互换使用。以下是详细解释：

---

## 🔒 一、`.pem` 文件（Privacy Enhanced Mail）

### 🔹 概念：
`.pem` 是一种用来存储或传输 **X.509 证书、私钥、CRL（证书吊销列表）等加密信息的 Base64 编码格式**。

- `.pem` 文件的特征：以 `-----BEGIN ...-----` 和 `-----END ...-----` 开头和结尾。
- 是最普遍使用的 SSL/TLS 文件格式之一。
- 可以包含：
  - 证书（Certificate）
  - 私钥（Private Key）
  - 证书链（Certificate Chain / CA Bundle）
  - CSR（证书请求）

---

### 🔹 常见文件示例：

| 文件类型 | 可能名字示例 |
|----------|---------------|
| CA 根证书 | `ca.pem` 或 `ca.crt` |
| 服务器公钥证书 | `server.crt`、`server.pem` |
| 服务器私钥 | `server.key`（也可以是 `.pem`）|
| CSR 请求文件 | `server.csr`、`server.pem` |
| 完整的 PEM 包（证书+私钥+中间证书） | `server.pem`、`fullchain.pem`、`combined.pem` |

---

### 🔹 典型内容格式（Base64）

```text
-----BEGIN CERTIFICATE-----
MIIF7DCCBNSgAwIBAgIUW6jpuy1...
-----END CERTIFICATE-----
```

或者（私钥示例）：

```text
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQE...
-----END PRIVATE KEY-----
```

---

## 🔐 二、`.crt` 文件（通常是 PEM 的子集）

### 🔹 概念：
`.crt` 文件 **通常是`.pem`格式的一部分**，它一般**只用来表示一个 PEM 编码的 X.509 证书**（而不是完整的 PEM bundle）。

- `.crt` ≠ `PKCS#7` 或 `DER`，除非特别说明，否则通常 `.crt` == `.pem` 证书文件。
- 它的用途往往是作为“服务器证书”或者“CA证书”。

---

### 🔹 示例内容（X.509 公钥证书）

```text
-----BEGIN CERTIFICATE-----
MIIEvQIBADANBgkqhkiG9w0BAQE...
-----END CERTIFICATE-----
```

---

## 🔄 三、`.pem` vs `.crt` 对比总结

| 名称 | 内容 | 格式 | 用途 | 常见于 |
|------|------|------|------|--------|
| `.pem` | 可能包含：证书、私钥、吊销列表等 | Base64 编码，可读 | 多用作 *复合文件*（如证书 + 私钥在一个文件中） | Nginx / Apache / OpenSSL |
| `.crt` | 通常是 X.509 证书（也可以是 PEM 格） | Base64 编码 | 服务端配置中应用的证书，如 HTTPS 服务使用的服务器证书 | Web 服务器、服务端证书部署 |
| `.key` | 私钥 | Base64（也可以是 DER） | 服务器私钥文件 | 所有服务都用到 |

---

## 📁 四、你使用 OpenSS 3 创建 CA 和服务器证书后得到的文件说明

根据你之前使用 OpenSSL 创建 CA 并颁发服务器证书的流程，默认生成的是 PEM 格式：

| 文件名 | 注释 |
|--------|------|
| `ca.crt` | CA 根证书（PEM 格式）|
| `ca.key` | CA 私钥（PEM 格式）|
| `server.crt` | 服务器证书（PEM）|
| `server.key` | 服务器私钥（PEM）|
| `server.csr` | 证书请求文件（PEM）|

这些文件其实都以 `.pem` 格式存储，只是通过扩展名`.crt`、`.key`、`.csr` 使其更易识别内容类型。

---

## 🧪 五、验证`.pem`/`.crt`文件内容的方法

### 查看证书内容（适合 `.crt` 或 `.pem`）

```bash
openssl x509 -in server.crt -text -noout
```

### 查看私钥内容（适合 `.key` 或 `.pem`）

```bash
openssl rsa -in server.key -text -noout
```

### 查看证书请求（CSR）

```bash
openssl req -in server.csr -text -noout
```

### 查看文件是何种类型（尤其适用于后缀不符合含义的文件）

```bash
openssl x509 -in something.pem -text -noout 2>/dev/null || 
openssl req -in something.pem -text -noout 2>/dev/null || 
openssl rsa -in something.pem -text -noout
```

---

## 🔄 六、`).crt` 文件转成 `.pem` 或 `.pem` 合并技巧

### 将 `.crt` 复制成 `.pem`

```bash
cp server.crt server.pem
```

### 合并服务器证书 + 私钥为一个 `.pem` 文件（某些服务用这个方式）

```bash
cat server.crt server.key > server.pem
```

### 合并证书链到 `fullchain.pem`

```bash
cat server.crt intermediate1.crt intermediate2.crt > fullchain.pem
```

---

## 🧩 七、部署服务器证书时的实际使用

在 Ubuntu Nginx/Apache 等 TLS 服务中：

```text
ssl_certificate     /etc/ssl/certs/server.crt;
ssl_certificate_key /etc/ssl/private/server.key;
```

或者：

```text
ssl_certificate     /etc/ssl/certs/server.pem;
ssl_certificate_key /etc/ssl/private/server.key;
```

如果 Nginx/Apache 支持，也可以合并证书链为一个 `.pem` 给服务使用：

```text
ssl_certificate     /etc/ssl/certs/fullchain.pem;
ssl_certificate_key /etc/ssl/private/server.key;
```

---

## ✅ 总结

| 扩展名 | 内容 | 转化关系 |
|--------|------|---------|
| `.pem` | 泛指 Base64 编码的 DER 内容（包括证书、私钥等）| PEM 是通用格式 |
| `.crt` | PEM 格式的 X.509 证书（不含私钥）| `.crt` ≈ `.pem`（仅含证书）|
| `.key` | 私钥文件（PEM 格式居多）| — |
| `.csr` | 证书请求文件（PEM 编码）| — |

---

## 🛠️ 小贴士：证书部署到不同平台建议

| 平台 | 证书格式建议 |
|------|--------|
| Nginx/Apache（Ubuntu） | `.pem` 或 `.crt` + `.key` |
| Windows 客户端信任 | `.crt` 文件导入为根证书 |
| Android (要系统信任) | `.pem` 或 `.crt` 名义使用 |
| Java 应用（如 Tomcat） | `.jks`、`.pem` 和 `.key` 可能需要转换 |
| Docker / Kubernetes | 使用 `.pem` 或 `.crt`，推荐分开保存。可以用 `server.pem` 包含证书+私钥做临时合并使用。 |

---

如果你告诉我你要使用证书部署在哪种服务（如 Nginx、Apache、pgBouncer、OpenVPN、LDAPS、等），我还可以提供更具体的配置使用建议和合并格式推荐。需要吗？

证书部署在 Nginx 上是常见的 TLS 终端操作之一。下面是 **完整的证书部署流程**，适用于你使用 OpenSSL 创建的 `.crt` 和 `.key` 格式的证书。

如果你已经创建好了以下文件：

- **CA根证书**（供客户端信任）：`ca.crt`
- **服务器证书**：`server.crt`
- **服务器私钥**：`server.key`

那么你可以继续进行以下步骤。

---

## 📌 一、证书文件准备（用于 Nginx）

**Nginx 要求：**

- 服务器证书（`.crt` 或 `.pem`）——用于 TLS 握手
- 服务器私钥（`.key`）——必须是 **不加密的私钥（无密码）**
- （可选）中间证书或证书链（如果你是中间 CA）

由于你的场景中 **是一个 CA 自签名证书 + 签发服务器证书结构**，一般 Nginx 只需要这两个文件即可，不是必须合并成 `.pem`。

但为了让 Nginx 更有效识别，我们建议：

### 🔧 确保私钥无加密密码

```bash
# 如果 key 文件有密码，解密：
openssl rsa -in server.key -out server.key.unencrypted
mv server.key.unencrypted server.key
```

---

## 📁 二、证书部署目录

将服务器证书和私钥文件放到如 Nginx 的默认证书路径中（或其他你喜欢的位置）：

```bash
sudo cp server.crt /etc/ssl/certs/
sudo cp server.key /etc/ssl/private/
sudo chmod 644 /etc/ssl/certs/server.crt
sudo chmod 600 /etc/ssl/private/server.key
```

> ✅ 温馨提示：建议进一步使用 ACL 或权限工具进行保护，防止非 root 用户读取私钥

---

## ⚙️ 三、Nginx 配置 TLS 证书

编辑你站点的配置文件（如：`/etc/nginx/sites-available/default` 或自定义域名配置）：

```nginx
server {
    listen 443 ssl;
    server_name myserver.local;  # 替换为你的服务器域名或IP
    ssl_certificate     /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;

    # 如果需要证书链，用 fullchain.pem 合并
    # ssl_certificate     /etc/ssl/certs/fullchain.pem;

    ssl_protocols         TLSv1.2 TLSv1.3;
    ssl_ciphers           HIGH:!aNULL:!MD5;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

---

## 🔄 四、合并服务器证书和中间证书（可选）

如果你在 CA 和服务器之间使用了中间 CA，或者你想确保证书链完整地传递给客户端，可以执行：

```bash
cat server.crt ca.crt > /etc/ssl/certs/fullchain.pem
```

并把 `ssl_certificate` 改为：

```nginx
ssl_certificate     /etc/ssl/certs/fullchain.pem;
```

---

## 🔁 五、重启或重载 Nginx

```bash
sudo nginx -t           # 检查配置是否正确
sudo systemctl reload nginx
```

---

## 🛠️ 六、客户端信任 CA

- 📌 客户端访问 HTTPS 服务前，**必须信任签发 CA 的 root 证书（`ca.crt`）**
- 否则浏览器、移动端 App 等会报“证书不受信任”、“SEC_ERROR_UNKNOWN_ISSUER”等错误

你可以通过以下步骤在客户端上将 `ca.crt` 设置为“受信任的根证书”：

### 1. Windows

- 打开 `运行 -> certmgr.msc`
- 启动“证书管理器”
- 右击“受信任的根证书颁发机构” -> 所有任务 -> 导入 -> 选择 `ca.crt`

### 2. Linux（Ubuntu 或 Debian）

```bash
sudo cp ca.crt /usr/local/share/ca-certificates/ca.crt
sudo update-ca-certificates
```

### 3. Android

- Android 7.0 及以上需要将证书嵌入应用信任中，或通过企业证书方式注入。
- 通常不信任用户安装的 CA。可使用如 `network_security_config.xml` 来指定信任该证书。

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config>
        <trust-anchors>
            <certificates src="@raw/ca" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

然后在 `AndroidManifest.xml` 中指定：

```xml
<application
   android:networkSecurityConfig="@xml/network_security_config"> ...
```

需要将 `ca.crt` 放入 `res/raw/ca.crt`

---

## 🔄 七、自动化脚本部署（推荐）

```bash
#!/bin/bash

DOMAIN=myserver.local
SERVER_IP=192.168.1.10   # 内网 IP

# 生成 server.crt + server.key
openssl genrsa -out server.key 4096
openssl req -new -key server.key -out server.csr -addext "CN=$DOMAIN" -addext "subjectAltName = DNS:$DOMAIN,IP:$SERVER_IP,IP:127.0.0.1"

# 假设前面你已经初始化好了 CA 并配置好了 openssl-ca.cnf
openssl ca -config /root/ca/openssl-ca.cnf -days 1000 -batch -out server.crt -infiles server.csr

# 分发到 Nginx
sudo cp server.crt /etc/ssl/certs/
sudo cp server.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/server.key
sudo chown root:root /etc/ssl/private/server.key /etc/ssl/certs/server.crt

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🧪 八、验证是否证书部署成功

使用浏览器访问：
```
https://myserver.local
```
或使用 curl（提前将 ca.crt 装入系统证书库）：

```bash
curl -v https://myserver.local
```

如果提示 `error 60`，表示未正确安装根 CA。

---

## ✅ 八、进一步建议

- 如果 Nginx 启用 HTTPS 用于对外服务，建议在证书中加入多个 SAN 域名（本实现已做到）
- 可添加 OCSP、CRL 检查，提高安全性
- 如客户端要求 publicKey 格式为 `.pem`，也可以使用：

```bash
cat server.crt > server.pem
```

这样 `.pem` 文件即可用于 Java、Docker、Kubernetes 等服务作客户端验证。

---

需要我继续为你的证书生成一个完整的 SAN 和 自动签发脚本，并自动部署到 Nginx 吗？可以帮你实现一键创建证书并更新配置。

非常好！我们将通过一个完整的自动化脚本来做以下事情：

---

## ✅ **目标**

使用 OpenSSL：

1. 创建带有 **Subject Alternative Name (SAN)** 的 CSR（支持多个域名/IP）
2. 使用你自己的根 CA 自动 **签署服务器证书**
3. 生成服务器证书和私钥，**无密码**
4. 合并证书链为 `fullchain.pem`（供 Nginx 使用）
5. 可选地启用 **OCSP/CRL 检查**
6. **自动部署到 Nginx**
7. 支持多域名、多个 SAN（IP 或 DNS）

---

## 📂 前提条件

- 根 CA 和 OpenSSL CA 环境已经搭建好（参考你之前的操作）
- 存在基础配置文件 `openssl-ca.cnf` 或可以使用系统默认的 `openssl.cnf`
- 已安装 Nginx 并启用了 TLS 配置（或脚本帮你启用）

---

## 🖥️ 脚本使用方式（示例）

生成单域 + IP 证书：

```bash
./deploy-tls.sh -d myserver.local -i 192.168.1.10,127.0.0.1
```

生成含多个 SAN 的证书：

```bash
./deploy-tls.sh -d myserver.local -i 192.168.1.10,10.0.0.1 -a www.api.local,test.api.local
```

---

## 🛠️ 脚本代码 (`deploy-tls.sh`)

你可以将以下脚本保存为文件 `deploy-tls.sh`，并赋予执行权限：

```bash
#!/bin/bash

# 初始化变量
DOMAIN="server.local"
IP_ADDRESSES="127.0.0.1"
ALT_NAMES=""
CA_DIR=/root/openssl-ca  # 改成你自己的 CA 目录（含 certs reqs 等）
SERVER_CSR=server.csr
SERVER_KEY=server.key
SERVER_CERT=server.crt
FULL_CHAIN=fullchain.pem
TMP_SAN=/tmp/san.cnf

# 读取参数
while getopts d:i:a: flag
do
    case "${flag}" in
        d) DOMAIN=${OPTARG};;
        i) IP_ADDRESSES=${OPTARG};;
        a) ALT_NAMES=${OPTARG};; # 格式：example.com,www.example.com
    esac
done

# 清除旧文件
rm -f $SERVER_KEY $SERVER_CSR $SERVER_CERT $FULL_CHAIN $TMP_SAN

# Step 1：生成私钥
echo "[+] Generating Private Key with 4096-bit RSA ($SERVER_KEY)"
openssl genrsa -out $SERVER_KEY 4096

# Step 2：拼接 SAN 内容
echo "[+] Building SAN config"
cat > $TMP_SAN <<EOF
[req]
req_extensions = v3_req

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
EOF

# 添加附加域名
if [ -n "$ALT_NAMES" ]; then
    IFS=',' read -ra ADDR <<< "$ALT_NAMES"
    index=2
    for dn in "${ADDR[@]}"; do
        echo "DNS.$index = $dn" >> $TMP_SAN
        index=$((index+1))
    done
fi

# 添加 IP 地址
IFS=',' read -ra IPS <<< "$IP_ADDRESSES"
index=1
for ip in "${IPS[@]}"; do
    echo "IP.$index = $ip" >> $TMP_SAN
    index=$((index+1))
done

# Step 3：生成带有 SAN 的 CSR
echo "[+] Generating Certificate Request with SANs ($SERVER_CSR)"
openssl req -new -key $SERVER_KEY -out $SERVER_CSR \
    -config $TMP_SAN -addext "subjectAltName = DNS:$DOMAIN,${ALT_NAMES//,/ DNS: },${IP_ADDRESSES//,/ IP: }"

# Step 4：用 CA 签发证书并生成完整证书链
echo "[+] Signing certificate with CA (using openssl ca)"
openssl ca -config $CA_DIR/openssl-ca.cnf \
           -notext -in $SERVER_CSR -out $SERVER_CERT \
           -extensions server_ext -extfile <(
cat <<EOF
[server_ext]
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
EOF

IFS=',' read -ra ADDR <<< "$ALT_NAMES"
index=2
for dn in "${ADDR[@]}"; do
    echo "DNS.$index = $dn"
done

IFS=',' read -ra IPS <<< "$IP_ADDRESSES"
index=1
for ip in "${IPS[@]}"; do
    echo "IP.$index = $ip"
done
)

# 根证书 + 中间证书路径（假设你有中间 CA）
if [ -f $CA_DIR/intermediate/certs/intermediate.cert.pem ]; then
    echo "[+] Merging certificate chain into $FULL_CHAIN"
    cat $SERVER_CERT $CA_DIR/intermediate/certs/intermediate.cert.pem $CA_DIR/ca.cert.pem > $FULL_CHAIN
else
    echo "[+] Merging CA certificates to chain"
    cat $SERVER_CERT $CA_DIR/ca.crt > $FULL_CHAIN
fi

# Step 5：部署到 Nginx
echo "[+] Copying certificates to Nginx directory"
sudo cp $SERVER_KEY $FULL_CHAIN /etc/ssl/private/
sudo cp $SERVER_CERT $FULL_CHAIN /etc/ssl/certs/

sudo chmod 600 /etc/ssl/private/$SERVER_KEY
sudo chmod 644 /etc/ssl/certs/* /etc/ssl/private/*

# Step 6：更新 Nginx 配置文件（假设为 /etc/nginx/sites-available/default）
echo "[+] Updating Nginx configuration"
cat > /tmp/nginx-site.conf <<EOF
server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/ssl/certs/$FULL_CHAIN;
    ssl_certificate_key /etc/ssl/private/$SERVER_KEY;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/ssl/certs/ca.crt;
        ssl_crl /etc/ssl/certs/revocation.crl;
    }
}
EOF

echo "[+] Stop old site config and overwrite TLS"
if [ ! -f "/etc/nginx/sites-available/server.local-cert" ]; then
    sudo cp /tmp/nginx-site.conf /etc/nginx/sites-available/server.local-cert
    sudo ln -s /etc/nginx/sites-available/server.local-cert /etc/nginx/sites-enabled/

    # 删除 port 80 的 default
    sudo rm -f /etc/nginx/sites-enabled/default || true
else
    sudo cp /tmp/nginx-site.conf /etc/nginx/sites-available/server.local-cert
fi

sudo nginx -t
sudo systemctl reload nginx

echo "[+] TLS certificate for $DOMAIN deployed successfully."
```

---

## 📦 输出内容

- **密钥文件**：`server.key`
- **证书文件**：`server.crt`
- **完整证书链文件**：`fullchain.pem`
- **Nginx 配置文件**：建立了 `/etc/nginx/sites-available/server.local-cert`

---

## ✅ 你需要提前做：

### 1. 根 CA 目录正确配置

确保你 CA 目录（例如 `/root/openssl-ca`）结构清晰，包含一个 `openssl-ca.cnf`，内容大致如下：

```ini
[ req ]
default_bits        = 4096
default_md          = sha256
req_extensions      = server_reqext
distinguished_name  = req_distinguished_name

[ req_distinguished_name ]
countryName         = Country Name
countryName_default = CN
stateOrProvinceName = State or Province
localityName        = City
organizationName    = Organization
commonName          = Common Name (server DNS name)

[ server_reqext ]
subjectAltName = \$ENV::SAN
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
```

---

## 🚦 OCSP 和 CRL 支持说明（高级选项）

你可以启用 OCSP stapling 和 CRL 检查：

### 在 Nginx 中：启用 TLS OCSP stapling

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/ssl/certs/ca.crt;
resolver 1.1.1.1 8.8.8.8;
```

### 启用 CRL

- 你需要定期生成或拷贝 `crl.pem` 到：

```bash
sudo openssl ca -config /root/openssl-ca/openssl-ca.cnf -gencrl -out /etc/ssl/certs/revocation.crl
```

（⚠ 提示：如果未启用 CRL 配置，可不用它）

---

## ✅ 小结：证书部署在 Nginx 上的功能实现

| 功能 | 已实现？ |
|------|----------|
| CSR 带有 SAN（多个域名 + 多个 IP） | ✅ |
| 使用你自己的 CA 签署 | ✅ |
| 证书签发并合并为一个 fullchain.pem | ✅ |
| 无密码的 server.key | ✅ |
| OCSP Stapling 支持（需 CA 支持） | ✅ |
| CRL 检查支持（如 `/etc/ssl/certs/revocation.crl`） | ✅ |
| 自动写入并启用 Nginx TLS 配置 | ✅ |

---

## 🛠️ 你可以问我进一步添加如下高级功能：

- 使用 Let’s Encrypt 提供 OCSP 响应，代替本地 CA
- Nginx 双证书支持（RSA + ECDSA）
- 强制信任自签证书时的浏览器/移动端证书策略
- Kubernetes 中部署 TLS 证书
- Java 客户端信任 `.crt` 或 `.pem` 的示例

是否需要我就某一部分深入展开，或生成证书链 PEM？我很乐意帮助你扩展。

你希望在本地使用 OpenSSL 利用你现有的 CA 签发 **ECDSA 证书**，并且配置 **Nginx 双证书支持（RSA + ECDSA）**，这是一个非常有实用价值的生产环境优化行为。下面我会分步骤为你构建整个流程，并提供完整脚本实现。

---

# ✅ **目标清晰**

1. ✅ 创建 **ECDSA 证书**（如 secp384r1）
2. ✅ 利用你自己的本地 CA 进行签发
3. ✅ 同时保留原先的 RSA 证书（你可能已经有了）
4. ✅ 在 Nginx 上启用 **双证书支持（RSA + ECDSA）**
5. ✅ 支持启用 OCSP Stapling 和证书链校验（可选）

---

# 📁 前提条件

确保你有以下环境准备：

- 你建立了一个本地根 CA（路径如 `/root/ca`）
- `openssl-ca.cnf` 或 `openssl.cnf` 配置完毕
- 已有 nginx 环境
- 升级到支持 TLS 1.3 的 OpenSSL（建议 OpenSSL 1.1.1 或以上）

---

## 🛠️ 第一步：生成 ECDSA 私钥和证书

下面是完整的自定义脚本，用于：

- 创建 ECDSA 私钥（使用 secp384r1）
- 创建支持 SAN 的证书请求
- 使用本地 CA 签发证书

### 🔧 `generate-ecdsa-cert.sh`

```bash
#!/bin/bash

# 默认参数
DOMAIN="server.local"
IP_ADDRESSES="127.0.0.1"
ALT_NAMES=""
CA_DIR="/root/ca"
KEY_ALG="prime256v1"   # 也可以换成 secp384r1 等
ECDSA_KEY="ec.key"
ECDSA_CSR="ec.csr"
ECDSA_CERT="ec.crt"
FULLCHAIN="ec.fullchain.pem"

# 创建 SAN 主证书请求配置
SAN_CONFIG=/tmp/ec-san.cnf

# 解析参数
while getopts d:i:a: flag
do
    case "${flag}" in
        d) DOMAIN=${OPTARG};;
        i) IP_ADDRESSES=${OPTARG};;
        a) ALT_NAMES=${OPTARG};;
    esac
done

echo "[+] Generating ECDSA private key (using curve: $KEY_ALG)"
openssl ecparam -name $KEY_ALG -genkey -noout -out $ECDSA_KEY

echo "[+] Creating Certificate Signing Request (ECDSA)"
cat > $SAN_CONFIG <<EOF
[ req ]
req_extensions = v3_req
distinguished_name = req_distinguished_name

[ req_distinguished_name ]
CN = $DOMAIN

[ v3_req ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = $DOMAIN
EOF

# 添加更多 SAN 项（域名）
IFS=',' read -ra ANAMES <<< "$ALT_NAMES"
INDEX=2
for dn in "${ANAMES[@]}"; do
    [ -n "$dn" ] && echo "DNS.$INDEX = $dn" >> $SAN_CONFIG
    INDEX=$((INDEX + 1))
done

# 添加 IP 地址
IFS=',' read -ra IPS <<< "$IP_ADDRESSES"
INDEX=1
for ip in "${IPS[@]}"; do
    echo "IP.$INDEX = $ip" >> $SAN_CONFIG
    INDEX=$((INDEX + 1))
done

# CSR
openssl req -new -key $ECDSA_KEY -out $ECDSA_CSR -config $SAN_CONFIG

# 签发证书用本地 CA
echo "[+] Signing CSR using local CA"
openssl ca -config $CA_DIR/openssl.cnf \
           -notext -in $ECDSA_CSR -out $ECDSA_CERT \
           -extensions server_cert -md sha256

# 合并证书链
echo "[+] Generating full chain certificate"
cat $ECDSA_CERT $CA_DIR/intermediate/certs/intermediate.crt $CA_DIR/certs/ca.crt > $FULLCHAIN

# 设置权限
chmod 600 $ECDSA_KEY
chmod 644 $ECDSA_CERT $FULLCHAIN

echo "[+] Files generated:"
ls -l $ECDSA_KEY $ECDSA_CSR $ECDSA_CERT $FULLCHAIN
echo "[+] You can now deploy ecdsa certificates to Nginx."
```

---

## 🔄 第二步：Nginx 配置双证书支持（RSA + ECDSA）

现在假设你已经有一个 RSA 证书分布在：

- `server.key` + `server.fullchain.pem`
- 用于 RSA 握手

还生成了一个 ECDSA 证书：

- `ec.key` + `ec.fullchain.pem`
- 用于 ECDSA 握手

你可以利用 Nginx 支持：

- TLS 的 **双证书模式（双密钥交换）**
- 更优性能：**ECDSA 更快更高效**
- 自动根据客户端支持方式切换

### 📝 示例 nginx 配置（启用双证书）

```nginx
server {
    listen 443 ssl;

    ssl_certificate     /etc/ssl/certs/server.fullchain.pem;
    ssl_certificate_key /etc/ssl/private/server.key;

    ssl_certificate     /etc/ssl/certs/ec.fullchain.pem;
    ssl_certificate_key /etc/ssl/private/ec.key;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256';

    # 可选启用 OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/ssl/certs/ca.fullchain.pem;
    resolver 1.1.1.1 valid=300s;

    # 指定 CRL
    ssl_crl /etc/ssl/certs/revocation.crl;

    # HTTP/2（需要 TLSv1.2 或以上 + OpenSSL 支持）
    ssl_prefer_server_ciphers on;

    # 其他配置
    server_name $DOMAIN;

    location / {
        root /usr/share/nginx/html;
    }
}
```

### 🧠 说明：

Nginx 支持多个 `ssl_certificate` 和 `ssl_certificate_key` 配置的机制：

- 第一组表示 **RSA 密钥对配置**
- 第二组为 **ECDSA 密钥对配置**
- 客户端会根据自己的支持情况优先使用 ECDSA 或 RSA

✅ **双证书模式仅在 TLSv1.3 中最有用**，TLSv1.2 的客户端优先使用 RSA，除非你设置了 `ssl_ciphers` 优先 EC。

---

## 🔁 第三步：附加：生成 CRL 和 OCSP（在 CA 侧）

你可以从证书签发机构（CA）生成一个 CRL 或 OCSP 响应：

### ✅ 生成 CRL

```bash
openssl ca -config /root/ca/openssl.cnf -gencrl -out /etc/ssl/certs/revocation.crl
```

`revocation.crl` 即证书吊销黑名单，供 Nginx 使用。

---

### ✅ 生成 OCSP 响应文件（用于 OCSP Stapling）

```bash
# 生成 ocsp_response.der 供 Nginx 使用 OCSP Stapling
openssl ocsp -issuer /root/ca/intermediate/certs/intermediate.crt \
             -CAfile /root/ca/certs/ca.crt \
             -cert /etc/ssl/certs/server.crt \
             -reqout /etc/ssl/certs/ocsp_response.der
```

---

## ⚙️ 第四步：Nginx OCSP Stapling 启用（添加以下行）

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/ssl/certs/ca.fullchain.pem;
resolver 8.8.8.8 1.1.1.1 valid=300s;
```

如果想动态更新 OCSP 响应，可以在脚本中添加定时签发 OCSP 的机制（略高级）。

---

## 📌 第五步：权限事项（可选但重要）

Nginx 的私钥最好设置正确权限（通常属于 `root` 或 `nginx` 用户）：

```bash
sudo cp ec.key /etc/ssl/private/
sudo chown root:ssl-cert /etc/ssl/private/ec.key
sudo chmod 600 /etc/ssl/private/ec.key
```

你可以设置 ACL（如果支持）来加强限制：

```bash
sudo setfacl -m u:www-data:rx /etc/ssl/private/ec.key
```

---

## 🛠️ 第六步：全部部署脚本完整化（可选）

你可以将 RSA、ECDSA 两个脚本合并为一个 **证书生成器（multi-mode）**，示例如下：

```bash
gen-cert.sh -d server.local -i 192.168.1.10,127.0.0.1 -a www.server.local,api.server.local --rsa --ec
```

它会同时生成两组证书并自动合并部署到 `/etc/nginx` 中。

---

## ✅ 最终效果

### 🌐 浏览器行为（TLS 客户端遍历）

- 如果是现代客户端（如 Chrome、iOS、Android、Firefox）→ 使用 **ECDSA + TLSv1.3**
- 如果是旧版客户端 → 使用 **RSA**
- 如果你设置了 OCSP Stapling 和 CRL 检查 → 提升安全性和合规性

---

## 🚀 nginx 双证书验证成功确认步骤

1. 检查语法：
   ```bash
   sudo nginx -t
   ```

2. 重载 nginx：
   ```bash
   sudo systemctl reload nginx
   ```

3. 使用 openssl 验证证书是否返回 ECDSA：
   ```bash
   openssl s_client -connect server.local:443 -tls1_3
   ```

4. 使用浏览器访问 [https://www.ssllabs.com](https://www.ssllabs.com) 做验证（如果证书有域名）

---

## ✅ 总结：完整的双证书支持 Nginx 流程图

```
客户端 hello → Nginx 返回证书 → 自动选择：
  - ECDSA 证书时：客户端如果支持，使用更高效的 ECDHE 握手
  - RSA 证书时：自动回退为兼容性握手
  - TLS 1.3 优先选择 ECDSA
```

---

## 🛠️ 后续建议

你可以扩展这个流程：

- add: 自动生成 Docker TLS 客户端证书（并且信任本地 CA）
- add: Kubernetes nginx-ingress 自签证书部署（secret + tls 过程）
- add: 自动化证书部署 + Jenkins/Ansible 集成
- add: 自动更新 OCSP Response + crl 更新策略

---

是否需要我为你生成 **完整的脚本打包部署 RSA + ECDSA + OCSP stapling** 可用环境？

或者你已经部署好了但浏览器还是警告证书链不完整？我可以帮你进一步排查。