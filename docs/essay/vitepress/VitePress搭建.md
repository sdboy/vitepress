---
lang: zh-CN
title: VitePress
titleTemplate: VitePress个人文档服务搭建
description: VitePress个人文档服务搭建
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# VitePress个人文档服务搭建

![图片alt](../../public/xiaomai.jpg "xiaomai")

## 安装

### 依赖和准备

- Node.js 18 及以上版本。
- 通过命令行界面 (CLI) 访问 VitePress 的终端。
- 支持 Markdown 语法的编辑器。
  - 推荐 VSCode 及其官方 Vue 扩展。

先创建一个新文件夹，并进入该文件夹。

VitePress 可以单独使用，也可以安装到现有项目中。在这两种情况下，都可以使用以下方式安装它：<br>
```bash
$ pnpm add -D vitepress
```

跟据提示，输入以下命令，并跟据提示进行选择：<br>
```bash
$ pnpm approve-builds
```

### 安装向导

VitePress 附带一个命令行设置向导，可以帮助你构建一个基本项目。安装后，通过运行以下命令启动向导：<br>
```bash
$ pnpm vitepress init
```

将需要回答几个简单的问题：<br>
```bash
T  Welcome to VitePress!
|
o  Where should VitePress initialize the config?
|  ./docs
|
o  Site title:
|  blog
|
o  Site description:
|  A blog site
|
o  Theme:
|  Default Theme + Customization
|
o  Use TypeScript for config and theme files?
|  Yes
|
o  Add VitePress npm scripts to package.json?
|  Yes
|
—  Done! Now run pnpm run docs:dev and start writing.

Tips:
- Since you've chosen to customize the theme, you should also explicitly install vue as a dev dependency.
```
>注意：
Vue 作为 `peer dependency`
如果打算使用 Vue 组件或 API 进行自定义，还应该明确地将 `vue` 安装为 `dependency`。

添加vue作为开发依赖：<br>
```bash
$ pnpm add vue -D
```

## 文件结构

如果正在构建一个独立的 VitePress 站点，可以在当前目录 (`./`) 中搭建站点。但是，如果在现有项目中与其他源代码一起安装 VitePress，建议将站点搭建在嵌套目录 (例如 `./docs`) 中，以便它与项目的其余部分分开。

假设选择在 `./docs` 中搭建 VitePress 项目，生成的文件结构应该是这样的：<br>
```bash
.
├─ docs
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  ├─ index.ts
│  │  │  └─ style.css
│  │  └─ config.mts
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

`docs` 目录作为 VitePress 站点的项目根目录。.vitepress 目录是 VitePress 配置文件、开发服务器缓存、构建输出和可选主题自定义代码的位置。

>TIP<br>
默认情况下，VitePress 将其开发服务器缓存存储在 `.vitepress/cache` 中，并将生产构建输出存储在 `.vitepress/dist` 中。如果使用 Git，应该将它们添加到 `.gitignore` 文件中。也可以手动配置这些位置。<br>

### 配置文件

配置文件 (`.vitepress/config.mts`) 让你能够自定义 VitePress 站点的各个方面，最基本的选项是站点的标题和描述：<br>
```ts
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "blog",
  description: "A blog site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
```

还可以通过 `themeConfig` 选项配置主题的行为。有关所有配置选项的完整详细信息，请参见[配置参考](https://vitepress.dev/zh/reference/site-config)。<br>

### 源文件

`.vitepress` 目录之外的 Markdown 文件被视为源文件。

VitePress 使用 基于文件的路由：每个 `.md` 文件将在相同的路径被编译成为 `.html` 文件。例如，`index.md` 将会被编译成 `index.html`，可以在生成的 VitePress 站点的根路径 `/` 进行访问。

VitePress 还提供了生成简洁 URL、重写路径和动态生成页面的能力。这些将在[路由指南](https://vitepress.dev/zh/guide/routing)中进行介绍。

## 启动并运行

该工具还应该将以下 `npm` 脚本注入到 `package.json` 中：<br>
```json
{
  "devDependencies": {
    "vitepress": "^1.6.3",
    "vue": "^3.5.13"
  },
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

`docs:dev` 脚本将启动具有即时热更新的本地开发服务器。使用以下命令运行它：<br>
```bash [pnpm]
$ pnpm run docs:dev
```

除了 `npm` 脚本，还可以直接调用 VitePress：<br>
```bash
$ pnpm vitepress dev docs
```

更多的命令行用法请参见 [CLI 参考](https://vitepress.dev/zh/reference/cli)。

开发服务应该会运行在 `http://localhost:5173` 上。在浏览器中访问 URL 以查看新站点的运行情况吧！

## 下一步

- 想要进一步了解 Markdown 文件是怎么映射到对应的 HTML，请继续阅读[路由指南](https://vitepress.dev/zh/guide/routing)。

- 要了解有关可以在页面上执行的操作的更多信息，例如编写 Markdown 内容或使用 Vue 组件，请参见指南的“编写”部分。一个很好的起点是了解 [Markdown 扩展](https://vitepress.dev/zh/guide/markdown)。

- 要探索默认文档主题提供的功能，请查看[默认主题配置参考](https://vitepress.dev/zh/reference/default-theme-config)。

- 如果想进一步自定义站点的外观，参见扩展[默认主题](https://vitepress.dev/zh/guide/extending-default-theme)或者构建[自定义主题](https://vitepress.dev/zh/guide/custom-theme)。

- 文档成形以后，务必阅读[部署指南](https://vitepress.dev/zh/guide/deploy)。