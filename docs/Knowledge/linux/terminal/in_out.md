---
lang: zh-CN
title: linux 输入输出和重定向
titleTemplate: Linux
description: linux 输入输出和重定向
head:
  - - meta
    - name: description
      content: linux 输入输出和重定向
  - - meta
    - name: keywords
      content: linux 输入 输出 重定向 stdin stdout stderr redirect
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: true
footer: true
---
# linux 输入输出和重定向

## 1. 三个标准文件描述符

| 描述符 | 名称 | 默认目标 | 说明 |
| :--: | :--: | :--: | :-- |
| 0 | stdin | 键盘 | 标准输入 |
| 1 | stdout | 屏幕 | 标准输出 |
| 2 | stderr | 屏幕 | 标准错误 |

## 2. 基本重定向语法

### 输出重定向

```bash
command > file      # stdout 重定向到文件（覆盖）
command 1> file     # 同上，1可省略
command >> file     # stdout 重定向到文件（追加）

command 2> file     # stderr 重定向到文件
command 2>> file    # stderr 重定向到文件（追加）

command &> file     # stdout 和 stderr 都重定向
command &>> file    # 追加方式
```

### 输入重定向

```bash
command < file      # stdin 从文件读取
command << EOF      # Here Document，多行输入
command <<< "string" # Here String，单行输入
```

## 3. 管道 |

管道将前一个命令的 **stdout** 传递给下一个命令的 **stdin**：

```bash
command1 | command2 | command3
```

### 合并 stderr 和 stdout

```bash
command 2>&1 | other_cmd    # 传统写法
command |& other_cmd         # Bash 4+ 简化写法
```

> [!IMPORTANT]
>
> 管道的优先级比 `stdout` 和 `stderr` 优先级高，会先创建管道，让 `stdout` 指向管道，然后执行 `2>&1`。

## 4. 重定向顺序的重要性

```bash
# 正确：所有输出到文件
command > file.txt 2>&1

# 错误：只有stdout到文件，stderr到屏幕
command 2>&1 > file.txt
```

### 原理

Shell 从左到右解析重定向：

```bash
command > file.txt 2>&1
# 1. > file.txt  → stdout 指向文件
# 2. 2>&1       → stderr 指向 stdout（文件）

command 2>&1 > file.txt
# 1. 2>&1       → stderr 指向 stdout（屏幕）
# 2. > file.txt → stdout 指向文件
# 结果：stderr 仍在屏幕
```

## 5. 常用场景

### 丢弃输出

```bash
command > /dev/null 2>&1   # 丢弃所有输出
command &> /dev/null       # 同上，更简洁
```

### 同时保存和显示

```bash
command | tee output.txt        # stdout 保存并显示
command | tee -a output.txt     # 追加方式
command 2>&1 | tee output.txt  # 保存所有输出
```

### 分离输出和错误

```bash
command > output.txt 2> error.txt
```

### 管道配合 grep

```bash
# 过滤所有输出（包括错误）
command 2>&1 | grep "error"

# 只过滤 stdout
command | grep "error"

# 只过滤 stderr
command 2>&1 >/dev/null | grep "error"
```

## 6. Here Document 和 Here String

```bash
# 多行输入
cat << EOF
line 1
line 2
line 3
EOF

# 单行输入
grep "pattern" <<< "some text to search"
```

## 7. exec 重定向（永久生效）

```bash
exec > file.txt     # 此后所有 stdout 写入文件
exec 2>&1           # 此后所有 stderr 同 stdout
exec > /dev/tty     # 恢复输出到终端
```

## 8. 快速参考表

| 命令 | 作用 |
| :--: | :-- |
| `>` | stdout 重定向（覆盖） |
| `>>` | stdout 重定向（追加） |
| `2>` | stderr 重定向 |
| `2>&1` | stderr 指向 stdout |
| `&>` | 所有输出重定向 |
| `<` | stdin 重定向 |
| `<<` | Here Document |
| `<<<` | Here String |
| `\|` | 管道 |
| `\|&` | 管道 + 合并 stderr |
| `>/dev/null` | 丢弃输出 |

## 9. 常见错误

1. **顺序错误**：`2>&1 > file` ≠ `> file 2>&1`
2. **忘记管道不传 stderr**：只有 `|&` 才传 stderr
3. **文件权限**：重定向目标文件需有写权限
4. **引号遗漏**：包含空格的路径需加引号 `"path with spaces"`