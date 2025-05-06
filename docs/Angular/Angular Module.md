---
lang: zh-CN
title: Angular
titleTemplate: Angular 模块
description: Angular 模块
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: Angular Module SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
order: 1
---
# Angular 模块

## Angular核心概念之一：模块（module）

module：不同于Nodejs或ES6中的模块的模块，NG中模块就是一个抽象的容器，用于对组件进行分组。<br>
整个应用初始时有且只有一个主组件：AppComponent<br>

### 惰性加载特性模块

默认情况下，`NgModule` 都是急性加载的。意思是它会在应用加载时尽快加载，所有模块都是如此，无论是否立即要用。对于带有很多路由的大型应用，考虑使用惰性加载 —— 一种按需加载 `NgModule` 的模式。惰性加载可以减小初始包的尺寸，从而减少加载时间。