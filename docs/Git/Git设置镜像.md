---
lang: zh-CN
title: Git
titleTemplate: 设置镜像
description: 设置镜像
head:
  - - meta
    - name: description
      content: 设置镜像
  - - meta
    - name: keywords
      content: git 镜像 SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: false
footer: true
---
# Git设置镜像

Git的镜像设置，可以加速Git的访问速度，提高Git的效率。

## 镜像设置

网上搜索能用的镜像源，在终端中执行如下命令：
```sh
$ git config --global url."https://bgithub.xyz/".insteadOf https://github.com/
```

查看是否设置成功：
```sh
$ git config --global --list
url.https://bgithub.xyz/.insteadof=https://github.com/
```

如果想要取消镜像设置，执行如下命令：
```sh
$ git config --global --unset url."https://bgithub.xyz/".insteadOf
```

> [!NOTE]
> `https://bgithub.xyz/`是镜像源的网址，请根据实际情况修改。
