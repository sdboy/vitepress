---
lang: zh-CN
title: Kit
titleTemplate: linux下安装fnm管理Nodejs版本
description: linux下安装fnm管理Nodejs版本
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: linux fnm Nodejs
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# linux下安装fnm管理Nodejs版本

首先确保curl和unzip已安装

## 安装fnm

```sh
$ curl -fsSL https://fnm.vercel.app/install | bash
```

使环境变量生效
```sh
$ source ~/.bashrc
```

验证安装
```sh
$ fnm --version
```

## 更新fnm

```sh
$ curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell
```




