---
lang: zh-CN
title: VitePress
titleTemplate: Vite & Vue powered static site generator
description: VitePress
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
outline: 2
lastUpdated: Date
editLink: false
footer: true
prev:
  text: 'Markdown'
  link: '/api-examples'
next:
  text: 'Markdown'
  link: '/markdown-examples'
---
# example
first 例子 test

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  }
]
</script>

## Our Team

Say hello to our awesome team.

<VPTeamMembers size="small" :members />

### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />