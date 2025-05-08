---
lang: zh-CN
title: question
titleTemplate: 什么是 SSR(Server Side Render)
description: 什么是 SSR(Server Side Render)
head:
  - - meta
    - name: description
      content: 什么是 SSR(Server Side Render)
  - - meta
    - name: keywords
      content: 什么是 SSR(Server Side Render)
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: true
footer: true
---
# 什么是 SSR(Server Side Render)

好的，作为一名刚学前端的同学，我们用最简单的逻辑和大白话解释「**SSR（服务器端渲染）**」。

---

### **什么是 SSR？**
**SSR = 服务器直接吐出网页内容。**

传统动态网站（比如早期 PHP/Java/JSP 的页面）在浏览器请求网页时，**服务器已准备好了完整 HTML 内容**，一发送过来就可见，无需等待 JS 下载 + 浏览器执行。
而 SSR 就是这种早期思路的「现代化增强版」，让你用 React/Vue 等前端框架也能实现类似效果。

---

### **举个例子理解 SSR**
假设你做一个新闻网站，页面内容是实时变动的：

1. **客户端渲染（CSR，单页面应用 SPA）**
   浏览器下载空 HTML + JS ⇒ 靠 JS 从服务器拿数据 ⇒ 再生成 HTML 内容。
   🚫 可能用户要等几秒才看到新闻内容，体验不好。

2. **服务器端渲染（SSR，如 Next.js）**
   浏览器请求时，服务器直接把你正好需要看到的新闻内容打包成完整 HTML：
   `<div>头条新闻：房价又涨了</div>` ⇒ 直接发给浏览器。
   ✅ 用户秒开页面（数据和 HTML 一起到达），SEO 也好。

---

### **SSR vs CSR 对比**

| **特点**           | **SSR（服务器端渲染）**                     | **CSR（客户端渲染，SPA）**          |
|---------------------|--------------------------------------------|-----------------------------------|
| 首屏速度            | 好（HTML 提前生成）                       | 一般（依赖 JS 下载 + 执行）        |
| SEO（搜索引擎优化） | 好（服务器吐完整 HTML）                   | 差（搜索引擎看不到 JS 渲染内容）   |
| 动态数据渲染        | 好（可在页面生成时注入数据）               | 差（JS 异步请求数据）             |
| 交互体验            | 差（要 JS 加载完才能交互）                 | 好（单页跳转快，无刷新）          |
| 服务器压力          | 高（每次请求需生成 HTML）                  | 一般（HTML 固定）                  |
| 成本/开发效率       | 稍复杂（需要环境配置 Node.js 渲染）        | 简单（大厂“傻瓜式”模板成熟）       |

---

### **SSR 工作逻辑（简化）**

用户访问网站 ⇒ 服务器收到了 URL 请求 ⇒
用框架（如 Next.js）在 Node.js 中把 React 组件渲染成 HTML 字符串 ⇒
加上 CSS 内容 ⇒ 最后送出一个完整的网页。

✅ **好处**：
- 用户不等 JS 下载，内容直接显示。
- SEO 爬虫看见的是真实 HTML，不怕 JS。
- 既能服务渲染，也可退化成 SPA（在浏览器后接交互逻辑）。

---

### **为什么 SSR 重要**
你现在写的网页，如果最后搞成单页面应用（SPA），搜索引擎和聊天机器人（如微信抓取）都看不到内容。
SSR 让你在保持 SPA 便利性的同时，又能**把网页内容提前准备好，直接发给用户/蜘蛛**。

---

### **常见 SSR 框架**
| 框架         | 适用模板        |
|--------------|-----------------|
| Next.js      | React SSR       |
| Nuxt.js      | Vue SSR         |
| NestJS (with SSR) | Node.js 全栈 SSR  |
| SvelteKit    | Svelte SSR      |

→ 它们都默认支持在服务器端预先渲染 HTML。

---

### **SSR 的缺点**
1. 更复杂的部署环境（Node.js 环境服务器）
2. 开发体验比纯 SPA 稍重（因为涉及前后端联动逻辑）
3. 静态内容生成不如 **静态预渲染（如 Gatsby/Nuxt generate）** 快

---

### **适合 SSR 的项目类型**
- 电商平台（要求秒加载 + SEO）
- 内容资讯型网站（博客/帖子必须看得见）
- 营销页（对首屏速度敏感）
- 所有要求搜索引擎收录的网站

---

### **一句话总结 SSR**
> 假如把页面当作一个 App，SSR = 用户一开始撞见的页面都已被服务器提前“画”出来并传给浏览器，app.get('/') 就是现成 HTML。

如有问题可以继续问！