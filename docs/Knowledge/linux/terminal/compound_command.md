---
lang: zh-CN
title: 复合命令
titleTemplate: Linux
description: 复合命令
head:
  - - meta
    - name: description
      content: 复合命令
  - - meta
    - name: keywords
      content: linux and or ;
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: true
footer: true
---
# 复合命令

## 命令组合的区别

| 符号 | 名称 | 含义 |
| :--: | :--: | :-- |
| `&&` | AND | 前一个成功，才执行后一个 |
| `\|\|` | OR | 前一个失败，才执行后一个 |
| `;` | 顺序 | 无条件依次执行 |

---

### `command1 && command2`

- `command1` **成功**（返回0）→ 执行 `command2`
- `command1` **失败**（返回非0）→ 跳过 `command2`

```bash
mkdir /tmp/test && cd /tmp/test
# 目录创建成功才进入
```

---

### `command3 || command4`

- `command3` **失败**（返回非0）→ 执行 `command4`
- `command3` **成功**（返回0）→ 跳过 `command4`

```bash
cd /tmp/test || mkdir /tmp/test
# 如果进入失败，就创建目录
```

---

### `command5 ; command6`

- **无条件**依次执行两者

```bash
cd /tmp/test ; ls -la
# 不管 cd 是否成功，ls 都会执行
```

---

### 组合使用

```bash
# 如果成功做A，失败做B
command1 && command2 || command3

# 等价于
if command1; then command2; else command3; fi

# 链式
command1 && command2 && command3
command1 || command2 || command3
```

### 退出码

- `&&` 和 `||` 会保留**最后一个执行的命令**的退出码
- `;` 保留**最后一个命令**的退出码