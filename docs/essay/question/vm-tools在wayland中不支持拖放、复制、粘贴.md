---
lang: zh-CN
title: question
titleTemplate: vm-tools在wayland中不支持拖放、复制、粘贴
description: vm-tools在wayland中不支持拖放、复制、粘贴
head:
  - - meta
    - name: description
      content: vm-tools在wayland中不支持拖放、复制、粘贴
  - - meta
    - name: keywords
      content: vmware-tools open-vm-tools wayland 
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: true
footer: true
---
# vm-tools在wayland中不支持拖放、复制、粘贴

最近在使用vm-tools的时候，发现vmware-tools在Ubuntu 24.04 lst 和主机之间不支持拖放、复制、粘贴。查找资料发现是因为Ubuntu 24.04 lst 使用了wayland，不管是vmware-tools还是open-vm-tools都不支持使用了wayland的系统，如果想要支持拖放、复制、粘贴可以从wayland切换到x11。