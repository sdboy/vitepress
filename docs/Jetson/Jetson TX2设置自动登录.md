---
lang: zh-CN
title: Jetson
titleTemplate: Jetson TX2设置自动登录
description: Jetson TX2设置自动登录
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: jetson TX2 VNC 自动 登录 SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: false
footer: true
---
# Jetson TX2设置自动登录

## 设置自动登录

编辑系统配置文件:
```sh
$ sudo vi /etc/gdm3/custom.conf
```

添加以下内容:
```sh
AutomaticLoginEnable = true
AutomaticLogin = ubuntu #ubuntu是用户名，可自行更改为自己的
```

保存后重启系统。