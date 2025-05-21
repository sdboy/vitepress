---
lang: zh-CN
title: Idea
titleTemplate: 局域网基于OpenSSL生成SSL证书实现加密传输
description: 局域网基于OpenSSL生成SSL证书实现加密传输
head:
  - - meta
    - name: description
      content: hello
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
# 局域网基于OpenSSL生成SSL证书实现加密传输

有时我们需要将局域网内的服务器进行加密传输，那么我们可以使用OpenSSL来生成SSL证书，然后使用HTTPS协议进行传输。

基本环境：Ubuntu 24.04 LTS，OpenSSL 3.0.13

## 制作证书

### 生成密钥对

创建一个目录，保存密钥文件。
```bash
$  mkdir LanCA
$  cd LanCA
```

通过RSA算法生成长度为2048位的密钥，并保存为`LanCA.key`文件。
```bash
$  openssl genrsa -out LanCA.key 2048
```

通过秘钥加密机构信息形成公钥，有效期为365天，并保存为`LanCA.crt`文件。
```bash {1,9-15}
$  openssl req -new -x509 -key LanCA.key -out LanCA.crt -days 365
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN # 国家代码
State or Province Name (full name) [Some-State]:Zhejiang # 省
Locality Name (eg, city) []:Hangzhou # 市
Organization Name (eg, company) [Internet Widgits Pty Ltd]:EUQI # 组织名称
Organizational Unit Name (eg, section) []:EUQI # 组织部门名称
Common Name (e.g. server FQDN or YOUR name) []:euqi.net # 组织域名
Email Address []:xxx@163.com # 邮箱
```

### 生成服务器证书

