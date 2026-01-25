---
lang: zh-CN
title: Nx
titleTemplate: 使用PNPM工作区设置Monorepo，并通过Nx加速开发vue3
description: 使用PNPM工作区设置Monorepo，并通过Nx加速开发vue3
head:
  - - meta
    - name: description
      content: 使用PNPM工作区设置Monorepo，并通过Nx加速开发vue3
  - - meta
    - name: keywords
      content: pnpm nx monorepo workspace vue3
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---

# 使用PNPM工作区设置Monorepo，并通过Nx加速开发vue3！

本文将深入探讨如何使用PNPM工作区搭建新的单仓库，该仓库将托管一个vue3应用程序和一个基于vue3的库。我们将学习如何使用PNPM执行命令、如何并行运行命令，最后引入Nx实现更复杂的任务调度，包括命令缓存等功能。

## 前置条件

确保已安装以下软件：

| os | node | pnpm |
| --- | --- | --- |
| win11 | v24.13.0 | 10.10.0 |

## 初始化pnpm工作区

创建一个名为 `vue_monorepo` 的新目录，并进入该目录。然后运行 `pnpm init` 命令来初始化pnpm工作区。执行该命令后，将生成一个 `package.json` 文件，该文件将包含pnpm工作区的配置。
```bash
$ E:\notebook`>`mkdir vue_monorepo
$ cd vue_monorepo
$ pnpm init
```

工作区目录结构如下：

```txt
E:\notebook\vue_monorepo
└── package.json
```

如果需要把仓库用作为git仓库，请执行以下命令：

```bash
$ git init
```

在当前目录下创建 `.gitignore` 文件，并添加以下内容：

```txt
node_modules
dist
build
```

此时的目录结构如下：

```txt
E:\notebook\vue_monorepo
├── .git
├── .gitignore
└── package.json
```

## 设置Monorepo结构

单仓库的结构可能因使用目的而异。通常有两种类型的单仓库：

- 包中心化仓库用于开发和发布一组具有凝聚力的可复用包。这种架构在开源领域十分常见，如Angular、React、Vue等众多仓库均采用此模式。这类仓库通常包含一个 `packages` 文件夹，其内容常发布至NPM等公共注册库。

- 应用程序中心化仓库主要用于开发应用程序和产品，这是企业中常见的架构模式。此类仓库通常包含 `apps` 和 `packages` 或 `libs` 两个文件夹：`apps` 文件夹存放可构建和部署的应用程序，而 `packages` 或 `libs` 文件夹则存放专属于单个或多个应用程序的库文件，这些库在单仓库中协同开发。部分库文件仍可发布至公共注册表。

本文将采用"应用程序为中心"的方法，演示如何构建一个能够从单仓库内部消费包的应用程序。

在 `vue_monorepo` 文件夹下创建 `apps` 和 `packages` 两个文件夹。

```bash
$ mkdir apps packages
```

现在让我们配置 PNPM 以正确识别单仓库工作区。基本操作是在仓库根目录创建一个 `pnpm-workspace.yaml` 文件，用于定义我们的单仓库结构：

```yaml
packages:
  # executable/launchable applications
  - 'apps/*'
  # all packages in subdirs of packages/ and components/
  - 'packages/*'
```

此时的目录结构如下：

```txt
E:\notebook\vue_monorepo
├── .git
├── .gitignore
├── apps
├── package.json
├── packages
└── pnpm-workspace.yaml
```

添加依赖包：

```bash
$ pnpm add -D @nx/vite @nx/devkit @nx/vue -w
```

安装 Nx：

```bash
$ npx nx@latest init
```

此命令将创建一个 `nx.json` 文件，该文件包含 Nx 的核心配置。文件结构如下：

```txt
E:\notebook\vue_monorepo
├── .git
├── .gitignore
├── AGENTS.md
├── apps
├── node_modules
├── nx.json
├── package.json
├── packages
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

使用 `@nx/vue` 插件创建一个新的 `vue3` 应用：

```bash
$ npx nx g @nx/vue:app apps/my-app
```

创建成功后，目录结构如下：

```txt
E:\notebook\vue_monorepo
├── .git
├── .gitignore
├── .nx
├── .vscode
├── AGENTS.md
├── apps
|   ├── my-app
|   └── my-app-e2e
├── eslint.config.mjs
├── node_modules
├── nx.json
├── package.json
├── packages
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── vitest.workspace.ts
```

生成 `vue3` `library`，运行命令：

```bash
npx nx g @nx/vue:lib packages/my-lib
```

目录结构如下：

```text
E:\notebook\vue_monorepo
├── .git
├── .gitignore
├── .nx
├── .vscode
├── AGENTS.md
├── apps
├── eslint.config.mjs
├── node_modules
├── nx.json
├── package.json
├── packages
|   └── my-lib
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── vitest.workspace.ts
```

## 参考文档

[Setup a Monorepo with PNPM workspaces and speed it up with Nx!](https://nx.dev/blog/setup-a-monorepo-with-pnpm-workspaces-and-speed-it-up-with-nx)